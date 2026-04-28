import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, CalendarDays, Clock, Users, MapPin, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { restaurants } from "@/lib/data";

export default function BookingConfirmation() {
  const { id } = useParams();
  const restaurant = restaurants.find((r) => r.id === id) || restaurants[0];

  return (
    <div className="min-h-screen bg-background pt-16 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
        <div className="rounded-lg border border-border bg-card p-8 shadow-elevated text-center">
          <div className="mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <Check className="h-10 w-10 text-accent" />
          </div>

          <h1 className="text-2xl font-bold text-card-foreground">Booking Confirmed!</h1>
          <p className="mt-2 text-muted-foreground">Your table has been reserved successfully</p>

          <div className="my-6 rounded-lg bg-muted/50 p-4 space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{restaurant.name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-foreground">March 18, 2026</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-foreground">7:00 PM</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-foreground">2 Guests</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-6">Confirmation #BMT-2026-0318</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/booking-history"><Button className="w-full sm:w-auto">View My Bookings</Button></Link>
            <Button variant="outline" className="w-full sm:w-auto gap-2"><Share2 className="h-4 w-4" />Share</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
