import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot } from "lucide-react";

export function AutomationHandlingCard({ settings, updateSetting }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-6 group hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Automation & Handling</h3>
          <p className="text-xs text-muted-foreground">Configure how the system automatically manages operations.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/20">
          <div className="space-y-1">
            <Label className="text-sm font-bold">Auto-confirm Reservations</Label>
            <p className="text-xs text-muted-foreground max-w-sm">
              Automatically confirm bookings if tables are available. Disabling this requires manual approval for every booking.
            </p>
          </div>
          <Switch 
            checked={settings.autoAcceptBookings} 
            onCheckedChange={(val) => updateSetting("autoAcceptBookings", val)} 
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/20">
          <div className="space-y-1">
            <Label className="text-sm font-bold">Accept Walk-ins</Label>
            <p className="text-xs text-muted-foreground max-w-sm">
              Allow walk-in customers and enable the waitlist feature when the restaurant is fully booked.
            </p>
          </div>
          <Switch 
            checked={settings.waitlistEnabled} 
            onCheckedChange={(val) => updateSetting("waitlistEnabled", val)} 
          />
        </div>

        <div className="space-y-3 pt-2">
          <Label className="flex items-center gap-2 font-semibold">
            Reservation Buffer Time
          </Label>
          <Select 
            value={settings.tableBufferMinutes?.toString()} 
            onValueChange={(val) => updateSetting("tableBufferMinutes", parseInt(val))}
          >
            <SelectTrigger className="h-12 rounded-xl bg-muted/30 max-w-sm">
              <SelectValue placeholder="Select buffer time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 minutes (Instant flip)</SelectItem>
              <SelectItem value="10">10 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">Time reserved between bookings to clean and reset the table.</p>
        </div>
      </div>
    </div>
  );
}
