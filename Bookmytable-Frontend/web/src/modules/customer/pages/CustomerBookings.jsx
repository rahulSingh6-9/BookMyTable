import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Users,
  QrCode,
  Star,
  XCircle,
  MessageSquare,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Ticket,
  CalendarCheck
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common/EmptyState";

export default function CustomerBookings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");

  // Booking details list
  const [bookings, setBookings] = useState([
    {
      id: "BM-92813",
      restaurantId: "1",
      restaurantName: "Sakura Omakase",
      cuisine: "Japanese",
      date: "2026-05-18",
      time: "7:00 PM",
      guests: 2,
      table: "Table 4 (Tatami)",
      status: "confirmed",
      price: "$120",
      code: "BMT-SAK-492"
    },
    {
      id: "BM-92412",
      restaurantId: "2",
      restaurantName: "Trattoria Bella",
      cuisine: "Italian",
      date: "2026-05-24",
      time: "8:00 PM",
      guests: 4,
      table: "Table 11 (Terrace)",
      status: "pending",
      price: "$85",
      code: "BMT-TRA-108"
    },
    {
      id: "BM-81923",
      restaurantId: "3",
      restaurantName: "The Capital Grill",
      cuisine: "Steakhouse",
      date: "2026-05-02",
      time: "7:30 PM",
      guests: 2,
      table: "Table 8 (Indoor)",
      status: "completed",
      price: "$195",
      code: "BMT-CAP-992",
      reviewed: false
    },
    {
      id: "BM-81203",
      restaurantId: "6",
      restaurantName: "Siam Garden",
      cuisine: "Thai",
      date: "2026-04-12",
      time: "6:00 PM",
      guests: 3,
      table: "Table 2 (Window)",
      status: "cancelled",
      price: "$60",
      code: "BMT-SIA-204"
    }
  ]);

  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const handleCancelBooking = (id, name) => {
    setBookings(prev => 
      prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b)
    );
    toast.success(`Reservation at ${name} cancelled successfully.`);
  };

  const handleOpenReview = (booking) => {
    setReviewingBooking(booking);
    setReviewStars(5);
    setReviewText("");
  };

  const handleSubmitReview = () => {
    setBookings(prev => 
      prev.map(b => b.id === reviewingBooking.id ? { ...b, reviewed: true } : b)
    );
    toast.success("Thank you for your rating! Review submitted successfully.");
    setReviewingBooking(null);
  };

  // Filter lists based on state
  const upcomingList = useMemo(() => bookings.filter(b => b.status === "confirmed"), [bookings]);
  const pendingList = useMemo(() => bookings.filter(b => b.status === "pending"), [bookings]);
  const completedList = useMemo(() => bookings.filter(b => b.status === "completed"), [bookings]);
  const cancelledList = useMemo(() => bookings.filter(b => b.status === "cancelled"), [bookings]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-12">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          My Reservations
        </h1>
        <p className="text-xs md:text-sm text-slate-500">Manage, review, and track details of your restaurant bookings</p>
      </div>

      {/* RESERVATION TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-slate-100 p-1 rounded-xl shadow-sm space-x-1 h-11 w-full max-w-md">
          <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs flex-1">
            Confirmed <Badge variant="secondary" className="ml-1 px-1.5 h-4.5 rounded-full text-[9px] bg-slate-100 text-slate-600">{upcomingList.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs flex-1">
            Pending <Badge variant="secondary" className="ml-1 px-1.5 h-4.5 rounded-full text-[9px] bg-slate-100 text-slate-600">{pendingList.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs flex-1">
            Completed <Badge variant="secondary" className="ml-1 px-1.5 h-4.5 rounded-full text-[9px] bg-slate-100 text-slate-600">{completedList.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs flex-1">
            Cancelled <Badge variant="secondary" className="ml-1 px-1.5 h-4.5 rounded-full text-[9px] bg-slate-100 text-slate-600">{cancelledList.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* UPCOMING TABS */}
          <TabsContent value="upcoming" className="mt-0 focus-visible:outline-none">
            {upcomingList.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {upcomingList.map(b => (
                  <BookingItemCard 
                    key={b.id} 
                    booking={b} 
                    onCancel={() => handleCancelBooking(b.id, b.restaurantName)} 
                  />
                ))}
              </div>
            ) : (
              <EmptyBookingsState onDiscover={() => navigate("/profile/discover")} />
            )}
          </TabsContent>

          {/* PENDING TABS */}
          <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
            {pendingList.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {pendingList.map(b => (
                  <BookingItemCard key={b.id} booking={b} isPending={true} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No pending confirmations"
                description="We notify you via email and push alert as soon as the merchant accepts."
                actionLabel="Explore fine dining"
                onAction={() => navigate("/profile/discover")}
              />
            )}
          </TabsContent>

          {/* COMPLETED TABS */}
          <TabsContent value="completed" className="mt-0 focus-visible:outline-none">
            {completedList.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {completedList.map(b => (
                  <BookingItemCard 
                    key={b.id} 
                    booking={b} 
                    isCompleted={true} 
                    onReview={() => handleOpenReview(b)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No completed visits yet"
                description="Once you check in at the host desk, your status shifts automatically."
                actionLabel="Book a dining slot"
                onAction={() => navigate("/profile/discover")}
              />
            )}
          </TabsContent>

          {/* CANCELLED TABS */}
          <TabsContent value="cancelled" className="mt-0 focus-visible:outline-none">
            {cancelledList.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {cancelledList.map(b => (
                  <BookingItemCard key={b.id} booking={b} isCancelled={true} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No cancelled bookings"
                description="Everything runs smoothly! Clean history is good record keeping."
                actionLabel="Discover gourmet spots"
                onAction={() => navigate("/profile/discover")}
              />
            )}
          </TabsContent>
        </AnimatePresence>

      </Tabs>

      {/* LEAVE REVIEW MODAL */}
      <Dialog open={!!reviewingBooking} onOpenChange={(open) => !open && setReviewingBooking(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-950 font-extrabold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
              Rate your experience
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Tell us how was your meal at {reviewingBooking?.restaurantName}. Your feedback helps other gourmet foodies.
            </DialogDescription>
          </DialogHeader>

          {/* Rating stars selector */}
          <div className="flex flex-col items-center gap-3 py-4">
            <span className="text-xs font-bold text-slate-400">YOUR RATING SCORE</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewStars(star)}
                  className="p-1 hover:scale-110 active:scale-95 transition"
                >
                  <Star 
                    className={`h-7 w-7 transition ${
                      star <= reviewStars
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`} 
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-600">
              {reviewStars === 5 ? "Incredible experience!" : reviewStars === 4 ? "Loved it!" : reviewStars === 3 ? "Decent meal" : reviewStars === 2 ? "Could be better" : "Disappointed"}
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">Write comments</span>
            <Textarea
              placeholder="What did you love about their food, atmosphere, or table service?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-24 text-xs"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setReviewingBooking(null)}>
              Cancel
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/95 text-white rounded-xl" onClick={handleSubmitReview}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function EmptyBookingsState({ onDiscover }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-4 shadow-sm">
      <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner">
        <CalendarDays className="h-7 w-7" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-extrabold text-slate-900">No active reservations</h3>
        <p className="text-xs text-slate-500">Plan your next breakfast, lunch, or romantic dinner. Get instant confirm with host desks.</p>
      </div>
      <Button size="sm" className="bg-primary hover:bg-primary/95 text-white rounded-xl shadow-md shadow-primary/10" onClick={onDiscover}>
        Book a Table
      </Button>
    </div>
  );
}

/* HIGH-FIDELITY RESERVATION CARD MODULE */
function BookingItemCard({ booking, onCancel, isPending, isCompleted, isCancelled, onReview }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
    >
      <div className="space-y-3.5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{booking.cuisine} cuisine</span>
            <h3 className="font-extrabold text-slate-950 text-base">{booking.restaurantName}</h3>
          </div>
          
          {/* Status Badge */}
          {isCancelled ? (
            <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg px-2.5 py-1">Cancelled</Badge>
          ) : isPending ? (
            <Badge className="bg-amber-50 hover:bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100 rounded-lg px-2.5 py-1">Pending host approval</Badge>
          ) : isCompleted ? (
            <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100 rounded-lg px-2.5 py-1">Visited</Badge>
          ) : (
            <Badge className="bg-primary/10 hover:bg-primary/15 text-primary text-[10px] font-bold border border-primary/20 rounded-lg px-2.5 py-1">Confirmed</Badge>
          )}
        </div>

        {/* Dynamic Reservation properties */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DATE & TIME</span>
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              {booking.date}
            </span>
            <span className="text-[10px] text-slate-500 ml-4">{booking.time}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GUEST SIZE</span>
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Users className="h-3 w-3 text-slate-400" />
              {booking.guests} Guests
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TABLE INFO</span>
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <CalendarDays className="h-3 w-3 text-slate-400" />
              {booking.table}
            </span>
          </div>
        </div>

        {/* Booking ID and Barcode Indicator */}
        <div className="flex justify-between items-center text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RESERVATION ID</span>
            <span className="font-mono text-slate-600 text-[11px] font-semibold">{booking.id}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PRE-PAID SECURE</span>
            <span className="font-bold text-slate-800">{booking.price}</span>
          </div>
        </div>
      </div>

      {/* Booking Actions */}
      <div className="pt-2 flex flex-wrap gap-2">
        {!isCancelled && !isPending && !isCompleted && (
          <>
            {/* View QR Code ticket trigger */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="flex-1 rounded-xl gap-1.5 border-slate-200 text-slate-600 font-semibold">
                  <QrCode className="h-4 w-4" />
                  View Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xs bg-white text-center flex flex-col items-center p-6 gap-4">
                <DialogHeader className="w-full flex items-center justify-center">
                  <DialogTitle className="text-slate-900 font-extrabold text-base">QR Check-In Ticket</DialogTitle>
                </DialogHeader>

                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 shadow-inner">
                  <div className="h-44 w-44 bg-white rounded-2xl flex items-center justify-center border shadow-sm p-3 relative overflow-hidden group select-none">
                    {/* Mock QR matrix lines */}
                    <div className="w-full h-full border-4 border-dashed border-slate-900/10 flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-4 border-slate-900 rounded"></div>
                      <div className="w-16 h-2 bg-slate-900 rounded"></div>
                      <div className="w-10 h-10 border-4 border-slate-900 rounded-sm"></div>
                      <div className="w-12 h-2 bg-slate-900 rounded"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-sm">{booking.restaurantName}</h4>
                  <p className="text-xs text-slate-500">{booking.date} • {booking.time}</p>
                  <p className="font-mono text-[10px] font-semibold text-primary uppercase tracking-wider pt-2">CODE: {booking.code}</p>
                </div>

                <p className="text-[10px] text-slate-400 leading-snug">Present this QR code to the host desk at host stand to instantly check-in and seat your table.</p>
              </DialogContent>
            </Dialog>

            {/* Cancel booking prompt */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive" className="flex-1 rounded-xl gap-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20">
                  <XCircle className="h-4 w-4" />
                  Cancel Booking
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm bg-white">
                <DialogHeader>
                  <DialogTitle className="text-slate-950 font-extrabold">Cancel Reservation?</DialogTitle>
                </DialogHeader>
                <p className="text-slate-500 text-xs py-2 leading-relaxed">Are you sure you want to cancel your table at {booking.restaurantName}? This pre-paid transaction will be refunded inside your BookMyTable wallet balance instantly.</p>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="ghost" size="sm" className="rounded-xl">Keep Booking</Button>
                  <Button variant="destructive" size="sm" className="rounded-xl" onClick={onCancel}>Confirm Cancellation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

        {isCompleted && (
          <Button 
            size="sm" 
            variant="outline" 
            disabled={booking.reviewed}
            onClick={onReview}
            className="w-full rounded-xl gap-1.5 border-slate-200 text-slate-600 font-bold hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition"
          >
            <MessageSquare className="h-4 w-4" />
            {booking.reviewed ? "Feedback Submitted" : "Rate & Review Restaurant"}
          </Button>
        )}

        {isCancelled && (
          <Button asChild size="sm" variant="outline" className="w-full rounded-xl gap-1.5 border-slate-200 text-slate-600 font-bold">
            <Link to={`/restaurant/${booking.restaurant?.slug || booking.restaurantId}`}>
              <TrendingUp className="h-4 w-4" />
              Rebook Table
            </Link>
          </Button>
        )}

        {isPending && (
          <Button size="sm" variant="outline" disabled className="w-full rounded-xl border-slate-100 text-slate-400 font-semibold">
            Waiting for Host response...
          </Button>
        )}
      </div>
    </motion.div>
  );
}
