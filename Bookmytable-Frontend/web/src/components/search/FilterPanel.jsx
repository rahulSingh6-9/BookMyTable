import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CuisineFilter } from "./CuisineFilter";
import { RatingFilter } from "./RatingFilter";
import { LocationFilter } from "./LocationFilter";
import { useState } from "react";

export function FilterPanel({ cuisines, activeCuisine, onCuisineChange, onLocationChange, onRatingChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)} className="gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </Button>

      {open && (
        <div className="mt-3 rounded-lg border border-border bg-card p-4 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filters</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <LocationFilter onChange={onLocationChange} />
          <CuisineFilter cuisines={cuisines} active={activeCuisine} onChange={onCuisineChange} />
          <RatingFilter onChange={onRatingChange} />
        </div>
      )}
    </div>
  );
}
