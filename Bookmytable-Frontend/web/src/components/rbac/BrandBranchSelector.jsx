import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Plus,
  X,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useIsMobile } from "@/hooks/use-mobile";

export const BrandBranchSelector = ({ className, collapsed = false }) => {
  const { brands, activeBrand, activeBrandSlug, switchBrand } = useBrand();
  const { activeBranch, activeBranchSlug, switchBranch } = useBranch();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredBrandSlug, setHoveredBrandSlug] = useState(null);
  const [mobileTab, setMobileTab] = useState("portfolios"); // "portfolios" | "assets"
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
    if (isMobile) {
      // On mobile, tapping a brand switches to the assets tab to show branches
      setHoveredBrandSlug(brandSlug);
      setMobileTab("assets");
      return;
    }
    switchBrand(brandSlug);
    switchBranch(null); // Clear branch context
    setOpen(false);
    navigate(`/brand/${brandSlug}/details`);
  };

  const handleBrandNavigate = (brandSlug) => {
    switchBrand(brandSlug);
    switchBranch(null);
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
    handleBrandNavigate(brandSlug);
  };

  // Reset mobile tab when popover opens
  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (newOpen) {
      setMobileTab("portfolios");
      setSearchQuery("");
    }
  };

  if (brands.length === 0) return null;

  // ──── MOBILE LAYOUT ────
  if (isMobile) {
    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-auto border-border/60 hover:bg-muted/50 transition-all rounded-xl shadow-sm w-full bg-background",
              collapsed ? "justify-center p-1 w-10 h-10" : "justify-between p-1.5 flex-1 min-w-0",
              className
            )}
          >
            <div className="flex items-center gap-2 min-w-0 w-full justify-center">
              <div className="relative shrink-0">
                <Avatar className={cn("rounded-lg border border-border/50", collapsed ? "h-6 w-6" : "h-8 w-8")}>
                  {activeBrand?.logo ? (
                    <AvatarImage src={activeBrand.logo} alt={activeBrand.name} />
                  ) : (
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                      {activeBrand?.name?.charAt(0) || "B"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              
              {!collapsed && (
                <div className="flex flex-col items-start text-left min-w-0">
                  <span className="text-xs font-bold text-foreground truncate w-full">
                    {activeBrand?.name || "Select Brand"}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate w-full font-medium">
                    {activeBranch ? activeBranch.branchName : "Brand Management"}
                  </span>
                </div>
              )}
            </div>
            
            {!collapsed && (
              <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-40" />
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[calc(100vw-2rem)] max-w-[360px] p-0 rounded-xl overflow-hidden border-border/80 shadow-2xl flex flex-col" 
          align="start"
          side="bottom"
          sideOffset={8}
        >
          {/* Compact search header */}
          <div className="px-2.5 py-2 border-b flex items-center gap-2 bg-card/60">
            <div className="flex items-center gap-1.5 flex-1 border border-border/70 rounded-full px-2.5 py-0.5 bg-background focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <Search className="h-3 w-3 text-muted-foreground shrink-0" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..." 
                className="h-5 w-full border-none bg-transparent p-0 text-[11px] text-foreground placeholder:text-muted-foreground/70 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none ring-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground text-xs p-0.5 transition-colors focus:outline-none"
                  title="Clear search"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex border-b bg-muted/30">
            <button
              type="button"
              onClick={() => setMobileTab("portfolios")}
              className={cn(
                "flex-1 text-[11px] font-semibold py-2 text-center transition-colors relative",
                mobileTab === "portfolios" 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Portfolios
              {mobileTab === "portfolios" && (
                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("assets")}
              className={cn(
                "flex-1 text-[11px] font-semibold py-2 text-center transition-colors relative",
                mobileTab === "assets" 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {displayBrand ? displayBrand.name : "Assets"}
              {mobileTab === "assets" && (
                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
              )}
            </button>
          </div>

          <div className="h-[260px] bg-background overflow-hidden">
            {/* PORTFOLIOS TAB */}
            {mobileTab === "portfolios" && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto px-1.5 py-1.5 space-y-0.5 [&::-webkit-scrollbar]:hidden">
                  {filteredBrands.map((b) => {
                    const isSelected = displayBrandSlug === b.slug;
                    return (
                      <div
                        key={b.slug}
                        onClick={() => handleBrandSelect(b.slug)}
                        className={cn(
                          "flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors",
                          isSelected ? "bg-accent/80" : "hover:bg-accent/40"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="h-7 w-7 rounded-md shrink-0 bg-primary/10 text-primary">
                            {b.logo ? (
                              <AvatarImage src={b.logo} />
                            ) : (
                              <AvatarFallback className="rounded-md font-bold text-[10px]">
                                {b.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold truncate text-foreground">
                              {b.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {b.memberships.length} asset{b.memberships.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-2 mt-auto border-t">
                  <Button variant="outline" size="sm" className="w-full justify-center text-[11px] font-medium h-7">
                    Create a business portfolio
                  </Button>
                </div>
              </div>
            )}

            {/* ASSETS TAB */}
            {mobileTab === "assets" && (
              <div className="flex flex-col h-full">
                {displayBrand ? (
                  <>
                    <div className="px-2.5 py-2 flex items-center justify-between border-b">
                      <div className="flex items-center gap-2 min-w-0">
                        <button 
                          type="button"
                          onClick={() => setMobileTab("portfolios")}
                          className="shrink-0 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground truncate">
                            {displayBrand.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {displayBrand.memberships.length} asset{displayBrand.memberships.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                        onClick={(e) => handleBrandSettings(e, displayBrand.slug)}
                        title="Brand Settings"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-1.5 py-1.5 space-y-0.5 [&::-webkit-scrollbar]:hidden">
                      {displayBrand.memberships.map((m) => {
                        const branchSlug = m.branch.slug || m.branch.branchName.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
                        const isActive = activeBranch?._id === m.branch._id;
                        return (
                          <div
                            key={m.branch._id}
                            onClick={() => handleBranchSelect(displayBrand.slug, branchSlug)}
                            className={cn(
                              "flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors border border-transparent",
                              isActive ? "bg-primary/5 border-primary/20" : "hover:bg-accent/50"
                            )}
                          >
                            <div className={cn(
                              "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
                              isActive ? "border-primary" : "border-muted-foreground/30"
                            )}>
                              {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                            </div>
                            
                            <Avatar className="h-7 w-7 rounded-full shrink-0 border">
                              <AvatarImage src={m.branch.logo} />
                              <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                                <Store className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold truncate text-foreground">
                                {m.branch.branchName}
                              </span>
                              <span className="text-[10px] text-muted-foreground capitalize">
                                {m.role.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {displayBrand.memberships.length === 0 && (
                        <div className="p-3 text-center text-xs text-muted-foreground">
                          No business assets found.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                    Select a portfolio first
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // ──── DESKTOP LAYOUT (unchanged) ────
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
        <div className="px-3.5 py-2.5 border-b flex items-center justify-between gap-3 bg-card/60">
          <div className="flex items-center gap-2 flex-1 max-w-[280px] border border-border/70 rounded-full px-3 py-1 bg-background focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a business asset..." 
              className="h-6 w-full border-none bg-transparent p-0 text-xs text-foreground placeholder:text-muted-foreground/70 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none ring-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground text-xs p-0.5 transition-colors focus:outline-none"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 select-none shrink-0 pr-1 hover:opacity-85 transition-opacity cursor-pointer focus:outline-none"
            title="Go to BookMyTable Home"
          >
            <BrandLogo className="h-7 w-auto max-w-[38px] rounded-lg object-contain shrink-0" />
            <span className="text-[14px] font-bold tracking-tight text-foreground">
              Book<span className="text-primary">My</span>Table
            </span>
          </Link>
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
                    onClick={() => handleBrandNavigate(b.slug)}
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
