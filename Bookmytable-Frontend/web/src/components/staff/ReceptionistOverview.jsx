import React from "react";
import { 
  Users, 
  Search, 
  PlusCircle, 
  CheckCircle2,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { CheckInButton } from "./CheckInButton";

export const ReceptionistOverview = ({ bookings }) => {
  const navigate = useNavigate();
  const todayBookings = bookings.filter(b => b.status === "confirmed");

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reception Desk</h1>
          <p className="text-muted-foreground mt-1">Manage check-ins and walk-ins</p>
        </div>
        <Button onClick={() => navigate("/staff/walkin-booking")} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          New Walk-in
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Today's Confirmations
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search guests..." className="pl-9 w-[250px]" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {todayBookings.map(booking => (
                <div key={booking._id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {booking.user?.name?.[0] || "W"}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{booking.user?.name || "Walk-in Guest"}</p>
                      <p className="text-sm text-muted-foreground">{booking.time} • {booking.guests} Guests</p>
                    </div>
                  </div>
                  <CheckInButton 
                    bookingId={booking._id} 
                    currentStatus={booking.status} 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 text-base font-semibold"
                  />
                </div>
              ))}
              {todayBookings.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  No confirmed bookings for the current slot.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 h-fit space-y-6">
          <h2 className="text-lg font-bold text-primary">Quick Actions</h2>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start h-12 text-base" onClick={() => navigate("/staff/bookings")}>
              <Search className="mr-2 w-5 h-5" />
              View All Bookings
            </Button>
            <Button variant="outline" className="w-full justify-start h-12 text-base" onClick={() => navigate("/staff/live-tables")}>
              <Users className="mr-2 w-5 h-5" />
              Check Table Availability
            </Button>
          </div>

          <div className="pt-6 border-t border-primary/10">
            <p className="text-sm font-medium text-primary/70 mb-2">Waitlist Status</p>
            <p className="text-2xl font-bold">0 Guests Waiting</p>
          </div>
        </div>
      </div>
    </div>
  );
};
