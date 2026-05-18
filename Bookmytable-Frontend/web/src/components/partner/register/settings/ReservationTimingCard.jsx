import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CalendarDays } from "lucide-react";

export function ReservationTimingCard({ settings, updateSetting }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-6 group hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Reservation Timing</h3>
          <p className="text-xs text-muted-foreground">Manage your booking slots and windows.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="flex items-center gap-2 font-semibold">
            Slot Interval
          </Label>
          <Select 
            value={settings.timeSlotInterval?.toString()} 
            onValueChange={(val) => updateSetting("timeSlotInterval", parseInt(val))}
          >
            <SelectTrigger className="h-12 rounded-xl bg-muted/30">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">How often reservation slots start. 30-minute intervals are recommended for most restaurants.</p>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 font-semibold">
            Slot Duration
          </Label>
          <Select 
            value={settings.slotDuration?.toString()} 
            onValueChange={(val) => updateSetting("slotDuration", parseInt(val))}
          >
            <SelectTrigger className="h-12 rounded-xl bg-muted/30">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
              <SelectItem value="120">120 minutes</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">How long a table is reserved for a typical party.</p>
        </div>

        <div className="space-y-3 md:col-span-2">
          <Label className="flex items-center gap-2 font-semibold">
            <CalendarDays className="h-4 w-4 text-primary" />
            Advance Booking Days
          </Label>
          <Select 
            value={settings.advanceBookingDays?.toString()} 
            onValueChange={(val) => updateSetting("advanceBookingDays", parseInt(val))}
          >
            <SelectTrigger className="h-12 rounded-xl bg-muted/30">
              <SelectValue placeholder="Select days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days ahead</SelectItem>
              <SelectItem value="15">15 Days ahead</SelectItem>
              <SelectItem value="30">1 Month ahead</SelectItem>
              <SelectItem value="60">2 Months ahead</SelectItem>
              <SelectItem value="90">3 Months ahead</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">How far in advance customers can reserve a table online.</p>
        </div>
      </div>
    </div>
  );
}
