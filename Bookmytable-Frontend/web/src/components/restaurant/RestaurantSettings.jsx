import { Clock, Info, ShieldAlert, CheckCircle2 } from "lucide-react";

const DAYS_OF_WEEK = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function RestaurantSettings({ settings }) {
  if (!settings) return null;

  const openingHours = settings.openingHours;
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-foreground">Operational Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Weekly Hours */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" /> 
            Weekly Schedule
          </h3>
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => {
              const d = openingHours?.[day];
              const isToday = new Date().getDay() === DAYS_OF_WEEK.indexOf(day);
              
              return (
                <div key={day} className={`flex items-center justify-between text-sm py-1 ${isToday ? "font-bold text-primary" : "text-foreground"}`}>
                  <span className="capitalize w-24 flex items-center gap-2">
                    {day}
                    {isToday && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </span>
                  {d && !d.isClosed ? (
                    <span className={isToday ? "text-primary" : "text-muted-foreground"}>
                      {String(Math.floor((d.open || 0) / 60)).padStart(2, '0')}:{String((d.open || 0) % 60).padStart(2, '0')} – 
                      {String(Math.floor((d.close || 0) / 60)).padStart(2, '0')}:{String((d.close || 0) % 60).padStart(2, '0')}
                    </span>
                  ) : (
                    <span className="text-destructive/80 font-medium">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Policies & Settings */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
              <ShieldAlert className="h-5 w-5 text-primary" /> 
              Booking Policies
            </h3>
            <div className="space-y-4">
              {settings.cancellationPolicy && (
                <div>
                  <h4 className="text-sm font-medium text-foreground">Cancellation</h4>
                  <p className="text-sm text-muted-foreground mt-1">{settings.cancellationPolicy}</p>
                </div>
              )}
              {settings.refundPolicy && (
                <div>
                  <h4 className="text-sm font-medium text-foreground">Refund Policy</h4>
                  <p className="text-sm text-muted-foreground mt-1">{settings.refundPolicy}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" /> 
              Dining Rules
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Table turnover time: <strong className="text-foreground">{settings.bookingSettings?.tableTurnoverTime || 90} minutes</strong></span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Reservation buffer: <strong className="text-foreground">{settings.bookingSettings?.reservationBuffer || 15} minutes</strong></span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Max guests per booking: <strong className="text-foreground">{settings.bookingSettings?.maxGuestsPerBooking || 10} guests</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
