import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Check, MessageSquare, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { restaurants } from "@/lib/data";
import { restaurantSettings, restaurantTables } from "@/lib/mockData";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { useLayout } from "@/hooks/useLayout";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import { GuestSelector } from "@/components/booking/GuestSelector";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { TableLayoutViewer } from "@/components/visual-layout/TableLayoutViewer";
import { RoomSelector } from "@/components/visual-layout/RoomSelector";
import { useAuth } from "@/context/AuthContext";

export default function TableBooking() {
  const { id } = useParams();
  const restaurant = restaurants.find((r) => r.id === id) || restaurants[0];
  const settings = restaurantSettings[restaurant.id] || restaurantSettings["1"];
  const tables = (restaurantTables[restaurant.id] || restaurantTables["1"]).filter((t) => t.isActive);
  const { rooms, activeRoom, activeRoomId, setActiveRoomId } = useLayout(restaurant.id || "1");
  const { user, isLoggedIn } = useAuth();

  const [step, setStep] = useState(1);
  const [guests, setGuests] = useState(settings.minGuestsPerBooking || 2);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");

  const { slots, isClosed } = useAvailableSlots(settings, date);

  // Filter tables by guest capacity
  const suitableTables = tables.filter((t) => t.capacity >= guests);

  const handleConfirm = () => setStep(4);

  // Calculate max booking date
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + (settings.advanceBookingDays || 30));
  const maxDateStr = maxDate.toISOString().split("T")[0];
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 text-2xl font-bold text-foreground">Book a Table</h1>
          <p className="mb-8 text-muted-foreground">{restaurant.name} · {restaurant.address}</p>

          {/* Progress */}
          <div className="mb-8 flex items-center gap-2">
            {["Details", "Table", "Info", "Done"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step > i + 1 ? "bg-accent text-accent-foreground" : step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className="hidden text-sm text-muted-foreground sm:block">{label}</span>
                {i < 3 && <div className="h-px w-8 bg-border" />}
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {step === 1 && (
                <div className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-card">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-card-foreground">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={date}
                        min={todayStr}
                        max={maxDateStr}
                        onChange={(e) => { setDate(e.target.value); setSelectedSlot(null); }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <GuestSelector
                    value={guests}
                    onChange={setGuests}
                    min={settings.minGuestsPerBooking}
                    max={settings.maxGuestsPerBooking}
                  />

                  {/* Dynamic Time Slots */}
                  {date && isClosed && (
                    <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4 text-center">
                      <p className="text-sm font-medium text-destructive">Restaurant is closed on this date</p>
                      <p className="text-xs text-muted-foreground mt-1">Please select a different date</p>
                    </div>
                  )}

                  {date && !isClosed && slots.length === 0 && (
                    <div className="rounded-md border border-border bg-muted/50 p-4 text-center">
                      <p className="text-sm font-medium text-muted-foreground">No slots available</p>
                      <p className="text-xs text-muted-foreground mt-1">All time slots for this date have passed</p>
                    </div>
                  )}

                  {date && !isClosed && slots.length > 0 && (
                    <TimeSlotPicker slots={slots} selected={selectedSlot} onSelect={setSelectedSlot} />
                  )}

                  {!date && (
                    <div className="space-y-2">
                      <label className="mb-2 block text-sm font-medium text-foreground">Available Times</label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <Skeleton key={i} className="h-10 rounded-md" />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Select a date to see available times</p>
                    </div>
                  )}

                  <Button onClick={() => setStep(2)} disabled={!selectedSlot || !date} className="w-full">Continue</Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-card">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-foreground">Select a Table</label>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 block" /> Available
                        <span className="w-2.5 h-2.5 rounded-full bg-destructive/30 block ml-2" /> Booked/Unavailable
                      </span>
                    </div>
                    
                    <RoomSelector 
                      rooms={rooms}
                      activeRoomId={activeRoomId}
                      onSelect={setActiveRoomId}
                    />

                    <TableLayoutViewer 
                      room={activeRoom}
                      selectedTable={selectedTable}
                      onSelectTable={(table) => setSelectedTable(table)}
                      guestsCount={guests}
                    />
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-border/40">
                    <Button variant="outline" onClick={() => setStep(1)} className="rounded-lg">Back</Button>
                    <Button onClick={() => setStep(2.5)} disabled={!selectedTable} className="flex-1 rounded-lg">Continue to Details</Button>
                  </div>
                </div>
              )}

              {step === 2.5 && (
                <div className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-card">
                  {!isLoggedIn ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in">
                      <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-2xl font-black text-foreground mb-2">Login to book a table</h2>
                      <p className="text-muted-foreground mb-6 text-sm max-w-sm">Please login or create an account to securely complete your reservation.</p>
                      <div className="flex w-full max-w-xs flex-col gap-3">
                        <Button onClick={() => window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname)} className="w-full">Login</Button>
                        <Button onClick={() => window.location.href = "/signup?redirect=" + encodeURIComponent(window.location.pathname)} variant="outline" className="w-full">Create Account</Button>
                        <Button variant="ghost" onClick={() => setStep(2)} className="w-full text-muted-foreground mt-2">Back to Tables</Button>
                      </div>
                    </div>
                  ) : (!user?.isPhoneVerified && !user?.verification?.phoneVerified) ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in">
                      <div className="bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-orange-500" />
                      </div>
                      <h2 className="text-2xl font-black text-foreground mb-2">Phone verification required</h2>
                      <p className="text-muted-foreground mb-6 text-sm max-w-sm">Please verify your phone number to continue booking.</p>
                      <div className="flex w-full max-w-xs flex-col gap-3">
                        <Button onClick={() => window.location.href = "/settings/profile"} className="w-full bg-orange-500 hover:bg-orange-600">Verify Phone Number</Button>
                        <Button variant="ghost" onClick={() => setStep(2)} className="w-full text-muted-foreground mt-2">Back to Tables</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in">
                       <h2 className="text-xl font-bold mb-4">Verification Complete</h2>
                       <Button onClick={() => setStep(3)} className="w-full max-w-xs">Proceed to Details</Button>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-card">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-card-foreground">Full Name</label>
                    <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-card-foreground">Phone Number</label>
                    <Input placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-card-foreground">Special Request</label>
                    <Textarea
                      placeholder="Any special requirements? (optional)"
                      value={specialRequest}
                      onChange={(e) => setSpecialRequest(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button onClick={handleConfirm} disabled={!name} className="flex-1">Confirm Booking</Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="rounded-lg border border-border bg-card p-8 shadow-card text-center">
                  <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                    <Check className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold text-card-foreground">Booking Confirmed!</h2>
                  <p className="mt-2 text-muted-foreground">
                    {restaurant.name} · {date} · {selectedSlot} · {guests} guests
                  </p>
                  {selectedTable && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedTable.tableNumber} · <span className="capitalize">{selectedTable.type}</span>
                    </p>
                  )}
                  {specialRequest && (
                    <div className="mt-3 flex items-start justify-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>"{specialRequest}"</span>
                    </div>
                  )}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link to="/booking-history"><Button>View My Bookings</Button></Link>
                    <Link to="/discover"><Button variant="outline">Discover More</Button></Link>
                  </div>
                </div>
              )}
            </div>

            <div>
              <BookingSummary
                restaurant={restaurant}
                date={date}
                time={selectedSlot}
                guests={guests}
                table={selectedTable ? { label: selectedTable.tableNumber, type: selectedTable.type, seats: selectedTable.capacity } : null}
              />
              {settings.cancellationPolicy && (
                <p className="mt-3 text-center text-xs text-muted-foreground">{settings.cancellationPolicy}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
