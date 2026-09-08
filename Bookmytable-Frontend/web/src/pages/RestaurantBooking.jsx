import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, ChevronLeft, MapPin, Users, Layers, ShieldAlert, Clock, Calendar as CalendarIcon, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Context & Services
import { useCart } from "@/context/CartContext";
import { getRestaurantDetails, getRestaurantMenu } from "@/services/discovery.service";
import { getRestaurantAvailability } from "@/services/booking.service";

// Components
import { RestaurantMenuTabs } from "@/components/restaurant/RestaurantMenuTabs";
import { FloatingCartFooter } from "@/components/restaurant/FloatingCartFooter";
import { RestaurantHero } from "@/components/restaurant/RestaurantHero";

export default function RestaurantBooking() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const guestsParam = searchParams.get("guests") ? Number(searchParams.get("guests")) : 2;

  // 1. Fetch Restaurant Details
  const { data: detailsRes, isLoading: detailsLoading, error: detailsErr } = useQuery({
    queryKey: ["restaurant", slug],
    queryFn: () => getRestaurantDetails(slug),
    staleTime: 5 * 60 * 1000,
  });

  const restaurant = detailsRes?.data?.data;

  // 2. Fetch Menu Data
  const { data: menuRes, isLoading: menuLoading } = useQuery({
    queryKey: ["menu", slug],
    queryFn: () => getRestaurantMenu(slug),
    staleTime: 5 * 60 * 1000,
  });

  // 3. Fetch Availability
  const { data: availabilityRes, isLoading: availabilityLoading } = useQuery({
    queryKey: ["availability", restaurant?.slug || restaurant?.restaurantId, dateParam, guestsParam],
    queryFn: () => getRestaurantAvailability(restaurant?.slug || restaurant?.restaurantId, dateParam, guestsParam),
    enabled: !!restaurant && !!dateParam,
  });

  const { updateReservation, openCheckout, reservationDetails } = useCart();

  const [selectedTableIds, setSelectedTableIds] = useState(() => {
    if (reservationDetails?.selectedTables?.length > 0) {
      return reservationDetails.selectedTables.map(t => t.tableId);
    }
    return [];
  });
  const [activeFloor, setActiveFloor] = useState("");

  const location = useLocation();

  // Redirect if missing params
  useEffect(() => {
    // Only redirect if we are actually still on the booking route
    // This prevents the redirect from intercepting and breaking concurrent React Router transitions to other pages
    if (!detailsLoading && restaurant && (!dateParam || !timeParam) && location.pathname.includes("/book")) {
      navigate(`/restaurant/${restaurant.slug}`, { replace: true });
    }
  }, [detailsLoading, restaurant, dateParam, timeParam, navigate, location.pathname]);

  // Compute available tables
  const allRestaurantTables = restaurant?.tables || [];
  const backendAvailableTables = availabilityRes?.data?.data?.tables || [];
  
  const matchingTables = useMemo(() => {
    return backendAvailableTables.filter(t => {
      // Only filter by capacity, we still want to show them if they are reserved
      if (t.capacity < guestsParam) return false;
      return true;
    }).map(t => {
      const isReserved = t.status === "reserved" || !t.availableSlots?.includes(timeParam);
      return { ...t, isReserved };
    });
  }, [backendAvailableTables, guestsParam, timeParam]);

  const { floorGroups, floorNames } = useMemo(() => {
    const groups = {};
    matchingTables.forEach(table => {
      const floorName = table.floorLabel || "Main Floor";
      const sectionName = table.sectionLabel || "Main Area";

      if (!groups[floorName]) groups[floorName] = {};
      if (!groups[floorName][sectionName]) groups[floorName][sectionName] = [];
      
      groups[floorName][sectionName].push(table);
    });
    return { floorGroups: groups, floorNames: Object.keys(groups) };
  }, [matchingTables]);

  useEffect(() => {
    if (floorNames.length > 0 && (!activeFloor || !floorNames.includes(activeFloor))) {
      setActiveFloor(floorNames[0]);
    }
  }, [floorNames, activeFloor]);

  const selectedTableObjs = useMemo(() => {
    return matchingTables.filter(t => selectedTableIds.includes(t.id));
  }, [matchingTables, selectedTableIds]);

  // Sync to Cart
  useEffect(() => {
    // 🛑 CRITICAL FIX: Do not update global CartContext if we are navigating away.
    // Updating context during a React Router transition aborts the transition and freezes the UI.
    if (!location.pathname.includes("/book")) return;

    if (selectedTableIds.length > 0 && dateParam && timeParam) {
      const formattedTables = selectedTableObjs.map(t => ({
        tableId: t.id,
        tableName: t.name || "",
        tableType: t.type || "indoor",
        tablePrice: t.price || 0,
        sectionLabel: t.sectionLabel || "Main Area",
        floorLabel: t.floorLabel || "Main Floor",
        priceSource: t.priceSource || "none",
        capacity: t.capacity || 1
      }));
      updateReservation({
        date: new Date(dateParam),
        time: timeParam,
        guests: guestsParam,
        selectedTables: formattedTables
      });
    } else {
      updateReservation({
        date: dateParam ? new Date(dateParam) : new Date(),
        time: timeParam || "",
        guests: guestsParam,
        selectedTables: []
      });
    }
  }, [selectedTableIds, dateParam, timeParam, guestsParam, selectedTableObjs, updateReservation, location.pathname]);


  // Loading State
  if (detailsLoading || !dateParam || !timeParam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Setting up your reservation...</p>
      </div>
    );
  }

  if (detailsErr || !restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16 bg-background px-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
        <p className="text-muted-foreground mb-6">Could not load reservation details.</p>
        <Button onClick={() => navigate(-1)} variant="default">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      
      {/* Hero Section */}
      <RestaurantHero restaurant={restaurant} />

      <div className="container mx-auto px-4 lg:px-8 mt-8">
        
        {/* STICKY TOP RESERVATION BAR */}
        <div className="sticky top-16 z-30 max-w-7xl mx-auto bg-background/95 backdrop-blur-md border-b border-border/40 py-4 mb-8 shadow-sm px-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-foreground">
              <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-primary" /> {dateParam}</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {timeParam}</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> {guestsParam} Guests</span>
              {selectedTableObjs.length > 0 && (
                <>
                  <div className="hidden md:block w-px h-4 bg-border" />
                  <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-primary" /> 
                    {selectedTableObjs.length} Table{selectedTableObjs.length > 1 ? 's' : ''} Selected
                  </span>
                </>
              )}
            </div>
            <Button variant="outline" size="sm" className="font-bold border-border/60 hover:bg-muted shadow-sm w-full md:w-auto" onClick={() => navigate(`/restaurant/${restaurant.slug}`)}>
              Change Details
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">
          
          {/* Step 1: Menu (Left Column) */}
          <div className="lg:col-span-7 lg:order-1 order-2">
            <section id="booking-menu">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-foreground tracking-tight">Add to your order <span className="text-muted-foreground/60 text-lg font-bold ml-2">(Optional)</span></h2>
              </div>
              <RestaurantMenuTabs menuRes={menuRes} menuLoading={menuLoading} />
            </section>
          </div>

          {/* Step 2: Table Selection (Right Column) */}
          <div className="lg:col-span-5 lg:order-2 order-1 lg:sticky lg:top-[120px]">
            <section className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Select a Table</h2>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">Choose your preferred seating</p>
                </div>
                {availabilityLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              </div>

              {!availabilityLoading && matchingTables.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center bg-muted/10">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">No Tables Available</h3>
                  <p className="text-muted-foreground mb-6 text-sm">There are no tables available that can accommodate {guestsParam} guests at {timeParam}.</p>
                  <Button onClick={() => navigate(`/restaurant/${restaurant.slug}`)} variant="outline" className="font-bold">Change Date / Time</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {floorNames.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border/50">
                      <div className="flex flex-wrap gap-2">
                        {floorNames.map(floor => (
                          <button 
                            key={floor} 
                            onClick={() => setActiveFloor(floor)} 
                            className={cn(
                              "px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border", 
                              activeFloor === floor 
                                ? "bg-foreground text-background border-foreground scale-105" 
                                : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                            )}
                          >
                            {floor}
                          </button>
                        ))}
                      </div>
                      
                      {/* View Layout Button Placeholder */}
                      <Button variant="outline" size="sm" className="hidden sm:flex gap-2 font-bold text-xs" onClick={() => alert("Layout View coming soon!")}>
                        <Layers className="w-4 h-4" /> View Layout
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pb-4">
                    {activeFloor && floorGroups[activeFloor] && Object.entries(floorGroups[activeFloor]).map(([sectionName, sectionTables]) => (
                      sectionTables.map((table) => {
                        const isSelected = selectedTableIds.includes(table.id);
                        return (
                            <button 
                              key={table.id} 
                              disabled={table.isReserved}
                              onClick={() => {
                                setSelectedTableIds(prev => 
                                  prev.includes(table.id) 
                                    ? prev.filter(id => id !== table.id)
                                    : [...prev, table.id]
                                );
                              }} 
                              className={cn(
                                "group relative flex flex-col rounded-2xl border-2 p-5 text-left transition-all overflow-hidden", 
                                table.isReserved 
                                  ? "opacity-50 cursor-not-allowed border-border/40 bg-muted/20 grayscale-[0.5]" 
                                  : isSelected 
                                    ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-md scale-[1.02] z-10" 
                                    : "border-border/60 bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5"
                              )}
                            >
                              {isSelected && (
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -z-10" />
                              )}
                              {isSelected && (
                                <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                              )}
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-black text-xl text-foreground flex items-center gap-2">
                                    {table.name}
                                    {table.isReserved && <span className="text-[10px] bg-muted-foreground/10 text-muted-foreground px-2 py-0.5 rounded-md uppercase tracking-wider border border-border">Reserved</span>}
                                  </h4>
                                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1.5 flex items-center gap-1.5 bg-muted/50 w-fit px-2 py-1 rounded-md">
                                    <Layers className="h-3 w-3" /> {sectionName}
                                  </p>
                                </div>
                                <div className="text-right mt-1 mr-8">
                                  {table.price > 0 ? (
                                    <div className="font-black text-lg text-foreground">₹{table.price}</div>
                                  ) : (
                                    <div className="font-black text-sm text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200">FREE</div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mt-2 pt-4 border-t border-border/50 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground/80">
                                  <Users className="h-4 w-4" /> Up to {table.capacity} Guests
                                </span>
                                <span className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground/80 capitalize">
                                  <MapPin className="h-4 w-4" /> {table.type.replace('_', ' ')}
                                </span>
                              </div>
                            </button>
                        );
                      })
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

        </div>
      </div>

      <FloatingCartFooter forceShow={selectedTableIds.length > 0} />
    </div>
  );
}
