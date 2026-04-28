import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, ShieldAlert, BadgeCheck, MessageSquareWarning, RefreshCw, X } from "lucide-react";

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "Suspicious Activity Detected",
      message: "Multiple failed login attempts from IP 192.168.1.5",
      time: "2 mins ago",
      icon: ShieldAlert,
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      id: 2,
      type: "system",
      title: "System Update Scheduled",
      message: "Platform maintenance will occur tonight at 02:00 AM UTC.",
      time: "1 hour ago",
      icon: RefreshCw,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      id: 3,
      type: "success",
      title: "New Restaurant Approved",
      message: "'The Spice Lounge' has been successfully onboarded.",
      time: "3 hours ago",
      icon: BadgeCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      id: 4,
      type: "warning",
      title: "High Volume of Flagged Reviews",
      message: "5 reviews were flagged in the last hour. Immediate moderation requested.",
      time: "5 hours ago",
      icon: MessageSquareWarning,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animation-fade-in pb-10">
      <PageHeader 
        title="Notifications Center" 
        description="System alerts, security notices, and platform-wide events." 
        action={
          <Button variant="outline" className="rounded-full border-border/50 bg-background/50 backdrop-blur-sm">
            Mark all as read
          </Button>
        }
      />

      <div className="space-y-4">
        {notifications.map((notif, i) => (
          <motion.div 
            key={notif.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden bg-card/60 backdrop-blur-sm transition-all hover:bg-card">
              <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.bgColor}`}>
                  <notif.icon className={`w-6 h-6 ${notif.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-base font-semibold text-foreground truncate">{notif.title}</h3>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{notif.message}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
