import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { TimePicker } from "@/components/ui/time-picker";
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
                <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary hover:bg-primary/10 transition-colors" onClick={() => onAddSlot(day)}>
                  <Plus className="h-3.5 w-3.5" /> Add Slot
                </Button>
              )}
            </div>

            {dayData.isOpen && dayData.slots && dayData.slots.length > 0 && (
              <div className="ml-12 space-y-3">
                {dayData.slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-3 group">
                    <TimePicker
                      value={slot.open}
                      onChange={(val) => onUpdateSlot(day, idx, "open", val)}
                      className="w-[140px] border-border hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
                    />
                    <span className="text-muted-foreground text-sm font-medium">to</span>
                    <TimePicker
                      value={slot.close}
                      onChange={(val) => onUpdateSlot(day, idx, "close", val)}
                      className="w-[140px] border-border hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 ml-1" 
                      onClick={() => onRemoveSlot(day, idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {dayData.isOpen && (!dayData.slots || dayData.slots.length === 0) && (
              <p className="ml-12 text-sm text-muted-foreground bg-muted/30 py-2 px-3 rounded-md border border-dashed border-border/50 inline-block">No slots added. Click "Add Slot" to set hours.</p>
            )}

            {!dayData.isOpen && (
              <p className="ml-12 text-sm text-muted-foreground/60 italic py-1">Closed</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
