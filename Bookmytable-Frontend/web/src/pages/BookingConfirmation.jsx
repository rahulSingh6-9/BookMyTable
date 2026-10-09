import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Check, CalendarDays, Clock, Users, MapPin, Loader2, AlertCircle, Hash, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBookingById } from "@/services/booking.service";

export default function BookingConfirmation() {
  const { id } = useParams();

  const { data: bookingRes, isLoading, error } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBookingById(id),
    enabled: !!id,
  });

  const booking = bookingRes?.data?.data;
  const restaurant = booking?.restaurantId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center px-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background pt-16 flex flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Booking Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6">Could not find reservation details for ID: {id}</p>
        <Button asChild><Link to="/profile/bookings">Go to My Bookings</Link></Button>
      </div>
    );
  }

  const tableNames = booking.tables?.length > 0 
    ? booking.tables.map(t => t.tableName).join(", ") 
    : booking.tableName || "Reserved";

  return (
    <div className="min-h-screen bg-background pt-16 flex items-center justify-center px-4 pb-16">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-xl text-center">
          <div className="mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
            <Check className="h-10 w-10 text-emerald-600" />
          </div>

          <h1 className="text-3xl font-black text-foreground">Booking Confirmed!</h1>
          <p className="mt-2 text-muted-foreground text-sm">Your table has been reserved successfully</p>

          <div className="my-6 rounded-2xl bg-muted/30 border border-border/50 p-5 space-y-3.5 text-left text-sm">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="font-bold text-foreground">{restaurant?.name || "Restaurant"}</span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground font-medium">{booking.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground font-medium">{booking.time}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground font-medium">{booking.guests} Guests</span>
            </div>
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground font-medium">Table: {tableNames}</span>
            </div>
            {booking.grandTotal > 0 && (
              <div className="flex items-center gap-3">
                <Receipt className="h-4 w-4 text-primary shrink-0" />
                <span className="text-foreground font-bold text-emerald-600">Amount Paid: ₹{booking.grandTotal}</span>
              </div>
            )}
          </div>

          <p className="text-xs font-mono text-muted-foreground mb-6">Reservation ID: {booking._id}</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="w-full sm:w-auto h-12 px-6 font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
              <Link to="/profile/bookings">View My Bookings</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto h-12 px-6 font-bold rounded-xl">
              <Link to={`/restaurant/${restaurant?.slug || ""}`}>Back to Restaurant</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
