import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Info, Loader2, Activity } from "lucide-react";

import { RoomSelector } from "@/components/visual-layout/RoomSelector";
import { LayoutViewer } from "@/components/visual-layout/LayoutViewer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { mockBookings } from "@/lib/mockData";
import { useLayout } from "@/hooks/useLayout";
import { useAvailability } from "@/hooks/useAvailability";
import { useMyRestaurant } from "@/hooks/useRestaurantSettings";
import { WeeklyScheduleEditor } from "@/components/booking/WeeklyScheduleEditor";
import { SpecialDaysManager } from "@/components/booking/SpecialDaysManager";

// --- Helpers for slot config ---
const generateTimeSlots = (interval, duration) => {
  const slots = [];
  let currentTime = 10 * 60; // 10:00 AM
  const endTime = 14 * 60; // 2:00 PM
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

// --- Helpers for schedule mapping ---
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":");
  return parseInt(h, 10) * 60 + parseInt(m, 10);
};

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

// --- Helpers for live map ---
const liveTimeSlots = ["18:00", "19:00", "20:00", "21:00"];

function getStatusFromBookings({ tableId, date, slot }) {
  const b = mockBookings.find((x) => x.table === tableId && x.date === date && x.time === slot);
  if (!b) return "available";
  if (b.status === "confirmed") return "reserved";
  if (b.status === "completed") return "occupied";
  if (b.status === "pending") return "reserved";
  return "available";
}


export default function OwnerAvailabilitySchedule() {
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

  const { rooms, activeRoom, activeRoomId, setActiveRoomId } = useLayout(restaurantId);

  // Live Map State
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState("19:00");
  const [selected, setSelected] = useState(null);

  // Settings State
  const [openingHours, setOpeningHours] = useState({});
  const [slotConfig, setSlotConfig] = useState({ timeSlotInterval: 30, slotDuration: 60 });

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
    }
  }, [availabilitySettings]);

  // --- Handlers: Weekly Schedule ---
  const handleToggleDay = (day, data) => {
    setOpeningHours((prev) => ({ ...prev, [day]: { ...(prev[day] || { isOpen: false, slots: [] }), ...data } }));
  };
  const handleAddSlot = (day) => {
    setOpeningHours((prev) => {
      const dayData = prev[day] || { isOpen: true, slots: [] };
      return { ...prev, [day]: { ...dayData, slots: [...dayData.slots, { open: "09:00", close: "17:00" }] } };
    });
  };
  const handleRemoveSlot = (day, index) => {
    setOpeningHours((prev) => {
      const dayData = prev[day];
      return { ...prev, [day]: { ...dayData, slots: dayData.slots.filter((_, i) => i !== index) } };
    });
  };
  const handleUpdateSlot = (day, index, field, value) => {
    setOpeningHours((prev) => {
      const dayData = prev[day];
      const newSlots = dayData.slots.map((s, i) => (i === index ? { ...s, [field]: value } : s));
      return { ...prev, [day]: { ...dayData, slots: newSlots } };
    });
  };
  const handleSaveSchedule = () => {
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

  // --- Handlers: Slot Config ---
  const handleSaveSlotConfig = () => {
    updateSlotConfig(slotConfig);
  };
  const slotPreview = useMemo(() => {
    return generateTimeSlots(slotConfig.timeSlotInterval, slotConfig.slotDuration);
  }, [slotConfig]);

  // --- Live Map Data ---
  const legend = useMemo(
    () => [
      { label: "Available", status: "available", className: "bg-emerald-50 text-emerald-700 border-emerald-500/30" },
      { label: "Reserved", status: "reserved", className: "bg-amber-50 text-amber-700 border-amber-500/30" },
      { label: "Occupied", status: "occupied", className: "bg-destructive/5 text-destructive border-destructive/20" },
    ],
    []
  );
  const getTableStatus = (table) => getStatusFromBookings({ tableId: table._id, date, slot });

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
      <div className="container mx-auto px-4 py-8 lg:px-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Availability & Schedule</h1>
              <p className="text-muted-foreground">Manage live booking availability, schedules, and operational runtime.</p>
            </div>
          </div>

          <Tabs defaultValue="live" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="live" className="gap-2"><Activity className="h-4 w-4" /> Live Runtime</TabsTrigger>
              <TabsTrigger value="schedule" className="gap-2"><Clock className="h-4 w-4" /> Weekly Schedule</TabsTrigger>
              <TabsTrigger value="special" className="gap-2"><CalendarDays className="h-4 w-4" /> Exceptions</TabsTrigger>
              <TabsTrigger value="slots" className="gap-2"><Clock className="h-4 w-4" /> Slot Config</TabsTrigger>
            </TabsList>

            {/* TAB: LIVE RUNTIME */}
            <TabsContent value="live" className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end justify-end mb-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" /> Date
                  </Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[200px]" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Time slot
                  </Label>
                  <Select value={slot} onValueChange={setSlot}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {liveTimeSlots.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <RoomSelector rooms={rooms} activeRoomId={activeRoomId} onSelect={setActiveRoomId} />

              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {legend.map((l) => (
                      <Badge key={l.status} variant="outline" className={l.className}>{l.label}</Badge>
                    ))}
                  </div>
                  <LayoutViewer
                    room={activeRoom}
                    getTableStatus={getTableStatus}
                    selectedId={selected?._id}
                    onSelect={setSelected}
                  />
                </div>
                <Card className="shadow-card h-fit lg:sticky lg:top-24">
                  <CardHeader><CardTitle className="text-base">Table details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {!selected ? (
                      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5" /> Select a table to view status for the chosen date/time slot.
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-foreground">{selected.tableCode || selected.tableNumber}</div>
                          <Badge variant="outline" className="capitalize">{getTableStatus(selected)}</Badge>
                        </div>
                        <Separator />
                        <div className="grid gap-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Capacity</span>
                            <span className="font-medium">{selected.capacity}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <span className="font-medium capitalize">{selected.type}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Room</span>
                            <span className="font-medium">{activeRoom?.name}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB: WEEKLY SCHEDULE */}
            <TabsContent value="schedule" className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Weekly Operating Schedule</h3>
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

            {/* TAB: EXCEPTIONS */}
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

            {/* TAB: SLOT CONFIG */}
            <TabsContent value="slots" className="space-y-6">
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
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 mins</SelectItem>
                          <SelectItem value="30">30 mins</SelectItem>
                          <SelectItem value="45">45 mins</SelectItem>
                          <SelectItem value="60">60 mins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Booking Duration (mins)</Label>
                      <Select
                        value={String(slotConfig.slotDuration)}
                        onValueChange={(v) => setSlotConfig(prev => ({ ...prev, slotDuration: Number(v) }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 mins</SelectItem>
                          <SelectItem value="60">1 hr</SelectItem>
                          <SelectItem value="90">1.5 hrs</SelectItem>
                          <SelectItem value="120">2 hrs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleSaveSlotConfig} disabled={isUpdatingSlotConfig} className="w-full">
                      {isUpdatingSlotConfig ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Slot Config
                    </Button>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                    <Label className="mb-3 block text-sm font-medium">Dynamic Slot Preview (10:00 - 14:00)</Label>
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
            </TabsContent>

          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
