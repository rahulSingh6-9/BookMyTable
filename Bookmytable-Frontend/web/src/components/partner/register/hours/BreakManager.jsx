import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Clock, Plus, Trash2, Copy, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BreakManager({ breaks, onChange, disabled }) {
  const addBreak = () => {
    onChange([...breaks, { start: "15:00", end: "17:00" }]);
  };

  const updateBreak = (index, field, value) => {
    const newBreaks = [...breaks];
    newBreaks[index][field] = value;
    onChange(newBreaks);
  };

  const removeBreak = (index) => {
    onChange(breaks.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4 space-y-3 pl-8 border-l-2 border-border ml-2">
      {breaks.map((b, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="relative">
            <Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input 
              type="time" 
              value={b.start} 
              onChange={(e) => updateBreak(i, "start", e.target.value)}
              disabled={disabled}
              className="h-8 w-28 pl-7 text-xs font-medium" 
            />
          </div>
          <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">to</span>
          <div className="relative">
            <Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input 
              type="time" 
              value={b.end} 
              onChange={(e) => updateBreak(i, "end", e.target.value)}
              disabled={disabled}
              className="h-8 w-28 pl-7 text-xs font-medium" 
            />
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            disabled={disabled}
            onClick={() => removeBreak(i)}
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button 
        type="button" 
        variant="ghost" 
        size="sm"
        disabled={disabled}
        onClick={addBreak}
        className="h-8 text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary rounded-full px-4"
      >
        <Plus className="h-3 w-3 mr-1.5" /> Add Break Time
      </Button>
    </div>
  );
}
