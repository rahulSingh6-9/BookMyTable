import { useState, useEffect, useMemo } from "react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Users, Check, AlertCircle, Loader2, Clock, MapPin, Grid, ShieldAlert, Layers, ArrowLeft, CreditCard, Receipt, Hash, Share2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRestaurantAvailability } from "@/services/booking.service";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { FloorPlanModal } from "./FloorPlanModal";

export function BookingSidebar({ restaurant }) {
  const { user } = useAuth();
  const { updateReservation, openCheckout, cartItems } = useCart();
  
  const allRestaurantTables = restaurant.tables || [];
  const settings = restaurant.settings || {};

  // Settings parsing
  const advanceBookingDays = settings.advanceBookingDays || 7;
  const minGuests = settings.minGuestsPerBooking || 1;
  const maxGuests = settings.maxGuestsPerBooking || 10;
  const timeSlotInterval = settings.timeSlotInterval || 30;
  const slotDuration = settings.slotDuration || settings.bookingSettings?.slotDurationMinutes || 60;
  const minAdvanceMinutes = settings.minimumAdvanceNoticeMinutes || 30;

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(minGuests);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [activeFloor, setActiveFloor] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [isFloorPlanOpen, setIsFloorPlanOpen] = useState(false);

  const dateStr = format(date, "yyyy-MM-dd");

  // Fetch true backend availability (checks overlaps)
  const { data: availabilityRes, isLoading: availabilityLoading } = useQuery({
    queryKey: ["availability", restaurant.slug || restaurant.restaurantId, dateStr, guests],
    queryFn: () => getRestaurantAvailability(restaurant.slug || restaurant.restaurantId, dateStr, guests),
  });

  // Reset selections when filters change
  useEffect(() => {
    setSelectedTableId(null);
    setBookingError("");
  }, [dateStr, guests, time]);

  // Generate selectable dates dynamically
  const availableDates = useMemo(() => {
    const dates = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < advanceBookingDays; i++) {
      dates.push(addDays(today, i));
    }
    return dates;
  }, [advanceBookingDays]);

  // Generate Time Slots dynamically
  const generatedSlots = useMemo(() => {
    const dayIndex = date.getDay();
    const DAYS_OF_WEEK = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayName = DAYS_OF_WEEK[dayIndex];
    
    const daySchedule = settings?.openingHours?.[dayName];
    if (!daySchedule || daySchedule.isClosed) return [];

    const startMins = daySchedule.open || 600; 
    const endMins = daySchedule.close || 1320; 

    const slots = [];
    const now = new Date();
    const isToday = isSameDay(date, now);
    const currentMinsFromMidnight = now.getHours() * 60 + now.getMinutes();

    for (let m = startMins; m <= endMins - slotDuration; m += timeSlotInterval) {
      if (isToday && m < (currentMinsFromMidnight + minAdvanceMinutes)) {
        continue;
      }
      const hh = Math.floor(m / 60).toString().padStart(2, '0');
      const mm = (m % 60).toString().padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
    return slots;
  }, [date, settings, slotDuration, timeSlotInterval, minAdvanceMinutes]);

  useEffect(() => {
    if (generatedSlots.length > 0 && (!time || !generatedSlots.includes(time))) {
      setTime(generatedSlots[0]);
    } else if (generatedSlots.length === 0) {
      setTime("");
    }
  }, [generatedSlots, time]);

  // Filter Tables matching capacity, status, and backend availability
  const backendAvailableTables = availabilityRes?.data?.data?.tables || [];
  
  const matchingTables = backendAvailableTables.filter(t => {
    if (t.capacity < guests) return false;
    if (t.status !== "available") return false;
    if (!t.availableSlots || !t.availableSlots.includes(time)) return false;
    return true;
  });

  const { floorGroups, floorNames } = useMemo(() => {
    const groups = {};
    matchingTables.forEach(table => {
      const fullTable = allRestaurantTables.find(t => String(t._id) === String(table.id)) || table;
      const floorName = fullTable.floorLabel || fullTable.floor || "Main Floor";
      const sectionName = fullTable.sectionLabel || fullTable.section || "Main Area";

      if (!groups[floorName]) groups[floorName] = {};
      if (!groups[floorName][sectionName]) groups[floorName][sectionName] = [];
      
      groups[floorName][sectionName].push({ ...table, fullTable });
    });
    return { floorGroups: groups, floorNames: Object.keys(groups) };
  }, [matchingTables, allRestaurantTables]);

  useEffect(() => {
    if (floorNames.length > 0 && (!activeFloor || !floorNames.includes(activeFloor))) {
      setActiveFloor(floorNames[0]);
    }
  }, [floorNames, activeFloor]);

  const selectedTableObj = matchingTables.find(t => t.id === selectedTableId);
  const fullSelectedTable = selectedTableObj ? (allRestaurantTables.find(t => String(t._id) === String(selectedTableObj.id)) || selectedTableObj) : null;

  // Actions
  const handleReviewAndCheckout = () => {
    if (!user) {
      setBookingError("Please login to proceed with reservation");
      return;
    }
    setBookingError("");
    
    // Sync to Cart Context
    updateReservation({
      date,
      time,
      guests,
      tableId: selectedTableId,
      tableType: fullSelectedTable?.type || "indoor"
    });
    
    openCheckout();
  };

  // Missing Tables Fallback
  if (allRestaurantTables.length === 0) {
    return (
      <div className="sticky top-24 space-y-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-xl relative overflow-hidden text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-bold text-card-foreground">Reservations Unavailable</h3>
          <p className="text-sm text-muted-foreground mt-2">No seating configured for this restaurant.</p>
        </div>
      </div>
    );
  }

  // Define animation variants for smooth step transitions
  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20, transition: { duration: 0.15 } }
  };

  return (
    <>
      <FloorPlanModal isOpen={isFloorPlanOpen} onClose={() => setIsFloorPlanOpen(false)} restaurant={restaurant} />
      
      <div className="sticky top-24 flex flex-col max-h-[calc(100vh-40px)] overflow-y-auto custom-scrollbar rounded-xl shadow-xl border border-border">
        <div className="bg-card relative flex flex-col min-h-[750px] overflow-hidden">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent z-10" />

          <AnimatePresence mode="wait">
            
            {/* STEP 1: SELECTION */}
            <motion.div key="selection" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col h-full p-6">
              <h3 className="text-xl font-bold text-card-foreground mb-4 shrink-0">Reserve a Table</h3>
                
                {bookingError && (
                  <div className="mb-4 shrink-0 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {bookingError}
                  </div>
                )}

                {/* DATE, TIME, GUESTS SELECTORS */}
                <div className="space-y-4 mb-6 shrink-0 bg-muted/30 p-4 rounded-xl border border-border/40">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground/80">Date</label>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {availableDates.map(d => {
                        const isSelected = isSameDay(date, d);
                        return (
                          <button key={d.toString()} onClick={() => setDate(d)} className={cn("flex-shrink-0 flex flex-col items-center justify-center rounded-lg border p-2 min-w-[65px] transition-all", isSelected ? "border-primary bg-primary text-primary-foreground shadow-md" : "border-border bg-background hover:border-primary/50 text-muted-foreground hover:text-foreground")}>
                            <span className="text-[11px] uppercase font-bold tracking-wider opacity-90">{format(d, "EEE")}</span>
                            <span className="text-lg font-black mt-0.5">{format(d, "dd")}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-foreground/80">Time</label>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 hover:border-primary/50 transition-colors focus-within:ring-2 focus-within:ring-primary/20">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer">
                          {generatedSlots.length === 0 && <option value="">Closed</option>}
                          {generatedSlots.map((slot) => {
                            const [h, m] = slot.split(':');
                            const d = new Date(); d.setHours(Number(h), Number(m));
                            return <option key={slot} value={slot}>{format(d, "h:mm a")}</option>;
                          })}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-foreground/80">Guests</label>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 hover:border-primary/50 transition-colors focus-within:ring-2 focus-within:ring-primary/20">
                        <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer">
                          {Array.from({ length: maxGuests - minGuests + 1 }, (_, i) => i + minGuests).map((n) => (
                            <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AVAILABLE TABLES LIST */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <label className="text-sm font-bold text-card-foreground flex items-center gap-2">
                      <Grid className="h-4 w-4 text-primary" /> Available Tables
                    </label>
                    {availabilityLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  </div>

                  {generatedSlots.length === 0 ? (
                    <div className="rounded-xl bg-muted p-6 text-center border border-border/50 flex flex-col items-center justify-center flex-1">
                      <Clock className="h-8 w-8 text-muted-foreground/50 mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">No time slots available for this date.</p>
                    </div>
                  ) : !availabilityLoading && matchingTables.length === 0 ? (
                    <div className="rounded-xl bg-muted p-6 text-center border border-border/50 flex flex-col items-center justify-center flex-1">
                      <AlertCircle className="h-8 w-8 text-muted-foreground/50 mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">No tables available at {time} for {guests} guests.</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                      {floorNames.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-3 shrink-0 scrollbar-hide border-b border-border/40 mb-3">
                          {floorNames.map(floor => (
                            <button key={floor} onClick={() => setActiveFloor(floor)} className={cn("px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm", activeFloor === floor ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground")}>
                              {floor}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex-1 pb-4 space-y-5">
                        {activeFloor && floorGroups[activeFloor] && Object.entries(floorGroups[activeFloor]).map(([sectionName, sectionTables]) => (
                          <div key={sectionName} className="space-y-3">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                              <Layers className="h-3.5 w-3.5" /> {sectionName}
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {sectionTables.map(({ fullTable, ...table }) => (
                                <button key={table.id} onClick={() => setSelectedTableId(table.id)} className={cn("group relative flex flex-col rounded-xl border p-3 text-left transition-all overflow-hidden", selectedTableId === table.id ? "border-primary bg-primary/5 ring-1 ring-primary shadow-md" : "border-border bg-card hover:border-primary/40 hover:shadow-sm")}>
                                  {selectedTableId === table.id && <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 rounded-bl-full -z-10" />}
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-sm text-foreground">{fullTable.tableCode || fullTable.name}</span>
                                    {fullTable.requiresDeposit && <ShieldAlert className="h-3.5 w-3.5 text-orange-500" />}
                                  </div>
                                  <div className="mt-auto space-y-1">
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Users className="h-3 w-3 opacity-70" /> {table.capacity} max</span>
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><MapPin className="h-3 w-3 opacity-70" /> {table.type}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="shrink-0 pt-4 border-t border-border mt-auto space-y-3 pb-2">
                  <Button variant="outline" onClick={() => setIsFloorPlanOpen(true)} className="w-full h-10 border-dashed border-2 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors flex items-center justify-center gap-2 font-semibold">
                  <MapPin className="h-4 w-4" /> View Visual Floor Plan
                </Button>

                <Button className="w-full h-12 text-base font-black shadow-lg hover:shadow-xl transition-all relative overflow-hidden group" disabled={!time || !selectedTableId} onClick={handleReviewAndCheckout}>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10">Review & Checkout {cartItems.length > 0 ? `(${cartItems.length} items)` : ''}</span>
                </Button>
              </div>
            </motion.div>
            
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
