import { ShieldCheck, Clock, Calendar, Users, Ban } from "lucide-react";

export function SettingsSummaryPanel({ settings }) {
  const getSlotText = (val) => val ? `${val} mins` : "Not set";
  const getDaysText = (val) => val ? `${val} days` : "Not set";
  
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm sticky top-24">
      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" /> Settings Summary
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm border-b border-border pb-3">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Clock className="h-4 w-4" /> Slot Interval
          </div>
          <span className="font-bold text-foreground">{getSlotText(settings.timeSlotInterval)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm border-b border-border pb-3">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Clock className="h-4 w-4" /> Slot Duration
          </div>
          <span className="font-bold text-foreground">{getSlotText(settings.slotDuration)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm border-b border-border pb-3">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Calendar className="h-4 w-4" /> Booking Window
          </div>
          <span className="font-bold text-foreground">{getDaysText(settings.advanceBookingDays)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm border-b border-border pb-3">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Users className="h-4 w-4" /> Max Guests
          </div>
          <span className="font-bold text-foreground">{settings.maxGuestsPerBooking || "Not set"}</span>
        </div>

        <div className="flex justify-between items-center text-sm border-b border-border pb-3">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Ban className="h-4 w-4" /> Auto-confirm
          </div>
          <span className={`font-bold ${settings.autoAcceptBookings ? "text-emerald-500" : "text-destructive"}`}>
            {settings.autoAcceptBookings ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm pb-1">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Users className="h-4 w-4" /> Walk-ins
          </div>
          <span className={`font-bold ${settings.waitlistEnabled ? "text-emerald-500" : "text-destructive"}`}>
            {settings.waitlistEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          These settings dictate how the booking engine operates. You can always change them later in the dashboard.
        </p>
      </div>
    </div>
  );
}
