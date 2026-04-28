import { motion } from "framer-motion";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const notifications = [
  { id: 1, title: "Booking Confirmed", message: "Your reservation at Sakura Omakase for 7:00 PM is confirmed.", time: "5 min ago", read: false },
  { id: 2, title: "Reminder", message: "Your dinner at Trattoria Bella is tomorrow at 8:00 PM.", time: "1 hour ago", read: false },
  { id: 3, title: "New Review Response", message: "Chef Tanaka responded to your review.", time: "3 hours ago", read: true },
  { id: 4, title: "Special Offer", message: "Get 20% off your next booking at The Capital Grill.", time: "1 day ago", read: true },
  { id: 5, title: "Booking Cancelled", message: "Your reservation at Sky Lounge has been cancelled.", time: "2 days ago", read: true },
];

export default function Notifications() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto max-w-2xl px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground">Stay updated on your bookings</p>
            </div>
            <Button variant="outline" size="sm" className="gap-1"><Check className="h-3.5 w-3.5" /> Mark all read</Button>
          </div>

          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className={`flex gap-3 rounded-lg border p-4 transition-colors ${n.read ? "border-border bg-card" : "border-primary/20 bg-primary/5"}`}>
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.read ? "bg-muted" : "bg-primary/10"}`}>
                  <Bell className={`h-4 w-4 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-medium text-foreground">{n.title}</h3>
                    {!n.read && <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
