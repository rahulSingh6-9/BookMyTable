import { CalendarDays, Clock, Users, MapPin } from "lucide-react";

export function BookingSummary({ restaurant, date, time, guests, table }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card">
      <h3 className="mb-4 text-lg font-semibold text-card-foreground">Booking Summary</h3>
      <div className="space-y-3 text-sm">
        {restaurant && (
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-primary" />
            <div>
              <p className="font-medium text-foreground">{restaurant.name}</p>
              <p className="text-muted-foreground">{restaurant.address}</p>
            </div>
          </div>
        )}
        {date && (
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-foreground">{date}</span>
          </div>
        )}
        {time && (
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-foreground">{time}</span>
          </div>
        )}
        {guests && (
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-foreground">{guests} {guests === 1 ? "Guest" : "Guests"}</span>
          </div>
        )}
        {table && (
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <span className="text-muted-foreground">Table:</span>
            <span className="text-foreground">{table.label} ({table.type}, {table.seats} seats)</span>
          </div>
        )}
      </div>
    </div>
  );
}
