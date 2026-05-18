import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Clock, ChevronDown, ChevronUp, Copy, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { BreakManager } from "./hours/BreakManager";
import { HoursPreviewCard } from "./hours/HoursPreviewCard";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" }
];

const DEFAULT_HOURS = {
  mon: { isClosed: false, open: "10:00", close: "23:00", breaks: [] },
  tue: { isClosed: false, open: "10:00", close: "23:00", breaks: [] },
  wed: { isClosed: false, open: "10:00", close: "23:00", breaks: [] },
  thu: { isClosed: false, open: "10:00", close: "23:00", breaks: [] },
  fri: { isClosed: false, open: "10:00", close: "00:00", breaks: [] },
  sat: { isClosed: false, open: "10:00", close: "00:00", breaks: [] },
  sun: { isClosed: true, open: "10:00", close: "23:00", breaks: [] }
};

export function Step5Hours({ setValue, watch, errors }) {
  const rawHours = watch("hours");
  
  // Normalize legacy drafts (arrays) or missing data into the required object structure
  const hours = (!rawHours || Array.isArray(rawHours) || !rawHours.mon) 
    ? DEFAULT_HOURS 
    : rawHours;

  const timezone = watch("timezone") || "Asia/Kolkata (IST)";
  const [sameForAll, setSameForAll] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);

  const updateDay = (dayKey, field, value) => {
    const newHours = { ...hours };
    newHours[dayKey] = { ...newHours[dayKey], [field]: value };
    
    if (sameForAll && (field === "open" || field === "close" || field === "isClosed")) {
      Object.keys(newHours).forEach(k => {
        if (k !== dayKey) {
          newHours[k] = { ...newHours[k], [field]: value };
        }
      });
    }
    
    setValue("hours", newHours, { shouldValidate: true, shouldDirty: true });
  };

  const copyToAll = (sourceKey) => {
    const source = hours[sourceKey];
    const newHours = {};
    Object.keys(hours).forEach(k => {
      newHours[k] = { ...source };
    });
    setValue("hours", newHours, { shouldValidate: true, shouldDirty: true });
    toast.success(`Copied ${DAYS.find(d => d.key === sourceKey).label} timings to all days`);
  };

  const applyQuickAction = (action) => {
    const newHours = JSON.parse(JSON.stringify(hours));
    if (action === "weekdays") {
      ["mon", "tue", "wed", "thu", "fri"].forEach(k => newHours[k].isClosed = false);
      ["sat", "sun"].forEach(k => newHours[k].isClosed = true);
    } else if (action === "weekends") {
      ["mon", "tue", "wed", "thu", "fri"].forEach(k => newHours[k].isClosed = true);
      ["sat", "sun"].forEach(k => newHours[k].isClosed = false);
    } else if (action === "everyday") {
      Object.keys(newHours).forEach(k => newHours[k].isClosed = false);
    }
    setValue("hours", newHours, { shouldValidate: true, shouldDirty: true });
    setSameForAll(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-6">
        
        {/* Quick Actions Header */}
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-primary mb-1">Set Operating Hours</h3>
              <p className="text-sm text-muted-foreground">Define when your restaurant is open for bookings.</p>
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-border">
              <Label className="text-xs font-bold whitespace-nowrap cursor-pointer">Same for all days</Label>
              <Switch 
                checked={sameForAll} 
                onCheckedChange={(val) => {
                  setSameForAll(val);
                  if (val) {
                    copyToAll("mon");
                  }
                }} 
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-4 border-t border-primary/10">
            <span className="text-xs font-semibold text-muted-foreground self-center mr-2">Quick presets:</span>
            <Button type="button" variant="outline" size="sm" onClick={() => applyQuickAction("weekdays")} className="h-7 text-[10px] rounded-full">Weekdays Only</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyQuickAction("weekends")} className="h-7 text-[10px] rounded-full">Weekends Only</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyQuickAction("everyday")} className="h-7 text-[10px] rounded-full">Open Everyday</Button>
          </div>
        </div>

        {/* Days List */}
        <div className="space-y-4">
          {DAYS.map((day) => {
            const data = hours[day.key];
            const isExpanded = expandedDay === day.key;
            const dayError = errors?.hours?.[day.key]?.message;

            return (
              <div 
                key={day.key} 
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  data.isClosed ? "border-muted bg-muted/20 opacity-75" : dayError ? "border-destructive bg-destructive/5 shadow-sm" : "border-border bg-card shadow-sm hover:border-primary/30"
                }`}
              >
                {/* Main Row */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4 w-1/3">
                    <Switch 
                      checked={!data.isClosed} 
                      onCheckedChange={(val) => updateDay(day.key, "isClosed", !val)} 
                    />
                    <span className={`font-bold text-sm ${data.isClosed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {day.label}
                    </span>
                  </div>

                  {!data.isClosed ? (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input 
                          type="time" 
                          value={data.open} 
                          onChange={(e) => updateDay(day.key, "open", e.target.value)}
                          className="h-9 w-28 pl-7 text-xs font-medium bg-background" 
                        />
                      </div>
                      <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">to</span>
                      <div className="relative">
                        <Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input 
                          type="time" 
                          value={data.close} 
                          onChange={(e) => updateDay(day.key, "close", e.target.value)}
                          className="h-9 w-28 pl-7 text-xs font-medium bg-background" 
                        />
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-center ml-2 border-l pl-3 gap-1">
                        {!sameForAll && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => copyToAll(day.key)}
                            title="Copy to all days"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setExpandedDay(isExpanded ? null : day.key)}
                          className={`h-8 w-8 transition-transform ${isExpanded ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end flex-1 gap-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-destructive bg-destructive/10 px-3 py-1 rounded-full">Closed</span>
                      {!sameForAll && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => copyToAll(day.key)}
                          title="Copy closed status to all days"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded Breaks Section */}
                <AnimatePresence>
                  {isExpanded && !data.isClosed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border bg-muted/10 overflow-hidden"
                    >
                      <div className="p-4 pl-[33%]">
                        <Label className="text-xs font-bold text-foreground mb-1 block">Breaks & Maintenance</Label>
                        <p className="text-[10px] text-muted-foreground mb-2">Define periods when the restaurant stops accepting bookings (e.g. Lunch break).</p>
                        <BreakManager 
                          breaks={data.breaks || []} 
                          onChange={(newBreaks) => updateDay(day.key, "breaks", newBreaks)}
                          disabled={data.isClosed}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {dayError && (
                  <div className="px-4 pb-3 flex items-center text-xs text-destructive bg-transparent pl-[33%]">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {dayError}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Preview Side Panel */}
      <div className="lg:col-span-2 hidden lg:block">
        <HoursPreviewCard hours={hours} timezone={timezone} />
      </div>
    </div>
  );
}
