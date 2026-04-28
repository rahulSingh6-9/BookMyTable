import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, User, Bell, MapPin, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { restaurants, indianCities, globalCities, navLinks } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/BookMyTable_logo.jpg";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(indianCities[0]);
  const location = useLocation();

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
              <Button variant="ghost" className="gap-2 h-9 px-3 hover:bg-muted hidden sm:flex">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{currentLocation}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search city..." />
                <CommandList>
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup heading="India">
                    {indianCities.map((city) => (
                      <CommandItem
                        key={city}
                        value={city}
                        onSelect={(currentValue) => {
                          setCurrentLocation(city);
                          setOpenLocation(false);
                        }}
                      >
                        <Check className={`mr-2 h-4 w-4 ${currentLocation === city ? "opacity-100" : "opacity-0"}`} />
                        {city}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Global">
                    {globalCities.map((city) => (
                      <CommandItem
                        key={city}
                        value={city}
                        onSelect={(currentValue) => {
                          setCurrentLocation(city);
                          setOpenLocation(false);
                        }}
                      >
                        <Check className={`mr-2 h-4 w-4 ${currentLocation === city ? "opacity-100" : "opacity-0"}`} />
                        {city}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
              <Link to="/discover" onClick={() => setMobileOpen(false)}>
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
