import { Search } from "lucide-react";

export function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2.5">
      <Search className="h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
      />
    </div>
  );
}
