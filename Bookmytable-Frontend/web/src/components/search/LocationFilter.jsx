import { MapPin } from "lucide-react";

export function LocationFilter({ value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Location</label>
      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="City or neighborhood..."
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>
    </div>
  );
}
