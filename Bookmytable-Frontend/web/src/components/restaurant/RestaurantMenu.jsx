import { useState } from "react";
import { menuItems } from "@/lib/data";

const categories = ["All", "Starters", "Sashimi", "Rolls", "Premium", "Desserts"];

export function RestaurantMenu() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? menuItems : menuItems.filter((m) => m.category === active);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-foreground">Menu</h2>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${active === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="divide-y divide-border rounded-lg border border-border">
        {filtered.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4">
            <div>
              <h4 className="font-medium text-foreground">{item.name}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <span className="shrink-0 font-semibold text-foreground">${item.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
