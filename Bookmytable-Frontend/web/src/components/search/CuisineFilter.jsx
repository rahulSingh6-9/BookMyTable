export function CuisineFilter({ cuisines = [], active, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Cuisine</label>
      <div className="flex flex-wrap gap-2">
        {cuisines.map((c) => (
          <button
            key={c}
            onClick={() => onChange?.(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${active === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
