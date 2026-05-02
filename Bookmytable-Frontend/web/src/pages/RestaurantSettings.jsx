import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WeeklyScheduleEditor } from "@/components/booking/WeeklyScheduleEditor";
import { SpecialDaysManager } from "@/components/booking/SpecialDaysManager";
import { useAvailability } from "@/hooks/useAvailability";
import { useMyRestaurant } from "@/hooks/useRestaurantSettings";
import { Save, Clock, CalendarDays, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Helper to generate time slots for preview
const generateTimeSlots = (interval, duration) => {
  // Just a visual preview based on interval and duration
  const slots = [];
  let currentTime = 10 * 60; // 10:00 AM in minutes
  const endTime = 14 * 60; // 2:00 PM in minutes

  while (currentTime + duration <= endTime) {
    const hours = Math.floor(currentTime / 60);
    const mins = currentTime % 60;
    const endHours = Math.floor((currentTime + duration) / 60);
    const endMins = (currentTime + duration) % 60;

    slots.push(
      `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")} - ${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`
    );
    currentTime += interval;
  }
  return slots;
};

// Helper to convert HH:MM to minutes
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":");
  return parseInt(h, 10) * 60 + parseInt(m, 10);
};

// Helper to convert minutes to HH:MM
const minutesToTime = (mins) => {
  if (mins == null) return "00:00";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const mapBackendScheduleToFrontend = (apiSchedule) => {
  const dayMap = { mon: "monday", tue: "tuesday", wed: "wednesday", thu: "thursday", fri: "friday", sat: "saturday", sun: "sunday" };
  const uiSchedule = {};
  
  for (const [apiDay, uiDay] of Object.entries(dayMap)) {
    const dayData = apiSchedule[apiDay];
    if (!dayData || dayData.isClosed) {
      uiSchedule[uiDay] = { isOpen: false, slots: [] };
      continue;
    }
    
    const slots = [];
    if (dayData.breaks && dayData.breaks.length > 0) {
      let currentOpen = dayData.open;
      for (const brk of dayData.breaks) {
        slots.push({ open: minutesToTime(currentOpen), close: minutesToTime(brk.start) });
        currentOpen = brk.end;
      }
      slots.push({ open: minutesToTime(currentOpen), close: minutesToTime(dayData.close) });
    } else {
      slots.push({ open: minutesToTime(dayData.open), close: minutesToTime(dayData.close) });
    }
    
    uiSchedule[uiDay] = { isOpen: true, slots };
  }
  return uiSchedule;
};

const mapFrontendScheduleToBackend = (scheduleState) => {
  const dayMap = { monday: "mon", tuesday: "tue", wednesday: "wed", thursday: "thu", friday: "fri", saturday: "sat", sunday: "sun" };
  const backendSchedule = {};
  
  for (const [uiDay, apiDay] of Object.entries(dayMap)) {
    const dayData = scheduleState[uiDay] || { isOpen: false, slots: [] };
    
    if (!dayData.isOpen || !dayData.slots || dayData.slots.length === 0) {
      backendSchedule[apiDay] = { isClosed: true, open: 0, close: 0, breaks: [] };
      continue;
    }
    
    const sortedSlots = [...dayData.slots].sort((a, b) => timeToMinutes(a.open) - timeToMinutes(b.open));
    const open = timeToMinutes(sortedSlots[0].open);
    const close = timeToMinutes(sortedSlots[sortedSlots.length - 1].close);
    
    const breaks = [];
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      breaks.push({
        start: timeToMinutes(sortedSlots[i].close),
        end: timeToMinutes(sortedSlots[i + 1].open)
      });
    }
    
    backendSchedule[apiDay] = { isClosed: false, open, close, breaks };
  }
  return backendSchedule;
};

