import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MapPin, Phone, Clock, Heart, Share2, ChevronLeft, Users, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { restaurants, menuItems } from "@/lib/data";
import { restaurantSettings, DAYS_OF_WEEK } from "@/lib/mockData";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { RestaurantInfo } from "@/components/restaurant/RestaurantInfo";

const menuCategories = ["All", "Starters", "Sashimi", "Rolls", "Premium", "Desserts"];

function TodayStatus({ settings }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const dayIndex = new Date().getDay();
  const dayName = DAYS_OF_WEEK[dayIndex === 0 ? 6 : dayIndex - 1];
  const dayData = settings.openingHours?.[dayName];
  const special = settings.specialDays?.find((s) => s.date === todayStr);

  const isClosed = special?.isOpen === false || (!special && (!dayData || !dayData.isOpen));

  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${isClosed ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>
      <span className={`h-2 w-2 rounded-full ${isClosed ? "bg-destructive" : "bg-accent"}`} />
      {isClosed ? "Closed Today" : "Open Now"}
    </div>
  );
}

function WeeklyPreview({ openingHours }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-sm font-medium text-foreground mb-2">Weekly Hours</h4>
      {DAYS_OF_WEEK.map((day) => {
        const d = openingHours?.[day];
        return (
          <div key={day} className="flex items-center justify-between text-xs">
            <span className="capitalize text-muted-foreground w-20">{day}</span>
            {d?.isOpen && d.slots?.length > 0 ? (
              <span className="text-foreground">{d.slots.map((s) => `${s.open}–${s.close}`).join(", ")}</span>
            ) : (
              <span className="text-destructive/70">Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const restaurant = restaurants.find((r) => r.id === id) ?? restaurants[0];
  const settings = restaurantSettings[restaurant.id] || restaurantSettings["1"];

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [guests, setGuests] = useState(2);
  const [activeCategory, setActiveCategory] = useState("All");
  const [booked, setBooked] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const { slots: todaySlots, isClosed: todayClosed } = useAvailableSlots(settings, todayStr);

  const filteredMenu = activeCategory === "All" ? menuItems : menuItems.filter((m) => m.category === activeCategory);
  const handleBook = () => { if (selectedSlot) setBooked(true); };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 lg:h-96">
        <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link to="/discover"><Button variant="ghost" size="icon" className="glass"><ChevronLeft className="h-4 w-4" /></Button></Link>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="ghost" size="icon" className="glass"><Heart className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="glass"><Share2 className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid gap-8 py-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-4 flex items-center gap-3">
                <RestaurantInfo restaurant={restaurant} />
              </div>
              <div className="mb-6">
                <TodayStatus settings={settings} />
              </div>
            </motion.div>

            {/* Menu */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">Menu</h2>
              <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                {menuCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="divide-y divide-border rounded-lg border border-border">
                {filteredMenu.map((item) => (
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
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-lg border border-border bg-card p-6 shadow-card">
                <AnimatePresence mode="wait">
                  {booked ? (
                    <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                      <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                        <Check className="h-7 w-7 text-accent" />
                      </div>
                      <h3 className="text-lg font-semibold text-card-foreground">Booking Confirmed!</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{restaurant.name} · {selectedSlot} · {guests} guests</p>
                      <Button variant="outline" className="mt-6" onClick={() => setBooked(false)}>Book Another</Button>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <h3 className="mb-4 text-lg font-semibold text-card-foreground">Reserve a Table</h3>
                      {/* Guests */}
                      <div className="mb-4">
                        <label className="mb-1.5 block text-sm font-medium text-card-foreground">Party Size</label>
                        <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2.5">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-transparent text-sm text-foreground outline-none">
                            {Array.from({ length: settings.maxGuestsPerBooking - settings.minGuestsPerBooking + 1 }, (_, i) => i + settings.minGuestsPerBooking).map((n) => (
                              <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {/* Today's Time slots */}
                      <div className="mb-6">
                        <label className="mb-1.5 block text-sm font-medium text-card-foreground">Today's Available Times</label>
                        {todayClosed ? (
                          <p className="text-sm text-destructive">Closed today</p>
                        ) : todaySlots.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No more slots available today</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {todaySlots.map((slot) => (
                              <button
                                key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${selectedSlot === slot ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background text-foreground hover:border-primary/50"}`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button className="w-full" disabled={!selectedSlot} onClick={handleBook}>
                        {selectedSlot ? `Book for ${selectedSlot}` : "Select a Time"}
                      </Button>
                      <div className="mt-3 flex flex-col items-center gap-2">
                        <p className="text-xs text-muted-foreground">{settings.cancellationPolicy}</p>
                        <Link to={`/book/${restaurant.id}`}>
                          <Button variant="link" size="sm" className="text-xs">Book for a different date →</Button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Weekly schedule preview */}
              <div className="rounded-lg border border-border bg-card p-5 shadow-card">
                <WeeklyPreview openingHours={settings.openingHours} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
