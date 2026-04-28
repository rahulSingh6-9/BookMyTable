import { Users, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GuestSelector({ value = 2, onChange, min = 1, max = 12 }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">Party Size</label>
      <div className="flex items-center gap-3 rounded-md border border-input bg-background px-3 py-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChange?.(Math.max(min, value - 1))} disabled={value <= min}>
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="min-w-[3ch] text-center text-sm font-medium text-foreground">{value}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChange?.(Math.min(max, value + 1))} disabled={value >= max}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <span className="text-sm text-muted-foreground">{value === 1 ? "Guest" : "Guests"}</span>
      </div>
    </div>
  );
}
