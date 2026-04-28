import { Skeleton } from "@/components/ui/skeleton";

export function TimeSlotPicker({ slots = [], selected, onSelect, loading = false }) {
  if (loading) {
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Available Times</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">Available Times</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => (
          <button
            key={slot}
            onClick={() => onSelect?.(slot)}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition-all duration-150 ${
              selected === slot
                ? "border-primary bg-primary text-primary-foreground scale-[1.02] shadow-sm"
                : "border-input bg-background text-foreground hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  );
}
