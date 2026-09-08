import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarX2, Eye, Repeat2, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { BookingStatusBadge } from "@/components/profile/BookingStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockBookings = [
  {
    id: "BM-10241",
    restaurantId: "1",
    restaurantName: "Saffron & Smoke",
    date: "2026-04-20",
    startTime: "7:00 PM",
    endTime: "8:30 PM",
    tableNumber: 4,
    guests: 2,
    status: "confirmed",
    paymentStatus: "paid",
  },
  {
    id: "BM-10212",
    restaurantId: "3",
    restaurantName: "Coastal Cravings",
    date: "2026-03-12",
    startTime: "8:00 PM",
    endTime: "9:30 PM",
    tableNumber: 2,
    guests: 4,
    status: "completed",
    paymentStatus: "paid",
  },
  {
    id: "BM-10198",
    restaurantId: "2",
    restaurantName: "The Garden Fork",
    date: "2026-03-05",
    startTime: "6:30 PM",
    endTime: "8:00 PM",
    tableNumber: 7,
    guests: 3,
    status: "cancelled",
    paymentStatus: "refunded",
  },
];

function isUpcoming(isoDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(isoDate);
  d.setHours(0, 0, 0, 0);
  return d >= today;
}

function BookingCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card shadow-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancel }) {
  const upcoming = isUpcoming(booking.date) && booking.status === "confirmed";

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">{booking.restaurantName}</CardTitle>
          <div className="mt-1 text-sm text-muted-foreground">
            {booking.date} • {booking.startTime} - {booking.endTime}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Table {booking.tableNumber}</span>
            <span className="text-muted-foreground/50">•</span>
            <span>{booking.guests} guests</span>
            {booking.paymentStatus ? (
              <>
                <span className="text-muted-foreground/50">•</span>
                <Badge variant="secondary" className="h-5 px-2 text-[11px]">
                  Payment: {booking.paymentStatus}
                </Badge>
              </>
            ) : null}
          </div>
        </div>
        <BookingStatusBadge status={booking.status} />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />
                View details
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Booking details</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="font-mono text-xs">{booking.id}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Restaurant</span>
                  <span className="font-medium">{booking.restaurantName}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Date</span>
                  <span>{booking.date}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Time</span>
                  <span>
                    {booking.startTime} - {booking.endTime}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Table</span>
                  <span>Table {booking.tableNumber}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Guests</span>
                  <span>{booking.guests}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Status</span>
                  <BookingStatusBadge status={booking.status} />
                </div>
                {booking.paymentStatus ? (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="capitalize">{booking.paymentStatus}</span>
                  </div>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>

          <Button asChild variant="outline" className="gap-2">
            <Link to={`/restaurant/${booking.restaurant?.slug || booking.restaurantId}`}>
              <Repeat2 className="h-4 w-4" />
              Rebook
            </Link>
          </Button>

          <Button
            variant="destructive"
            className="gap-2"
            disabled={!upcoming}
            onClick={() => onCancel(booking)}
            title={!upcoming ? "Only upcoming confirmed bookings can be cancelled" : undefined}
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfileBookings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setBookings(mockBookings);
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const upcomingBookings = useMemo(
    () => bookings.filter((b) => b.status !== "cancelled" && isUpcoming(b.date)),
    [bookings]
  );
  const pastBookings = useMemo(
    () => bookings.filter((b) => b.status !== "cancelled" && !isUpcoming(b.date)),
    [bookings]
  );
  const cancelledBookings = useMemo(() => bookings.filter((b) => b.status === "cancelled"), [bookings]);

  const handleCancel = (booking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status: "cancelled", paymentStatus: b.paymentStatus || "refunded" } : b))
    );
    toast.success("Booking cancelled");
  };

  const renderList = (items, empty) => {
    if (loading) {
      return (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return empty;
    }

    return (
      <div className="grid gap-4">
        {items.map((b) => (
          <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground">View and manage your reservations</p>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Upcoming <Badge variant="secondary" className="ml-1.5 text-xs">{upcomingBookings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="past">
              Past <Badge variant="secondary" className="ml-1.5 text-xs">{pastBookings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled <Badge variant="secondary" className="ml-1.5 text-xs">{cancelledBookings.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-0">
            {renderList(
              upcomingBookings,
              <EmptyState
                icon={CalendarX2}
                title="No upcoming bookings"
                description="When you book a table, it will show up here."
                actionLabel="Discover restaurants"
                onAction={() => navigate("/discover")}
              />
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-0">
            {renderList(
              pastBookings,
              <EmptyState
                icon={CalendarX2}
                title="No past bookings"
                description="Once you complete a booking, you’ll see it here for quick rebooking."
                actionLabel="Discover restaurants"
                onAction={() => navigate("/discover")}
              />
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-0">
            {renderList(
              cancelledBookings,
              <EmptyState
                icon={CalendarX2}
                title="No cancelled bookings"
                description="If you cancel a booking, it will appear here."
                actionLabel="Discover restaurants"
                onAction={() => navigate("/discover")}
              />
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

