import { useState, useEffect, useMemo } from "react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Clock, Loader2, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRestaurantAvailability } from "@/services/booking.service";
import { socket, joinRestaurantRoom, leaveRestaurantRoom } from "@/services/socket";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ReservationSection({ restaurant }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const settings = restaurant.settings || {};

  const advanceBookingDays = settings.advanceBookingDays || 7;
  const minGuests = settings.minGuestsPerBooking || 1;
  const maxGuests = settings.maxGuestsPerBooking || 10;
  const timeSlotInterval = settings.timeSlotInterval || 30;
  const slotDuration = settings.slotDuration || settings.bookingSettings?.slotDurationMinutes || 60;
  const minAdvanceMinutes = settings.minimumAdvanceNoticeMinutes || 30;

  const [date, setDate] = useState(startOfDay(new Date()));
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2 >= minGuests && 2 <= maxGuests ? 2 : minGuests);

  const dateStr = format(date, "yyyy-MM-dd");

  const restId = restaurant._id || restaurant.restaurantId || restaurant.id;
  const restSlug = restaurant.slug || restaurant.restaurantId;

  const { data: availabilityRes, isLoading: availabilityLoading } = useQuery({
    queryKey: ["availability", restSlug, dateStr, guests],
    queryFn: () => getRestaurantAvailability(restSlug, dateStr, guests),
  });

  // Real-time table availability updates via Socket.io
  useEffect(() => {
    if (!restId) return;

    joinRestaurantRoom(restId);

    const handleAvailabilityChange = (evt) => {
      if (String(evt.restaurantId) === String(restId)) {
        queryClient.invalidateQueries({
          queryKey: ["availability", restSlug],
        });
      }
    };

    socket.on("table:availability_changed", handleAvailabilityChange);

    return () => {
      socket.off("table:availability_changed", handleAvailabilityChange);
      leaveRestaurantRoom(restId);
    };
  }, [restId, restSlug, queryClient]);

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

  const backendAvailableTables = availabilityRes?.data?.data?.tables || [];
  const backendAvailableSlots = availabilityRes?.data?.data?.slots || [];
  
  const matchingTables = backendAvailableTables.filter(t => {
    if (t.capacity < guests) return false;
    if (t.status !== "available") return false;
    if (!t.availableSlots || !t.availableSlots.includes(time)) return false;
    return true;
  });

  const isFastFilling = matchingTables.length > 0 && matchingTables.length <= 2;
  
  // Next available slot logic
  let nextAvailableSlot = null;
  if (matchingTables.length === 0 && time) {
    nextAvailableSlot = backendAvailableSlots.find(s => s > time);
  }

  const handleContinue = () => {
    if (!time) return;
    navigate(`/restaurant/${restaurant.slug}/book?date=${dateStr}&time=${time}&guests=${guests}`);
  };

  // UI rendering helpers
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(':');
    const d = new Date(); d.setHours(Number(h), Number(m));
    return format(d, "h:mm a");
  };

  return (
    <div className="w-full relative z-20">
        {/* RESERVATION BAR */}
        <div className="bg-card border border-border shadow-md rounded-2xl p-4 lg:p-6 mb-8">
          
          <div className="flex flex-col gap-8 mb-6">
            
            {/* DATE SELECTOR (Horizontal Scroll) */}
            <div className="w-full overflow-hidden">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> Date
              </label>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {availableDates.map(d => {
                  const isSelected = isSameDay(date, d);
                  const isToday = isSameDay(startOfDay(new Date()), d);
                  return (
                    <button 
                      key={d.toString()} 
                      onClick={() => setDate(d)} 
                      className={cn(
                        "flex-shrink-0 flex flex-col items-center justify-center rounded-xl border-2 px-6 py-3 min-w-[85px] transition-all", 
                        isSelected ? "border-primary bg-primary/5 text-primary" : "border-transparent bg-muted hover:bg-muted/80 text-muted-foreground"
                      )}
                    >
                      <span className="text-[11px] uppercase font-bold tracking-widest">{isToday ? "TODAY" : format(d, "MMM")}</span>
                      <span className="text-xl font-black mt-1">{format(d, "dd")}</span>
                      <span className="text-[11px] font-semibold mt-1 uppercase">{format(d, "EEE")}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TIME SELECTOR (Vertical Sections) */}
            <div className="w-full">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Time
              </label>
              {generatedSlots.length === 0 ? (
                <div className="h-[76px] flex items-center text-sm font-medium text-muted-foreground">Closed on this date</div>
              ) : (
                <div className="flex flex-col gap-6">
                  {[
                    { label: "Morning", filter: (h) => h < 16 },
                    { label: "Evening", filter: (h) => h >= 16 && h < 20 },
                    { label: "Night", filter: (h) => h >= 20 }
                  ].map(({ label, filter }) => {
                    const sectionSlots = generatedSlots.filter(slot => {
                      const h = Number(slot.split(':')[0]);
                      return filter(h);
                    });
                    
                    if (sectionSlots.length === 0) return null;
                    
                    return (
                      <div key={label} className="w-full">
                        <div className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {label}
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide items-center">
                          {sectionSlots.map((slot) => {
                            const isSelected = time === slot;
                            const isAvailable = backendAvailableSlots.includes(slot);
                            
                            return (
                              <button 
                                key={slot} 
                                onClick={() => setTime(slot)}
                                className={cn(
                                  "flex-shrink-0 rounded-xl border-2 px-6 py-2.5 text-sm font-bold transition-all whitespace-nowrap",
                                  isSelected ? "border-primary bg-primary text-primary-foreground shadow-md" : 
                                  isAvailable ? "border-border bg-card hover:border-primary/50 text-foreground" :
                                  "border-border/50 bg-muted/30 text-muted-foreground/50 opacity-50 hover:bg-muted"
                                )}
                              >
                                {formatTime(slot)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* GUEST SELECTOR */}
            <div className="w-full sm:w-1/2 md:w-1/3 xl:w-1/4 shrink-0">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" /> Guests
              </label>
              <Select value={guests.toString()} onValueChange={(val) => setGuests(Number(val))}>
                <SelectTrigger className="w-full h-[56px] rounded-xl border-2 border-border/60 bg-muted/20 px-4 text-lg font-bold text-foreground hover:border-green-500/50 hover:bg-green-50/50 focus:ring-0 focus:border-green-500 focus:bg-transparent transition-all outline-none data-[state=open]:border-green-500 data-[state=open]:bg-transparent">
                  <SelectValue placeholder="Select guests" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60 shadow-xl p-1 z-50">
                  {Array.from({ length: maxGuests - minGuests + 1 }, (_, i) => i + minGuests).map((n) => (
                    <SelectItem 
                      key={n} 
                      value={n.toString()} 
                      className="text-base font-semibold cursor-pointer rounded-lg hover:bg-green-50 focus:bg-green-500/10 focus:text-green-700 transition-colors py-2.5"
                    >
                      {n} {n === 1 ? "Guest" : "Guests"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* STATUS INDICATORS & CONTINUE */}
          {time && (
            <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-2">
              <div className="flex items-center gap-4">
                {availabilityLoading ? (
                  <div className="flex items-center gap-2 text-primary font-medium text-sm animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" /> Checking availability...
                  </div>
                ) : matchingTables.length === 0 ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20">
                      <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> Full at {formatTime(time)}
                    </div>
                    {nextAvailableSlot && (
                      <button onClick={() => setTime(nextAvailableSlot)} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                        Next available: {formatTime(nextAvailableSlot)} <Clock className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-bold border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
                    </div>
                    {isFastFilling && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-sm font-bold border border-orange-500/20">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Fast Filling
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleContinue} 
                disabled={!time || matchingTables.length === 0}
                className="gap-2 px-8 h-12 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

        </div>
    </div>
  );
}
