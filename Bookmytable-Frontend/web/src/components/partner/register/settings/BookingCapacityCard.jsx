import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";
import { toast } from "sonner";

export function BookingCapacityCard({ settings, updateSetting }) {
  const handleNumChange = (field, value) => {
    const num = parseInt(value);
    if (isNaN(num)) return;
    
    // Prevent illogical ranges
    if (field === "maxGuestsPerBooking" && num < settings.minGuestsPerBooking) {
      toast.error("Max guests cannot be less than min guests");
      return;
    }
    if (field === "minGuestsPerBooking" && num > settings.maxGuestsPerBooking) {
      toast.error("Min guests cannot be greater than max guests");
      return;
    }
    
    updateSetting(field, num);
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-6 group hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Booking Capacity</h3>
          <p className="text-xs text-muted-foreground">Set party sizes and slot capacity limits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3 md:col-span-2">
          <Label className="flex items-center gap-2 font-semibold">
            Maximum Bookings Per Slot
          </Label>
          <Input 
            type="number" 
            min="1"
            value={settings.onlineBookingLimitPerSlot}
            onChange={(e) => handleNumChange("onlineBookingLimitPerSlot", e.target.value)}
            className="h-12 rounded-xl bg-muted/30"
          />
          <p className="text-[10px] text-muted-foreground">Maximum number of separate reservations you accept for the exact same start time.</p>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 font-semibold">
            Minimum Guests Per Booking
          </Label>
          <Input 
            type="number" 
            min="1"
            value={settings.minGuestsPerBooking}
            onChange={(e) => handleNumChange("minGuestsPerBooking", e.target.value)}
            className="h-12 rounded-xl bg-muted/30"
          />
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 font-semibold">
            Maximum Guests Per Booking
          </Label>
          <Input 
            type="number" 
            min="1"
            value={settings.maxGuestsPerBooking}
            onChange={(e) => handleNumChange("maxGuestsPerBooking", e.target.value)}
            className="h-12 rounded-xl bg-muted/30"
          />
        </div>
      </div>
    </div>
  );
}
