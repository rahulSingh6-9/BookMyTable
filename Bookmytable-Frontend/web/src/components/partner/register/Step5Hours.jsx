import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { useEffect } from "react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function Step5Hours({ setValue, watch }) {
  const schedule = watch("hours") || days.map(day => ({ 
    day, 
    isOpen: true, 
    open: "09:00", 
    close: "22:00" 
  }));

  const sameForAll = watch("sameForAll") || false;

  const updateDay = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    
    if (sameForAll && (field === "open" || field === "close" || field === "isOpen")) {
      newSchedule.forEach((d, i) => {
        if (i !== index) d[field] = value;
      });
    }
    
    setValue("hours", newSchedule);
  };

  useEffect(() => {
    if (!watch("hours")) {
      setValue("hours", schedule);
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
        <div className="space-y-1">
          <Label className="text-base font-bold">Same for all days</Label>
          <p className="text-xs text-muted-foreground">Apply the same timings to every day of the week.</p>
        </div>
        <Switch 
          checked={sameForAll} 
          onCheckedChange={(val) => {
            setValue("sameForAll", val);
            if (val) {
              const firstDay = schedule[0];
              const synced = schedule.map(d => ({ ...d, open: firstDay.open, close: firstDay.close, isOpen: firstDay.isOpen }));
              setValue("hours", synced);
            }
          }} 
        />
      </div>

      <div className="space-y-4">
        {schedule.map((d, i) => (
          <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${d.isOpen ? "border-border bg-card shadow-sm" : "border-muted bg-muted/20 opacity-60"}`}>
            <div className="flex items-center gap-4 w-1/3">
              <Switch checked={d.isOpen} onCheckedChange={(val) => updateDay(i, "isOpen", val)} />
              <span className="font-bold text-sm w-24 text-foreground">{d.day}</span>
            </div>

            {d.isOpen ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input 
                    type="time" 
                    value={d.open} 
                    onChange={(e) => updateDay(i, "open", e.target.value)}
                    className="h-9 w-28 pl-7 text-xs font-medium" 
                  />
                </div>
                <span className="text-muted-foreground text-xs">to</span>
                <div className="relative">
                  <Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input 
                    type="time" 
                    value={d.close} 
                    onChange={(e) => updateDay(i, "close", e.target.value)}
                    className="h-9 w-28 pl-7 text-xs font-medium" 
                  />
                </div>
              </div>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Closed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
