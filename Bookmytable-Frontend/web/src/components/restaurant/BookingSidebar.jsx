import { useState, useEffect, useMemo } from "react";
import { format, addDays, isSameDay, isBefore, addMinutes, parse, startOfDay } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Users, Check, AlertCircle, Loader2, Clock, MapPin, Grid, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getRestaurantAvailability, createBooking } from "@/services/booking.service";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export function BookingSidebar({ restaurant }) {
  const { user } = useAuth();
  
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
  const [booked, setBooked] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const dateStr = format(date, "yyyy-MM-dd");

  // Fetch true backend availability (checks overlaps)
  const { data: availabilityRes, isLoading: availabilityLoading } = useQuery({
    queryKey: ["availability", restaurant.restaurantId, dateStr, guests],
    queryFn: () => getRestaurantAvailability(restaurant.restaurantId, dateStr, guests),
  });

  const bookMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      setBooked(true);
      setBookingError("");
    },
    onError: (err) => {
      setBookingError(err.response?.data?.message || "Failed to book table");
    }
  });

  // Reset selections when filters change
  useEffect(() => {
    setSelectedTableId(null);
    setBookingError("");
  }, [dateStr, guests, time]);

  // Generate selectable dates dynamically (Next X days)
  const availableDates = useMemo(() => {
    const dates = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < advanceBookingDays; i++) {
      dates.push(addDays(today, i));
    }
    return dates;
  }, [advanceBookingDays]);

  // Generate Time Slots dynamically for the selected date
  const generatedSlots = useMemo(() => {
    const dayIndex = date.getDay();
    const DAYS_OF_WEEK = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayName = DAYS_OF_WEEK[dayIndex];
    
    const daySchedule = settings?.openingHours?.[dayName];
    if (!daySchedule || daySchedule.isClosed) return [];

    const startMins = daySchedule.open || 600; // 10:00 AM
    const endMins = daySchedule.close || 1320; // 10:00 PM

    const slots = [];
    const now = new Date();
    const isToday = isSameDay(date, now);
    
    // Calculate current minutes from midnight to enforce minimumAdvanceNoticeMinutes
    const currentMinsFromMidnight = now.getHours() * 60 + now.getMinutes();

    for (let m = startMins; m <= endMins - slotDuration; m += timeSlotInterval) {
      if (isToday && m < (currentMinsFromMidnight + minAdvanceMinutes)) {
        continue; // Skip slots that are too soon
      }
      const hh = Math.floor(m / 60).toString().padStart(2, '0');
      const mm = (m % 60).toString().padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
    
    return slots;
  }, [date, settings, slotDuration, timeSlotInterval, minAdvanceMinutes]);

  // Auto-select first available time slot if time is empty or invalid
  useEffect(() => {
    if (generatedSlots.length > 0 && (!time || !generatedSlots.includes(time))) {
      setTime(generatedSlots[0]);
    } else if (generatedSlots.length === 0) {
      setTime("");
    }
  }, [generatedSlots, time]);

  const handleBook = () => { 
    if (time && selectedTableId) {
      if (!user) {
        setBookingError("Please login to book a table");
        return;
      }
      const selectedTable = allRestaurantTables.find(t => t._id === selectedTableId || t.id === selectedTableId);
      
      bookMutation.mutate({
        restaurantId: restaurant.restaurantId,
        tableId: selectedTableId,
        date: dateStr,
        time: time,
        guests,
        tableType: selectedTable?.type || "indoor"
      });
    }
  };

  // If the restaurant hasn't configured any tables globally
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

  // Filter Tables matching capacity, status, and backend availability
  const backendAvailableTables = availabilityRes?.data?.data?.tables || [];
  
  const matchingTables = backendAvailableTables.filter(t => {
    if (t.capacity < guests) return false;
    if (t.status !== "available") return false;
    // The backend `availableSlots` array must include our selected time!
    if (!t.availableSlots || !t.availableSlots.includes(time)) return false;
    return true;
  });

  const selectedTableObj = matchingTables.find(t => t.id === selectedTableId);

  return (
    <div className="sticky top-24 space-y-4">
      <div className="rounded-xl border border-border bg-card p-6 shadow-xl relative overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />

        <AnimatePresence mode="wait">
          {booked ? (
            <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground">Confirmed!</h3>
              <p className="mt-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg inline-block text-left w-full mt-4">
                <span className="block font-semibold text-foreground mb-1">{restaurant.branchName || restaurant.name}</span>
                <span className="flex items-center gap-2 mb-1"><CalendarIcon className="h-3.5 w-3.5" /> {format(date, "PPP")}</span>
                <span className="flex items-center gap-2 mb-1"><Clock className="h-3.5 w-3.5" /> {time}</span>
                <span className="flex items-center gap-2 mb-1"><Users className="h-3.5 w-3.5" /> {guests} Guests ({selectedTableObj?.name || selectedTableObj?.tableCode || "Table"})</span>
              </p>
              <Button variant="outline" className="mt-6 w-full" onClick={() => setBooked(false)}>Book Another Table</Button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="mb-5 text-xl font-bold text-card-foreground">Reserve a Table</h3>
              
              {bookingError && (
                <div className="mb-5 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {bookingError}
                </div>
              )}

              {/* 1. DATE, TIME, GUESTS SELECTORS */}
              <div className="space-y-4 mb-6">
                
                {/* Date Horizontal Scroll or Picker */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-card-foreground">Date</label>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {availableDates.map(d => {
                      const isSelected = isSameDay(date, d);
                      return (
                        <button
                          key={d.toString()}
                          onClick={() => setDate(d)}
                          className={cn(
                            "flex-shrink-0 flex flex-col items-center justify-center rounded-lg border p-2 min-w-[60px] transition-all",
                            isSelected 
                              ? "border-primary bg-primary text-primary-foreground shadow-sm" 
                              : "border-input bg-background hover:border-primary/50 text-foreground"
                          )}
                        >
                          <span className="text-xs uppercase font-medium opacity-80">{format(d, "EEE")}</span>
                          <span className="text-lg font-bold">{format(d, "dd")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Time */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-card-foreground">Time</label>
                    <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2.5 hover:border-accent transition-colors">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-transparent text-sm text-foreground outline-none cursor-pointer">
                        {generatedSlots.length === 0 && <option value="">Closed</option>}
                        {generatedSlots.map((slot) => {
                          // Format 24h to 12h for display
                          const [h, m] = slot.split(':');
                          const d = new Date();
                          d.setHours(Number(h), Number(m));
                          return (
                            <option key={slot} value={slot}>{format(d, "h:mm a")}</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-card-foreground">Guests</label>
                    <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2.5 hover:border-accent transition-colors">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-transparent text-sm text-foreground outline-none cursor-pointer">
                        {Array.from({ length: maxGuests - minGuests + 1 }, (_, i) => i + minGuests).map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. AVAILABLE TABLES LIST */}
              <div className="mb-6">
                <label className="mb-2.5 block text-sm font-semibold text-card-foreground flex items-center justify-between">
                  <span>Available Tables</span>
                  {availabilityLoading && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
                </label>

                {generatedSlots.length === 0 ? (
                  <div className="rounded-lg bg-muted p-4 text-center border border-border">
                    <p className="text-sm font-medium text-muted-foreground">No time slots available for this date.</p>
                  </div>
                ) : !availabilityLoading && matchingTables.length === 0 ? (
                  <div className="rounded-lg bg-muted p-4 text-center border border-border">
                    <p className="text-sm font-medium text-muted-foreground">No tables available at {time} for {guests} guests.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-1">
                    {matchingTables.map((table) => {
                      // Lookup full table object from restaurant.tables to get missing fields like tableCode, features, requiresDeposit
                      // if they weren't fully propagated by the backend API.
                      const fullTable = allRestaurantTables.find(t => String(t._id) === String(table.id)) || table;

                      return (
                        <button
                          key={table.id}
                          onClick={() => setSelectedTableId(table.id)}
                          className={cn(
                            "rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5",
                            selectedTableId === table.id 
                              ? "border-primary bg-primary/10 ring-1 ring-primary shadow-sm" 
                              : "border-input bg-background hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Grid className={cn("h-4 w-4", selectedTableId === table.id ? "text-primary" : "text-muted-foreground")} />
                              <span className="font-bold text-sm text-foreground">{fullTable.tableCode || fullTable.name}</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                              Available
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1 font-medium"><Users className="h-3 w-3" /> {table.capacity} People</span>
                            <span className="flex items-center gap-1 font-medium"><MapPin className="h-3 w-3" /> {table.type}</span>
                          </div>

                          {(fullTable.features?.length > 0 || fullTable.requiresDeposit) && (
                            <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/50">
                              {fullTable.requiresDeposit && (
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded">
                                  <ShieldAlert className="h-3 w-3" /> Deposit Required
                                </span>
                              )}
                              {fullTable.features?.map(f => (
                                <span key={f} className="text-[10px] uppercase font-bold tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                  {f.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button 
                className="w-full h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all" 
                disabled={!time || !selectedTableId || bookMutation.isPending} 
                onClick={handleBook}
              >
                {bookMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : selectedTableId ? `Book ${selectedTableObj?.tableCode || selectedTableObj?.name}` : "Select a Table"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
