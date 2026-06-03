import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBrand } from "@/context/BrandContext";
import { useBranch } from "@/context/BranchContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Building2,
  Store,
  ChevronDown,
  Settings,
  Search,
  ChevronRight,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const BrandBranchSelector = ({ className, collapsed = false }) => {
  const { brands, activeBrand, activeBrandSlug, switchBrand } = useBrand();
  const { activeBranch, activeBranchSlug, switchBranch } = useBranch();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredBrandSlug, setHoveredBrandSlug] = useState(null);
  const navigate = useNavigate();

  // Determine which brand to show branches for (hovered or active)
  const displayBrandSlug = hoveredBrandSlug || activeBrandSlug;
  const displayBrand = useMemo(() => 
    brands.find(b => b.slug === displayBrandSlug),
  [brands, displayBrandSlug]);

  const filteredBrands = useMemo(() => {
    if (!searchQuery) return brands;
    return brands.filter(b => 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.memberships.some(m => m.branch.branchName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [brands, searchQuery]);

  const handleBrandSelect = (brandSlug) => {
    switchBrand(brandSlug);
    switchBranch(null); // Clear branch context
    setOpen(false);
    navigate(`/brand/${brandSlug}/details`);
  };

  const handleBranchSelect = (brandSlug, branchSlug) => {
    switchBrand(brandSlug);
    switchBranch(branchSlug);
    setOpen(false);
    navigate(`/brand/${brandSlug}/branch/${branchSlug}/dashboard`);
  };

  const handleBrandSettings = (e, brandSlug) => {
    e.stopPropagation();
    handleBrandSelect(brandSlug);
  };

  if (brands.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto border-border/60 hover:bg-muted/50 transition-all rounded-xl shadow-sm w-full bg-background",
            collapsed ? "justify-center p-1 w-10 h-10" : "justify-between p-2 flex-1 min-w-0",
            className
          )}
        >
          <div className="flex items-center gap-3 min-w-0 w-full justify-center">
            <div className="relative shrink-0">
              <Avatar className={cn("rounded-lg border border-border/50", collapsed ? "h-7 w-7" : "h-10 w-10")}>
                {activeBrand?.logo ? (
                  <AvatarImage src={activeBrand.logo} alt={activeBrand.name} />
                ) : (
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                    {activeBrand?.name?.charAt(0) || "B"}
                  </AvatarFallback>
                )}
              </Avatar>
              {/* Mini branch badge indicator if active branch exists */}
              {!collapsed && activeBranch && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-background border rounded-full flex items-center justify-center shadow-sm">
                  <Avatar className="h-3.5 w-3.5">
                    <AvatarImage src={activeBranch?.logo} />
                    <AvatarFallback className="bg-primary text-[8px] text-primary-foreground">
                      <Store className="h-2 w-2" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
            
            {!collapsed && (
              <div className="flex flex-col items-start text-left min-w-0">
                <span className="text-sm font-bold text-foreground truncate w-full">
                  {activeBrand?.name || "Select Brand"}
                </span>
                <span className="text-[11px] text-muted-foreground truncate w-full font-medium">
                  {activeBranch ? activeBranch.branchName : "Brand Management"}
                </span>
              </div>
            )}
          </div>
          
          {!collapsed && (
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[560px] p-0 rounded-xl overflow-hidden border-border/80 shadow-2xl flex flex-col" 
        align="start"
        side={collapsed ? "right" : "bottom"}
        sideOffset={12}
      >
        <div className="p-3 border-b flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a business asset..." 
            className="h-8 border-none focus-visible:ring-0 shadow-none px-0"
          />
        </div>

        <div className="flex h-[380px] bg-background">
          {/* LEFT PANEL: Business Portfolios (Brands) */}
          <div className="w-1/2 border-r flex flex-col bg-muted/20">
            <div className="px-4 py-3 flex items-center gap-1">
              <span className="text-[13px] font-bold text-foreground">Business portfolios</span>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 [&::-webkit-scrollbar]:hidden">
              {filteredBrands.map((b) => {
                const isSelected = displayBrandSlug === b.slug;
                return (
                  <div
                    key={b.slug}
                    onMouseEnter={() => setHoveredBrandSlug(b.slug)}
                    onClick={() => handleBrandSelect(b.slug)}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                      isSelected ? "bg-accent/80" : "hover:bg-accent/40"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 rounded-md shrink-0 bg-primary/10 text-primary">
                        {b.logo ? (
                          <AvatarImage src={b.logo} />
                        ) : (
                          <AvatarFallback className="rounded-md font-bold text-sm">
                            {b.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate text-foreground">
                          {b.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {b.memberships.length} business asset{b.memberships.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    {isSelected && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </div>
                );
              })}
            </div>
            
            {/* Create Portfolio Button (Mock) */}
            <div className="p-3 mt-auto border-t">
              <Button variant="outline" className="w-full justify-center text-sm font-medium">
                Create a business portfolio
              </Button>
            </div>
          </div>

          {/* RIGHT PANEL: Business Assets (Branches) */}
          <div className="w-1/2 flex flex-col">
            {displayBrand ? (
              <>
                <div className="px-4 py-3 flex items-center justify-between border-b">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-bold text-foreground truncate">
                      {displayBrand.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {displayBrand.memberships.length} business asset{displayBrand.memberships.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 ml-2"
                    onClick={(e) => handleBrandSettings(e, displayBrand.slug)}
                    title="Brand Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="px-4 py-2 bg-muted/10 border-b">
                  <span className="text-[13px] font-bold text-foreground">Business assets</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 [&::-webkit-scrollbar]:hidden">
                  {displayBrand.memberships.map((m) => {
                    // Extract branchSlug properly (same logic as in BranchContext)
                    const branchSlug = m.branch.slug || m.branch.branchName.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
                    const isActive = activeBranch?._id === m.branch._id;
                    return (
                      <div
                        key={m.branch._id}
                        onClick={() => handleBranchSelect(displayBrand.slug, branchSlug)}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border border-transparent",
                          isActive ? "bg-primary/5 border-primary/20" : "hover:bg-accent/50"
                        )}
                      >
                        {/* Selected Radio Indicator */}
                        <div className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          isActive ? "border-primary" : "border-muted-foreground/30"
                        )}>
                          {isActive && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        
                        <Avatar className="h-9 w-9 rounded-full shrink-0 border">
                          <AvatarImage src={m.branch.logo} />
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            <Store className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold truncate text-foreground">
                            {m.branch.branchName}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {m.role.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {displayBrand.memberships.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No business assets found.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                Select a portfolio to view assets
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
