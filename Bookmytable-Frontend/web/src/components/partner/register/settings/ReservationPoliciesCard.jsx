import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollText } from "lucide-react";
import { toast } from "sonner";

export function ReservationPoliciesCard({ settings, updateSetting }) {
  const handleDepositChange = (val) => {
    const num = parseInt(val);
    if (isNaN(num) || num < 0) return;
    updateSetting("depositAmount", num);
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-6 group hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
          <ScrollText className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Reservation Policies</h3>
          <p className="text-xs text-muted-foreground">Define your cancellation and deposit rules.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/20">
          <div className="space-y-1">
            <Label className="text-sm font-bold">Require Deposit</Label>
            <p className="text-xs text-muted-foreground max-w-sm">
              Charge a deposit fee at the time of booking. Great for reducing no-shows.
            </p>
          </div>
          <Switch 
            checked={settings.depositRequired} 
            onCheckedChange={(val) => updateSetting("depositRequired", val)} 
          />
        </div>

        {settings.depositRequired && (
          <div className="space-y-3 pt-2 pl-4 border-l-2 border-primary/20">
            <Label className="flex items-center gap-2 font-semibold">
              Deposit Amount (per guest)
            </Label>
            <div className="relative max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
              <Input 
                type="number" 
                min="0"
                value={settings.depositAmount}
                onChange={(e) => handleDepositChange(e.target.value)}
                className="h-12 rounded-xl bg-white pl-8"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Fixed amount charged per guest during checkout.</p>
          </div>
        )}

        <div className="space-y-3">
          <Label className="flex items-center gap-2 font-semibold">
            Cancellation Policy
          </Label>
          <Textarea 
            placeholder="e.g. Cancellations made less than 24 hours before the reservation time will forfeit the deposit..."
            value={settings.cancellationPolicy || ""}
            onChange={(e) => updateSetting("cancellationPolicy", e.target.value)}
            className="min-h-[100px] rounded-xl bg-muted/30 resize-none"
          />
          <p className="text-[10px] text-muted-foreground">This policy will be shown to guests before they complete their booking.</p>
        </div>
      </div>
    </div>
  );
}
