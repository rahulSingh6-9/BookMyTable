import { useState } from "react";

const tables = [
  { id: "t1", label: "Table 1", seats: 2, type: "Window" },
  { id: "t2", label: "Table 2", seats: 4, type: "Indoor" },
  { id: "t3", label: "Table 3", seats: 6, type: "Outdoor" },
  { id: "t4", label: "Table 4", seats: 2, type: "Bar" },
  { id: "t5", label: "Table 5", seats: 8, type: "Private" },
  { id: "t6", label: "Table 6", seats: 4, type: "Indoor" },
];

export function TableSelector({ selected, onSelect }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">Select Table</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => onSelect?.(table)}
            className={`rounded-lg border p-3 text-left transition-colors ${selected?.id === table.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
          >
            <p className="text-sm font-medium text-foreground">{table.label}</p>
            <p className="text-xs text-muted-foreground">{table.seats} seats · {table.type}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
