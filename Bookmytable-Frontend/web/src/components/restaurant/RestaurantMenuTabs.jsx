import { useState } from "react";
import { Loader2, Plus, Leaf, Drumstick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function RestaurantMenuTabs({ menuRes, menuLoading }) {
  const [activeCategory, setActiveCategory] = useState("All");

  if (menuLoading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const categories = menuRes?.data?.data?.categories || [];
  const menuItems = menuRes?.data?.data?.items || [];
  const displayCategories = ["All", ...categories.map(c => c.name)];
  
  const filteredMenu = activeCategory === "All" 
    ? menuItems 
    : menuItems.filter((m) => m.category?.name === activeCategory);

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sticky top-24 bg-background/95 backdrop-blur z-10 py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {displayCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 border ${
              activeCategory === cat 
                ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items Grid/List */}
      {filteredMenu.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center bg-muted/30">
          <p className="text-muted-foreground font-medium">No items found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMenu.map((item) => (
            <div key={item._id} className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all group">
              {/* Item Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {/* Food Type Indicator */}
                    {item.foodType === "veg" || item.foodType === "vegan" ? (
                      <div className="h-4 w-4 border border-green-600 rounded-sm flex items-center justify-center bg-green-50/50" title="Vegetarian">
                        <div className="h-2 w-2 rounded-full bg-green-600" />
                      </div>
                    ) : item.foodType === "non_veg" || item.foodType === "egg" ? (
                      <div className="h-4 w-4 border border-red-600 rounded-sm flex items-center justify-center bg-red-50/50" title="Non-Vegetarian">
                        <div className="h-2 w-2 rounded-full bg-red-600" />
                      </div>
                    ) : null}
                    
                    {item.isChefSpecial && <Badge variant="accent" className="text-[10px] uppercase px-1.5 py-0">Chef's Special</Badge>}
                    {item.isFeatured && <Badge variant="secondary" className="text-[10px] uppercase px-1.5 py-0 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20">Bestseller</Badge>}
                  </div>
                  
                  <h4 className="font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors">{item.name}</h4>
                  <div className="font-semibold text-foreground mt-1.5">₹{item.price}</div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-snug">{item.description}</p>
                </div>
              </div>

              {/* Item Image & Actions */}
              <div className="shrink-0 flex flex-col items-center gap-3 w-28 sm:w-32">
                <div className="h-24 w-full rounded-lg bg-muted overflow-hidden border border-border relative shadow-sm">
                  <img 
                    src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300"} 
                    alt={item.name} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                {item.isAvailable !== false ? (
                  <Button variant="outline" size="sm" className="w-full text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground font-semibold h-8 rounded-full shadow-sm">
                    ADD <Plus className="h-3 w-3 ml-1" />
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" disabled className="w-full h-8 rounded-full text-xs">
                    Out of Stock
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
