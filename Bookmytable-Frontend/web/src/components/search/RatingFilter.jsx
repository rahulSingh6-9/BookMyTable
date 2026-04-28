import { Star } from "lucide-react";

export function RatingFilter({ value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Minimum Rating</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange?.(star)}
            className="p-1 transition-colors"
          >
            <Star className={`h-5 w-5 ${(value || 0) >= star ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
