import * as React from "react";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function TimePicker({ value, onChange, className }) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse 24h value "13:45" to hours, minutes, am/pm
  const parsedValue = React.useMemo(() => {
    if (!value) return { h: 12, m: 0, ampm: "AM" };
    const [hStr, mStr] = value.split(":");
    let h24 = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const ampm = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return { h: h12, m, ampm };
  }, [value]);

  const updateTime = (newH, newM, newAmpm) => {
    let h24 = newH;
    if (newAmpm === "PM" && h24 !== 12) h24 += 12;
    if (newAmpm === "AM" && h24 === 12) h24 = 0;

    const formattedH = String(h24).padStart(2, "0");
    const formattedM = String(newM).padStart(2, "0");
    onChange(`${formattedH}:${formattedM}`);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-32 justify-start text-left font-normal bg-background hover:bg-muted/50 border-input",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          {value ? (
            <span>
              {String(parsedValue.h).padStart(2, "0")}:{String(parsedValue.m).padStart(2, "0")} {parsedValue.ampm}
            </span>
          ) : (
            <span>Select time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex h-56 gap-2">
          {/* Hours Column */}
          <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-16 rounded-md border border-muted bg-muted/20">
            <div className="flex flex-col p-1 gap-1">
              {hours.map((h) => (
                <Button
                  key={h}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-full rounded-sm justify-center font-medium",
                    parsedValue.h === h ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => updateTime(h, parsedValue.m, parsedValue.ampm)}
                >
                  {String(h).padStart(2, "0")}
                </Button>
              ))}
            </div>
          </div>

          {/* Minutes Column */}
          <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-16 rounded-md border border-muted bg-muted/20">
            <div className="flex flex-col p-1 gap-1">
              {minutes.map((m) => (
                <Button
                  key={m}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-full rounded-sm justify-center font-medium",
                    parsedValue.m === m ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => updateTime(parsedValue.h, m, parsedValue.ampm)}
                >
                  {String(m).padStart(2, "0")}
                </Button>
              ))}
            </div>
          </div>

          {/* AM/PM Column */}
          <div className="flex w-16 flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-10 rounded-md border border-muted bg-muted/20 justify-center font-bold text-sm",
                parsedValue.ampm === "AM" ? "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => updateTime(parsedValue.h, parsedValue.m, "AM")}
            >
              AM
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-10 rounded-md border border-muted bg-muted/20 justify-center font-bold text-sm",
                parsedValue.ampm === "PM" ? "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => updateTime(parsedValue.h, parsedValue.m, "PM")}
            >
              PM
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