export default function AvailabilityManagement() {
  const { data: restaurant, isLoading: isLoadingRestaurant } = useMyRestaurant();
  const restaurantId = restaurant?._id; 
  
  const {
    data: availabilitySettings,
    isLoading: isAvailabilityLoading,
    updateSchedule,
    isUpdatingSchedule,
    updateSlotConfig,
    isUpdatingSlotConfig,
    addException,
    isAddingException,
    deleteException,
    isDeletingException,
  } = useAvailability(restaurantId);

  const [openingHours, setOpeningHours] = useState({});
  const [slotConfig, setSlotConfig] = useState({ timeSlotInterval: 30, slotDuration: 60 });
  const [policies, setPolicies] = useState({
    minGuestsPerBooking: 1,
    maxGuestsPerBooking: 10,
    advanceBookingDays: 30,
    cancellationPolicy: "",
    autoAcceptBookings: true,
    depositRequired: false,
    depositAmount: 0,
  });

  useEffect(() => {
    if (availabilitySettings) {
      if (availabilitySettings.openingHours) {
        setOpeningHours(mapBackendScheduleToFrontend(availabilitySettings.openingHours));
      }
      
      const settingsData = availabilitySettings.settings || {};
      
      setSlotConfig({
        timeSlotInterval: settingsData.timeSlotInterval || 30,
        slotDuration: settingsData.slotDuration || 60,
      });
      
      setPolicies(prev => ({ ...prev, ...settingsData }));
    }
  }, [availabilitySettings]);

  // --- Schedule Handlers ---
  const handleToggleDay = (day, data) => {
    setOpeningHours((prev) => {
      const existing = prev[day] || { isOpen: false, slots: [] };
      return {
        ...prev,
        [day]: { ...existing, ...data },
      };
    });
  };

  const handleAddSlot = (day) => {
    setOpeningHours((prev) => {
      const dayData = prev[day] || { isOpen: true, slots: [] };
      return {
        ...prev,
        [day]: { ...dayData, slots: [...dayData.slots, { open: "09:00", close: "17:00" }] },
      };
    });
  };

  const handleRemoveSlot = (day, index) => {
    setOpeningHours((prev) => {
      const dayData = prev[day];
      return {
        ...prev,
        [day]: { ...dayData, slots: dayData.slots.filter((_, i) => i !== index) },
      };
    });
  };

  const handleUpdateSlot = (day, index, field, value) => {
    setOpeningHours((prev) => {
      const dayData = prev[day];
      const newSlots = dayData.slots.map((s, i) => (i === index ? { ...s, [field]: value } : s));
      return {
        ...prev,
        [day]: { ...dayData, slots: newSlots },
      };
    });
  };

  const handleSaveSchedule = () => {
    // Validate
    for (const [day, data] of Object.entries(openingHours)) {
      if (data.isOpen && data.slots) {
        for (const slot of data.slots) {
          if (timeToMinutes(slot.open) >= timeToMinutes(slot.close)) {
            toast.error(`Invalid time range on ${day}. Open time must be before close time.`);
            return;
          }
        }
      }
    }
    
    const formattedPayload = mapFrontendScheduleToBackend(openingHours);
    updateSchedule(formattedPayload);
  };

  // --- Slot Config Handlers ---
  const handleSaveSlotConfig = () => {
    updateSlotConfig(slotConfig);
  };

  const slotPreview = useMemo(() => {
    return generateTimeSlots(slotConfig.timeSlotInterval, slotConfig.slotDuration);
  }, [slotConfig]);

  // --- Policy Handlers (Local for now if API not ready) ---
  const handlePolicyChange = (field, value) => {
    setPolicies(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePolicies = () => {
    toast.success("Booking policies saved successfully! (Local state updated)");
    // Call API here when backend is ready
  };

  if (isLoadingRestaurant || isAvailabilityLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Please set up your restaurant first to manage availability.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 lg:px-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Availability Management</h1>
              <p className="text-muted-foreground">Configure restaurant availability, booking schedule, and policies</p>
            </div>
          </div>

          <Tabs defaultValue="schedule" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="schedule" className="gap-2"><Clock className="h-4 w-4" /> Availability Schedule</TabsTrigger>
              <TabsTrigger value="special" className="gap-2"><CalendarDays className="h-4 w-4" /> Exceptions</TabsTrigger>
              <TabsTrigger value="booking" className="gap-2"><Settings className="h-4 w-4" /> Booking Policies</TabsTrigger>
            </TabsList>

            {/* Availability Schedule */}
            <TabsContent value="schedule" className="space-y-6">
              {/* Slot Config Section */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-lg font-semibold mb-4">Slot Configuration</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Label>Time Slot Interval (mins)</Label>
                      <Select
                        value={String(slotConfig.timeSlotInterval)}
                        onValueChange={(v) => setSlotConfig(prev => ({ ...prev, timeSlotInterval: Number(v) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 mins</SelectItem>
                          <SelectItem value="30">30 mins</SelectItem>
                          <SelectItem value="45">45 mins</SelectItem>
                          <SelectItem value="60">60 mins</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">How often slots are generated (e.g. 10:00, 10:30)</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Booking Duration (mins)</Label>
                      <Select
                        value={String(slotConfig.slotDuration)}
                        onValueChange={(v) => setSlotConfig(prev => ({ ...prev, slotDuration: Number(v) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 mins</SelectItem>
                          <SelectItem value="60">1 hr</SelectItem>
                          <SelectItem value="90">1.5 hrs</SelectItem>
                          <SelectItem value="120">2 hrs</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">How long a table is reserved for</p>
                    </div>

                    <Button onClick={handleSaveSlotConfig} disabled={isUpdatingSlotConfig} className="w-full">
                      {isUpdatingSlotConfig ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Slot Config
                    </Button>
                  </div>

                  {/* Slot Preview */}
                  <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                    <Label className="mb-3 block text-sm font-medium">Dynamic Slot Preview (10:00 AM - 2:00 PM)</Label>
                    <div className="flex flex-wrap gap-2">
                      {slotPreview.map((slot, i) => (
                        <div key={i} className="bg-background border text-xs px-2 py-1 rounded-md shadow-sm font-medium">
                          {slot}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Schedule Section */}
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Weekly Schedule</h3>
                  <Button onClick={handleSaveSchedule} disabled={isUpdatingSchedule}>
                    {isUpdatingSchedule ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Schedule
                  </Button>
                </div>
                <WeeklyScheduleEditor
                  openingHours={openingHours}
                  onToggleDay={handleToggleDay}
                  onAddSlot={handleAddSlot}
                  onRemoveSlot={handleRemoveSlot}
                  onUpdateSlot={handleUpdateSlot}
                />
              </div>
            </TabsContent>

            {/* Exceptions */}
            <TabsContent value="special">
               <div className="rounded-lg border border-border bg-card p-5">
                <SpecialDaysManager
                  specialDays={availabilitySettings?.settings?.specialDays || []}
                  onAdd={(data) => addException(data)}
                  onRemove={(date) => deleteException(date)}
                  isAdding={isAddingException}
                  isDeleting={isDeletingException}
                />
               </div>
            </TabsContent>

            {/* Booking Policies */}
            <TabsContent value="booking" className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-5 space-y-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Booking Policies</h3>
                  <Button onClick={handleSavePolicies}>
                    <Save className="mr-2 h-4 w-4" /> Save Policies
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block text-sm">Min Guests</Label>
                    <Input
                      type="number"
                      min={1}
                      value={policies.minGuestsPerBooking}
                      onChange={(e) => handlePolicyChange("minGuestsPerBooking", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Max Guests</Label>
                    <Input
                      type="number"
                      min={1}
                      value={policies.maxGuestsPerBooking}
                      onChange={(e) => handlePolicyChange("maxGuestsPerBooking", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block text-sm">Booking Window (Advance Booking Days)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={policies.advanceBookingDays}
                    onChange={(e) => handlePolicyChange("advanceBookingDays", Number(e.target.value))}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">How many days ahead customers can book</p>
                </div>

                <div>
                  <Label className="mb-1.5 block text-sm">Cancellation Policy</Label>
                  <Input
                    value={policies.cancellationPolicy}
                    onChange={(e) => handlePolicyChange("cancellationPolicy", e.target.value)}
                    placeholder="e.g., Free cancellation up to 2 hours before"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Auto-Accept Bookings</Label>
                    <p className="text-xs text-muted-foreground">Automatically confirm new reservations</p>
                  </div>
                  <Switch
                    checked={policies.autoAcceptBookings}
                    onCheckedChange={(v) => handlePolicyChange("autoAcceptBookings", v)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Require Deposit</Label>
                    <p className="text-xs text-muted-foreground">Charge a deposit at booking time</p>
                  </div>
                  <Switch
                    checked={policies.depositRequired}
                    onCheckedChange={(v) => handlePolicyChange("depositRequired", v)}
                  />
                </div>

                {policies.depositRequired && (
                  <div>
                    <Label className="mb-1.5 block text-sm">Deposit Amount (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={policies.depositAmount}
                      onChange={(e) => handlePolicyChange("depositAmount", Number(e.target.value))}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
