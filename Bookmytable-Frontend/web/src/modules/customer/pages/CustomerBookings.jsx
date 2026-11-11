import { BookingReviewModal } from "@/components/review/BookingReviewModal";
import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
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
  TrendingUp,
  CalendarCheck,
  Loader2,
  Hash,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common/EmptyState";
import { getUserBookings, cancelBooking, getBookingQR } from "@/services/booking.service";

export default function CustomerBookings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchParams] = useSearchParams();
  const [qrModalBookingId, setQrModalBookingId] = useState(null);

  // Fetch real bookings from backend
  const { data: bookingsRes, isLoading, error } = useQuery({
    queryKey: ["user-bookings"],
    queryFn: getUserBookings,
  });

  const bookings = bookingsRes?.data?.data || [];

  // Auto-open QR modal if ?qr=<bookingId> param present (from email link)
  useEffect(() => {
    const qrParam = searchParams.get("qr");
    if (qrParam && bookings.length > 0) {
      const match = bookings.find(b => b._id === qrParam && b.status === "confirmed");
      if (match) setQrModalBookingId(qrParam);
    }
  }, [searchParams, bookings]);

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: (id) => cancelBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      toast.success("Reservation cancelled successfully.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to cancel booking.");
    },
  });

  const handleCancelBooking = (id) => {
    cancelMutation.mutate(id);
  };

  // Review modal state
  const [reviewModalBooking, setReviewModalBooking] = useState(null);

  const handleOpenReview = (booking) => {
    setReviewModalBooking(booking);
  };

  /**
   * Safely extract creation timestamp (milliseconds) from booking.
   * Prioritizes `createdAt`, falls back to MongoDB ObjectId timestamp, or 0.
   */
  const getBookingCreationTime = (b) => {
    if (b?.createdAt) {
      const time = new Date(b.createdAt).getTime();
      if (!isNaN(time) && time > 0) return time;
    }
    // Safe fallback to MongoDB ObjectId embedded creation timestamp
    if (b?._id && typeof b._id === "string" && b._id.length >= 8) {
      try {
        const hexTimestamp = parseInt(b._id.substring(0, 8), 16);
        if (!isNaN(hexTimestamp) && hexTimestamp > 0) {
          return hexTimestamp * 1000;
        }
      } catch {}
    }
    return 0;
  };

  /**
   * Pure function: Sort bookings by creation date descending (newest first).
   * Creates a shallow copy to never mutate original array.
   */
  const sortBookingsNewestFirst = (list) => {
    if (!Array.isArray(list) || list.length === 0) return [];
    return [...list].sort((a, b) => getBookingCreationTime(b) - getBookingCreationTime(a));
  };

  // Filter and sort lists based on status (always newest created first)
  const upcomingList = useMemo(() => {
    const filtered = bookings.filter(b => ["confirmed", "checked_in"].includes(b.status));
    return sortBookingsNewestFirst(filtered);
  }, [bookings]);

  const pendingList = useMemo(() => {
    const filtered = bookings.filter(b => ["pending", "payment_pending"].includes(b.status));
    return sortBookingsNewestFirst(filtered);
  }, [bookings]);

  const completedList = useMemo(() => {
    const filtered = bookings.filter(b => b.status === "completed");
    return sortBookingsNewestFirst(filtered);
  }, [bookings]);

  const cancelledList = useMemo(() => {
    const filtered = bookings.filter(b => ["cancelled", "expired", "payment_failed"].includes(b.status));
    return sortBookingsNewestFirst(filtered);
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-medium mb-4">Failed to load your bookings.</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["user-bookings"] })}>Retry</Button>
      </div>
    );
  }

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
              <div className="flex flex-col gap-3.5 w-full">
                {upcomingList.map(b => (
                  <BookingItemCard 
                    key={b._id} 
                    booking={b} 
                    onCancel={() => handleCancelBooking(b._id)}
                    isCancelling={cancelMutation.isPending}
                    onShowQR={(id) => setQrModalBookingId(id)}
                    onReview={() => handleOpenReview(b)}
                  />
                ))}
              </div>
            ) : (
              <EmptyBookingsState onDiscover={() => navigate("/discover")} />
            )}
          </TabsContent>

          {/* PENDING TABS */}
          <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
            {pendingList.length > 0 ? (
              <div className="flex flex-col gap-3.5 w-full">
                {pendingList.map(b => (
                  <BookingItemCard key={b._id} booking={b} isPending={true} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No pending confirmations"
                description="All your bookings are confirmed or completed."
                actionLabel="Explore restaurants"
                onAction={() => navigate("/discover")}
              />
            )}
          </TabsContent>

          {/* COMPLETED TABS */}
          <TabsContent value="completed" className="mt-0 focus-visible:outline-none">
            {completedList.length > 0 ? (
              <div className="flex flex-col gap-3.5 w-full">
                {completedList.map(b => (
                  <BookingItemCard 
                    key={b._id} 
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
                onAction={() => navigate("/discover")}
              />
            )}
          </TabsContent>

          {/* CANCELLED TABS */}
          <TabsContent value="cancelled" className="mt-0 focus-visible:outline-none">
            {cancelledList.length > 0 ? (
              <div className="flex flex-col gap-3.5 w-full">
                {cancelledList.map(b => (
                  <BookingItemCard key={b._id} booking={b} isCancelled={true} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No cancelled bookings"
                description="Everything runs smoothly! Clean history is good record keeping."
                actionLabel="Discover gourmet spots"
                onAction={() => navigate("/discover")}
              />
            )}
          </TabsContent>
        </AnimatePresence>

      </Tabs>

      {/* BOOKING REVIEW MODAL */}
      <BookingReviewModal
        booking={reviewModalBooking}
        existingReview={reviewModalBooking?.review}
        isOpen={Boolean(reviewModalBooking)}
        onClose={() => setReviewModalBooking(null)}
      />

      {/* BOOKING QR MODAL */}
      <BookingQRModal bookingId={qrModalBookingId} onClose={() => setQrModalBookingId(null)} />

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
        <p className="text-xs text-slate-500">Plan your next breakfast, lunch, or romantic dinner. Get instant confirmation.</p>
      </div>
      <Button size="sm" className="bg-primary hover:bg-primary/95 text-white rounded-xl shadow-md shadow-primary/10" onClick={onDiscover}>
        Book a Table
      </Button>
    </div>
  );
}

/* REAL-DATA RESERVATION ROW (HORIZONTAL LAYOUT) */
function BookingItemCard({ booking, onCancel, isPending, isCompleted, isCancelled, onReview, isCancelling, onShowQR }) {
  const restaurant = booking.restaurantId; // populated
  const restaurantName = restaurant?.branchName || restaurant?.name || "Restaurant";
  const restaurantSlug = restaurant?.slug || "";
  const cuisine = restaurant?.cuisines?.[0] || restaurant?.cuisine?.[0] || "";
  const tableNames = booking.tables?.length > 0
    ? booking.tables.map(t => `${t.tableName} (${t.sectionLabel || "Main"})`).join(", ")
    : booking.tableName || "Reserved";

  const reservationId = booking._id ? String(booking._id).slice(-8).toUpperCase() : "";

  return (
    <div 
      className="group w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all p-4 md:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4"
    >
      {/* 1. LEFT BLOCK: Restaurant Details & Status */}
      <div className="flex items-start gap-3.5 min-w-[220px] xl:max-w-[280px]">
        <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
          <Store className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-slate-900 text-base leading-tight truncate">
              {restaurantSlug ? (
                <Link to={`/restaurant/${restaurantSlug}`} className="hover:text-primary transition-colors">
                  {restaurantName}
                </Link>
              ) : (
                restaurantName
              )}
            </h3>
            <StatusBadge status={booking.status} />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium flex-wrap">
            {cuisine && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                {cuisine}
              </span>
            )}
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-mono text-slate-500 font-semibold" title="Reservation ID">
              #{reservationId}
            </span>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE BLOCK: Booking Parameters in Clean Aligned Columns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 py-3 xl:py-0 border-y xl:border-y-0 xl:border-x xl:border-slate-100 xl:px-6 flex-1 text-xs">
        {/* DATE & TIME */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DATE & TIME</span>
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{booking.date}</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 pl-5 block">{booking.time}</span>
        </div>

        {/* GUEST SIZE */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GUEST SIZE</span>
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{booking.guests} Guests</span>
          </div>
          <span className="text-[11px] text-slate-400 pl-5 block">Reserved party</span>
        </div>

        {/* TABLE INFO */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TABLE INFO</span>
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate" title={tableNames}>{tableNames}</span>
          </div>
          <span className="text-[11px] text-slate-400 pl-5 block truncate">Dining area</span>
        </div>

        {/* AMOUNT */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {booking.paymentStatus === "paid" ? "PRE-PAID SECURE" : "AMOUNT"}
          </span>
          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
            {booking.grandTotal > 0 ? `₹${booking.grandTotal}` : "Free"}
          </div>
          <span className="text-[10px] font-medium text-emerald-600 block">
            {booking.paymentStatus === "paid" ? "Online Verified" : "Direct at Venue"}
          </span>
        </div>
      </div>

      {/* 3. RIGHT BLOCK: Actions & Review Status */}
      <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 justify-end shrink-0 xl:min-w-[220px]">
        {/* QR Code and Cancel buttons for confirmed bookings */}
        {!isCancelled && !isPending && !isCompleted && booking.status === "confirmed" && (
          <>
            <Button
              size="sm"
              onClick={() => onShowQR && onShowQR(booking._id)}
              className="rounded-xl gap-1.5 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 font-bold text-xs shadow-xs"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>View QR</span>
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive" className="rounded-xl gap-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 font-bold text-xs">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Cancel</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm bg-white">
                <DialogHeader>
                  <DialogTitle className="text-slate-950 font-extrabold">Cancel Reservation?</DialogTitle>
                </DialogHeader>
                <p className="text-slate-500 text-xs py-2 leading-relaxed">
                  Are you sure you want to cancel your table at <strong className="text-slate-800">{restaurantName}</strong>?
                </p>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="ghost" size="sm" className="rounded-xl">Keep Booking</Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="rounded-xl" 
                    disabled={isCancelling}
                    onClick={onCancel}
                  >
                    {isCancelling ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                    Confirm Cancellation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Checked-In Badge if customer checked in */}
        {booking.status === "checked_in" && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
            <span>Checked In</span>
          </div>
        )}

        {/* Rate & Review Action */}
        {(isCompleted || (booking.status === "checked_in" && booking.qrCode?.status === "used")) && (
          booking.hasReviewed || booking.review ? (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onReview}
              className="rounded-xl gap-1.5 border-emerald-200 bg-emerald-50/60 text-emerald-700 font-bold hover:bg-emerald-100 hover:!text-emerald-800 hover:border-emerald-300 text-xs transition-colors shrink-0"
            >
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>Reviewed ({booking.review?.overallRating ? Number(booking.review.overallRating).toFixed(1) : "★"}) • Edit Review</span>
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onReview}
              className="rounded-xl gap-1.5 border-primary/25 bg-primary/5 text-primary font-bold hover:border-primary/50 hover:bg-primary/15 hover:!text-primary text-xs transition-colors shrink-0"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Rate & Review Restaurant</span>
            </Button>
          )
        )}

        {/* Rebook if cancelled */}
        {isCancelled && restaurantSlug && (
          <Button asChild size="sm" variant="outline" className="rounded-xl gap-1.5 border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs shrink-0">
            <Link to={`/restaurant/${restaurantSlug}`}>
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Rebook Table</span>
            </Link>
          </Button>
        )}

        {/* Awaiting payment if pending */}
        {isPending && (
          <span className="inline-flex items-center text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-xl">
            Awaiting payment completion...
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    confirmed: "bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20",
    completed: "bg-emerald-50 hover:bg-emerald-50 text-emerald-600 border border-emerald-100",
    checked_in: "bg-blue-50 hover:bg-blue-50 text-blue-600 border border-blue-100",
    cancelled: "bg-slate-100 hover:bg-slate-100 text-slate-600",
    expired: "bg-slate-100 hover:bg-slate-100 text-slate-500",
    pending: "bg-amber-50 hover:bg-amber-50 text-amber-600 border border-amber-100",
    payment_pending: "bg-amber-50 hover:bg-amber-50 text-amber-600 border border-amber-100",
    payment_failed: "bg-red-50 hover:bg-red-50 text-red-600 border border-red-100",
    no_show: "bg-red-50 hover:bg-red-50 text-red-500 border border-red-100",
  };

  const labels = {
    confirmed: "Confirmed",
    completed: "Visited",
    checked_in: "Checked In",
    cancelled: "Cancelled",
    expired: "Expired",
    pending: "Pending",
    payment_pending: "Awaiting Payment",
    payment_failed: "Payment Failed",
    no_show: "No Show",
  };

  return (
    <Badge className={`text-[10px] font-bold rounded-lg px-2.5 py-1 ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </Badge>
  );
}


// ─── Booking QR Modal ──────────────────────────────────────────────────────────
const CHECK_IN_STATE_CONFIG = {
  AVAILABLE: {
    label: "Ready for Check-in",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  NOT_STARTED: {
    label: "Check-in Not Yet Open",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  CHECKED_IN: {
    label: "Already Checked In",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  EXPIRED: {
    label: "QR Expired",
    color: "text-slate-500",
    bg: "bg-slate-50 border-slate-200",
  },
  CANCELLED: {
    label: "Booking Cancelled",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
  },
};

function BookingQRModal({ bookingId, onClose }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["booking-qr", bookingId],
    queryFn: () => getBookingQR(bookingId),
    enabled: !!bookingId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const qr = data?.data?.data;
  const stateConfig = qr ? CHECK_IN_STATE_CONFIG[qr.checkInState] : null;

  return (
    <Dialog open={!!bookingId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-950 font-extrabold flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Your Check-in QR Code
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Present this QR code to the restaurant host upon arrival.
          </DialogDescription>
        </DialogHeader>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {error?.response?.data?.message || error?.message || "Could not load QR code. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* QR Data */}
        {qr && !isLoading && (
          <div className="flex flex-col items-center gap-4 py-2">
            {/* Check-in state badge */}
            {stateConfig && (
              <div
                className={`w-full text-center py-2 rounded-lg border text-xs font-semibold ${stateConfig.bg} ${stateConfig.color}`}
              >
                {stateConfig.label}
              </div>
            )}

            {/* QR Code image — only show when scan-able */}
            {["AVAILABLE", "NOT_STARTED"].includes(qr.checkInState) && qr.token && (
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-inner">
                <QRCodeSVG value={qr.token} size={200} level="H" />
              </div>
            )}

            {/* Booking details */}
            <div className="w-full bg-slate-50 rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Restaurant</span>
                <span className="font-bold text-slate-700">{qr.restaurantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Date & Time</span>
                <span className="font-bold text-slate-700">{qr.date} at {qr.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Guests</span>
                <span className="font-bold text-slate-700">{qr.guests}</span>
              </div>
              {qr.tableNames && (
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Table</span>
                  <span className="font-bold text-slate-700">{qr.tableNames}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Booking ID</span>
                <span className="font-mono font-bold text-slate-600">
                  {String(qr.bookingId).slice(-8).toUpperCase()}
                </span>
              </div>
              {qr.checkInState === "AVAILABLE" && (
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-400 font-medium">Check-in Window</span>
                  <span className="font-semibold text-emerald-600">Open</span>
                </div>
              )}
              {qr.checkInState === "CHECKED_IN" && qr.checkedInAt && (
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-400 font-medium">Checked in at</span>
                  <span className="font-bold text-blue-600">
                    {new Date(qr.checkedInAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
