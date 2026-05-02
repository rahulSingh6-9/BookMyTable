import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, CalendarOff, CalendarCheck, Loader2 } from "lucide-react";

export function SpecialDaysManager({ specialDays = [], onAdd, onRemove, isAdding, isDeleting }) {
  const [date, setDate] = useState("");
  const [isClosed, setIsClosed] = useState(true);
  const [slotOpen, setSlotOpen] = useState("10:00");
  const [slotClose, setSlotClose] = useState("18:00");

  const handleAdd = () => {
    if (!date) return;
    const entry = isClosed
      ? { date, isOpen: false }
      : { date, isOpen: true, slots: [{ open: slotOpen, close: slotClose }] };
    onAdd(entry);
    setDate("");
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
          <div className="flex items-center gap-2">
            <Switch checked={!isClosed} onCheckedChange={(v) => setIsClosed(!v)} />
            <span className="text-sm text-muted-foreground">{isClosed ? "Closed" : "Custom Hours"}</span>
          </div>
        </div>
        {!isClosed && (
          <div className="flex items-center gap-2">
            <Input type="time" value={slotOpen} onChange={(e) => setSlotOpen(e.target.value)} className="w-32" />
            <span className="text-muted-foreground text-sm">to</span>
            <Input type="time" value={slotClose} onChange={(e) => setSlotClose(e.target.value)} className="w-32" />
          </div>
        )}
        <Button size="sm" onClick={handleAdd} disabled={!date || isAdding} className="gap-1">
          {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add Special Day
        </Button>
      </div>

      {/* List */}
      {specialDays.length === 0 && (
        <p className="text-sm text-muted-foreground">No special days configured.</p>
      )}
      <div className="space-y-2">
        {specialDays.map((sd, i) => (
          <div key={sd.date || i} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
            <div className="flex items-center gap-3">
              {sd.isOpen === false ? (
                <CalendarOff className="h-4 w-4 text-destructive" />
              ) : (
                <CalendarCheck className="h-4 w-4 text-accent" />
              )}
              <span className="text-sm font-medium text-foreground">{sd.date}</span>
              {sd.isOpen === false ? (
                <Badge variant="destructive" className="text-xs">Closed</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {sd.slots?.map((s) => `${s.open}–${s.close}`).join(", ")}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemove(sd.date)} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
