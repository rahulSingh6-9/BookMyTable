import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WeeklyScheduleEditor } from "@/components/booking/WeeklyScheduleEditor";
import { SpecialDaysManager } from "@/components/booking/SpecialDaysManager";
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import { Save, Clock, CalendarDays, Settings } from "lucide-react";
import { toast } from "sonner";



export default function RestaurantSettings() {
  const {
    settings,
    updateOpeningHours,
    addSlot,
    removeSlot,
    updateSlot,
    addSpecialDay,
    removeSpecialDay,
    updateField,
  } = useRestaurantSettings("1");

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 lg:px-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Restaurant Settings</h1>
              <p className="text-muted-foreground">Configure your schedule, booking rules, and policies</p>
            </div>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>

          <Tabs defaultValue="schedule" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="schedule" className="gap-2"><Clock className="h-4 w-4" /> Schedule</TabsTrigger>
              <TabsTrigger value="special" className="gap-2"><CalendarDays className="h-4 w-4" /> Special Days</TabsTrigger>
              <TabsTrigger value="booking" className="gap-2"><Settings className="h-4 w-4" /> Booking Rules</TabsTrigger>
            </TabsList>

            {/* Weekly Schedule */}
            <TabsContent value="schedule" className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                <Label className="text-sm font-medium text-card-foreground whitespace-nowrap">Time Slot Interval</Label>
                <Select
                  value={String(settings.timeSlotInterval)}
                  onValueChange={(v) => updateField("timeSlotInterval", Number(v))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 mins</SelectItem>
                    <SelectItem value="30">30 mins</SelectItem>
                    <SelectItem value="45">45 mins</SelectItem>
                    <SelectItem value="60">60 mins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <WeeklyScheduleEditor
                openingHours={settings.openingHours}
                onToggleDay={updateOpeningHours}
                onAddSlot={addSlot}
                onRemoveSlot={removeSlot}
                onUpdateSlot={updateSlot}
              />
            </TabsContent>

            {/* Special Days */}
            <TabsContent value="special">
              <SpecialDaysManager
                specialDays={settings.specialDays}
                onAdd={addSpecialDay}
                onRemove={removeSpecialDay}
              />
            </TabsContent>

            {/* Booking Rules */}
            <TabsContent value="booking" className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-5 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1.5 block text-sm">Min Guests</Label>
                    <Input
                      type="number"
                      min={1}
                      value={settings.minGuestsPerBooking}
                      onChange={(e) => updateField("minGuestsPerBooking", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm">Max Guests</Label>
                    <Input
                      type="number"
                      min={1}
                      value={settings.maxGuestsPerBooking}
                      onChange={(e) => updateField("maxGuestsPerBooking", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block text-sm">Advance Booking Days</Label>
                  <Input
                    type="number"
                    min={1}
                    value={settings.advanceBookingDays}
                    onChange={(e) => updateField("advanceBookingDays", Number(e.target.value))}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">How many days ahead customers can book</p>
                </div>

                <div>
                  <Label className="mb-1.5 block text-sm">Cancellation Policy</Label>
                  <Input
                    value={settings.cancellationPolicy}
                    onChange={(e) => updateField("cancellationPolicy", e.target.value)}
                    placeholder="e.g., Free cancellation up to 2 hours before"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Auto-Accept Bookings</Label>
                    <p className="text-xs text-muted-foreground">Automatically confirm new reservations</p>
                  </div>
                  <Switch
                    checked={settings.autoAcceptBookings}
                    onCheckedChange={(v) => updateField("autoAcceptBookings", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Require Deposit</Label>
                    <p className="text-xs text-muted-foreground">Charge a deposit at booking time</p>
                  </div>
                  <Switch
                    checked={settings.depositRequired}
                    onCheckedChange={(v) => updateField("depositRequired", v)}
                  />
                </div>

                {settings.depositRequired && (
                  <div>
                    <Label className="mb-1.5 block text-sm">Deposit Amount ($)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={settings.depositAmount}
                      onChange={(e) => updateField("depositAmount", Number(e.target.value))}
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
