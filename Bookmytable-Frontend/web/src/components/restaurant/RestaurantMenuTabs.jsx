import { useState } from "react";
import { Loader2, Plus, Minus, Leaf, Drumstick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export function RestaurantMenuTabs({ menuRes, menuLoading, isViewOnly = false }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const { cartItems, addToCart, updateQuantity, reservationDetails } = useCart();

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  const handleUpdateQuantity = (itemId, delta) => {
    updateQuantity(itemId, delta);
  };

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
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide sticky top-28 bg-background/95 backdrop-blur-md z-20 py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-border/40 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)]">
        {displayCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 border shadow-sm ${
              activeCategory === cat 
                ? "bg-foreground text-background border-foreground shadow-md scale-105" 
                : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground hover:shadow-md hover:-translate-y-0.5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items Grid/List */}
      {filteredMenu.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-16 text-center bg-muted/10 flex flex-col items-center">
          <div className="w-20 h-20 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <Drumstick className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No items found</h3>
          <p className="text-muted-foreground font-medium max-w-[250px]">Try selecting a different category or exploring our full menu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredMenu.map((item) => (
            <div key={item._id} className="flex gap-4 p-5 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 group">
              {/* Item Info */}
              <div className="flex-1 flex flex-col justify-center">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    {/* Food Type Indicator */}
                    {item.foodType === "veg" || item.foodType === "vegan" ? (
                      <div className="h-5 w-5 border-2 border-green-600 rounded flex items-center justify-center bg-green-50" title="Vegetarian">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
                      </div>
                    ) : item.foodType === "non_veg" || item.foodType === "egg" ? (
                      <div className="h-5 w-5 border-2 border-red-600 rounded flex items-center justify-center bg-red-50" title="Non-Vegetarian">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-600" />
                      </div>
                    ) : null}
                    
                    {item.isChefSpecial && <Badge variant="accent" className="text-[10px] uppercase px-2 py-0.5 tracking-wider font-bold">Chef's Special</Badge>}
                    {item.isFeatured && <Badge variant="secondary" className="text-[10px] uppercase px-2 py-0.5 tracking-wider font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">Bestseller</Badge>}
                  </div>
                  
                  <h4 className="font-black text-foreground text-lg leading-tight group-hover:text-primary transition-colors">{item.name}</h4>
                  <div className="font-bold text-foreground text-base mt-2">₹{item.price}</div>
                  <p className="text-sm text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed opacity-90">{item.description}</p>
                </div>
              </div>

              {/* Item Image & Actions */}
              <div className="shrink-0 flex flex-col items-center gap-4 w-32 sm:w-40 relative">
                <div className="h-32 w-full rounded-xl bg-muted overflow-hidden border border-border relative shadow-inner">
                  <img 
                    src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400"} 
                    alt={item.name} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="absolute -bottom-4 w-[110%] sm:w-[90%] left-1/2 -translate-x-1/2">
                  {!isViewOnly && (
                    item.isAvailable !== false ? (
                      (() => {
                        const cartItem = cartItems.find((i) => i._id === item._id);
                        if (cartItem) {
                          return (
                            <div className="flex items-center justify-between w-full h-10 rounded-xl border border-primary bg-background shadow-md px-1 overflow-hidden">
                              <button onClick={() => handleUpdateQuantity(item._id, -1)} className="h-full px-3 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="text-sm font-black text-primary w-8 text-center">{cartItem.quantity}</span>
                              <button onClick={() => handleUpdateQuantity(item._id, 1)} className="h-full px-3 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        }
                        return (
                          <Button onClick={() => handleAddToCart(item)} variant="outline" className="w-full text-primary border-primary/20 bg-background hover:bg-primary hover:border-primary hover:text-white font-black h-10 rounded-xl shadow-md uppercase tracking-wider text-sm transition-all duration-300 group-hover:-translate-y-1">
                            ADD <Plus className="h-4 w-4 ml-1" />
                          </Button>
                        );
                      })()
                    ) : (
                      <Button variant="secondary" disabled className="w-full h-10 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm opacity-80">
                        Sold Out
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
