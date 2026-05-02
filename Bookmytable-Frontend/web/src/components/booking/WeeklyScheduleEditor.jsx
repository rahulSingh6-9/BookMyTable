import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { DAYS_OF_WEEK } from "@/lib/mockData";

export function WeeklyScheduleEditor({ openingHours, onToggleDay, onAddSlot, onRemoveSlot, onUpdateSlot }) {
  return (
    <div className="space-y-3">
      {DAYS_OF_WEEK.map((day) => {
        const dayData = openingHours[day] || { isOpen: false, slots: [] };
        return (
          <div key={day} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Switch
                  checked={dayData.isOpen}
                  onCheckedChange={(checked) => onToggleDay(day, { isOpen: checked })}
                />
                <span className="text-sm font-medium capitalize text-card-foreground">{day}</span>
              </div>
              {dayData.isOpen && (
                <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => onAddSlot(day)}>
                  <Plus className="h-3.5 w-3.5" /> Add Slot
                </Button>
              )}
            </div>

            {dayData.isOpen && dayData.slots && dayData.slots.length > 0 && (
              <div className="ml-12 space-y-2">
                {dayData.slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={slot.open}
                      onChange={(e) => onUpdateSlot(day, idx, "open", e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground text-sm">to</span>
                    <Input
                      type="time"
                      value={slot.close}
                      onChange={(e) => onUpdateSlot(day, idx, "close", e.target.value)}
                      className="w-32"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemoveSlot(day, idx)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {dayData.isOpen && (!dayData.slots || dayData.slots.length === 0) && (
              <p className="ml-12 text-xs text-muted-foreground">No slots added. Click "Add Slot" to set hours.</p>
            )}

            {!dayData.isOpen && (
              <p className="ml-12 text-xs text-muted-foreground">Closed</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
