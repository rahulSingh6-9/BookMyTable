import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, MapPin, ChevronDown, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { navLinks } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/BookMyTable_logo.jpg";
import { useAuth } from "../context/AuthContext";
import { useLocationStore } from "@/store/useLocationStore";
import { useQuery } from "@tanstack/react-query";
import { getCities, getAreas } from "@/services/discovery.service";

function Navbar({ children }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  
  // Dynamic Location Selector State
  const { location: storedLocation, setCity, setArea } = useLocationStore();
  const [view, setView] = useState("city"); // "city" | "area"

  useEffect(() => {
    if (openLocation) {
      setView(storedLocation.city ? "area" : "city");
    }
  }, [openLocation, storedLocation.city]);

  const { data: citiesRes, isLoading: loadingCities } = useQuery({
    queryKey: ["cities"],
    queryFn: getCities,
    staleTime: 5 * 60 * 1000,
  });

  const { data: areasRes, isLoading: loadingAreas } = useQuery({
    queryKey: ["areas", storedLocation.city],
    queryFn: () => getAreas(storedLocation.city),
    enabled: !!storedLocation.city && view === "area",
    staleTime: 5 * 60 * 1000,
  });

  const cities = citiesRes?.data?.data || [];
  const areas = areasRes?.data?.data || [];
  
  const displayLocation = storedLocation.area 
    ? `${storedLocation.area}, ${storedLocation.city}`
    : storedLocation.city || "Select Location";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass shadow-card"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="BookMyTable" className="h-9 w-9 rounded-md object-cover" />
            <span className="text-lg font-bold text-foreground tracking-tight hidden sm:inline-block">
              Book<span className="text-primary">My</span>Table
            </span>
          </Link>

          {/* Searchable Location Selector */}
          <Popover open={openLocation} onOpenChange={setOpenLocation}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="gap-2 h-9 px-3 hover:bg-muted hidden sm:flex max-w-[200px] lg:max-w-[300px]">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium truncate">{displayLocation}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <div className="flex items-center px-3 border-b">
                  {view === "area" && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 mr-1 -ml-2 shrink-0"
                      onClick={() => setView("city")}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <CommandInput 
                    placeholder={view === "city" ? "Search city..." : `Search areas in ${storedLocation.city}...`} 
                    className="border-none focus:ring-0"
                  />
                </div>
                
                <CommandList>
                  <CommandEmpty>
                    {view === "city" ? "No city found." : "No area found."}
                  </CommandEmpty>
                  
                  {view === "city" && (
                    <CommandGroup heading="Cities">
                      {loadingCities ? (
                        <div className="p-4 text-sm text-center text-muted-foreground">Loading cities...</div>
                      ) : cities.length > 0 ? (
                        cities.map((city) => (
                          <CommandItem
                            key={city}
                            value={city}
                            onSelect={() => {
                              setCity(city);
                              setView("area");
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${storedLocation.city === city ? "opacity-100 text-primary" : "opacity-0"}`} />
                            {city}
                          </CommandItem>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-center text-muted-foreground">No cities available</div>
                      )}
                    </CommandGroup>
                  )}

                  {view === "area" && (
                    <CommandGroup heading={`Areas in ${storedLocation.city}`}>
                      <CommandItem
                        value={`all-${storedLocation.city}`}
                        onSelect={() => {
                          setArea("");
                          setOpenLocation(false);
                        }}
                      >
                        <Check className={`mr-2 h-4 w-4 ${!storedLocation.area ? "opacity-100 text-primary" : "opacity-0"}`} />
                        <span className="font-medium">All of {storedLocation.city}</span>
                      </CommandItem>

                      {loadingAreas ? (
                        <div className="p-4 text-sm text-center text-muted-foreground">Loading areas...</div>
                      ) : (
                        areas.map((area) => (
                          <CommandItem
                            key={area}
                            value={area}
                            onSelect={() => {
                              setArea(area);
                              setOpenLocation(false);
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${storedLocation.area === area ? "opacity-100 text-primary" : "opacity-0"}`} />
                            {area}
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Dynamic Context Slots (e.g. Branch Switcher) */}
        <div className="flex-1 flex justify-center px-4">
           {children}
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/search">
            <Button variant="ghost" size="icon" className="text-muted-foreground mr-2">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          {user ? ( <div >
                      <Link to="/profile" className="flex justify-center items-center gap-2">
                        <Avatar className="h-10 w-10 border shadow-sm">
                          <AvatarImage src={user.avatar || ""} className="object-cover" />
                          <AvatarFallback className="text-2xl">{user.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                      <span>Hi, {user.name}</span>
                      </Link>
                    </div>
                  ) : (
                    <Link to="/login">
                      <Button>Log in</Button>
                    </Link>
                    )
          }
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden glass"
          >
            <div className="flex flex-col gap-4 px-4 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Log in</Button>
              </Link>
              <Link to="/search" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full">Book a Table</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export { Navbar };
