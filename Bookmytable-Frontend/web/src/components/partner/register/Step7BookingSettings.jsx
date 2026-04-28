import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Clock, Users, Calendar, ShieldCheck } from "lucide-react";

export function Step7BookingSettings({ setValue, watch }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Slot Duration
          </Label>
          <Select 
            defaultValue={watch("slotDuration") || "60"} 
            onValueChange={(val) => setValue("slotDuration", val)}
          >
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
              <SelectItem value="120">120 minutes</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground px-1">Avg. time a customer spends at a table.</p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Max Bookings Per Slot
          </Label>
          <Input 
            type="number" 
            defaultValue={watch("maxBookingsPerSlot") || "10"}
            onChange={(e) => setValue("maxBookingsPerSlot", e.target.value)}
            className="h-12 rounded-xl"
          />
          <p className="text-[10px] text-muted-foreground px-1">Maximum reservations accepted for a single time slot.</p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Advance Booking Days
          </Label>
          <Select 
            defaultValue={watch("advanceBookingDays") || "30"} 
            onValueChange={(val) => setValue("advanceBookingDays", val)}
          >
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Select days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="15">15 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="60">60 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground px-1">How far in advance customers can book.</p>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between p-6 rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex gap-4">
            <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
               <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <Label className="text-base font-bold">Auto-confirm Bookings</Label>
              <p className="text-xs text-muted-foreground max-w-sm">Automatically confirm bookings if tables are available. Manual confirmation recommended for peak hours.</p>
            </div>
          </div>
          <Switch 
            checked={watch("autoConfirm") ?? true} 
            onCheckedChange={(val) => setValue("autoConfirm", val)} 
          />
        </div>

        <div className="p-4 rounded-xl bg-muted/50 border border-muted flex items-start gap-3">
          <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-relaxed italic">
            Pro Tip: Setting a 60-minute duration and auto-confirming off-peak slots can increase your booking rate by up to 25%.
          </p>
        </div>
      </div>
    </div>
  );
}
