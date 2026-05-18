import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  Trash2,
  CalendarCheck,
  ShieldCheck,
  Gift,
  CheckCircle2,
  Trash,
  BellRing,
  SlidersHorizontal,
  BellOff
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";

export default function CustomerNotifications() {
  const [activeCategory, setActiveCategory] = useState("all");

  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      category: "reservations",
      title: "Table Approved",
      desc: "Your reservation at Sakura Omakase is officially confirmed by the host desk. Table 4 is reserved.",
      time: "10 mins ago",
      read: false,
      icon: CalendarCheck,
      color: "bg-primary/10 text-primary"
    },
    {
      id: "n2",
      category: "promotions",
      title: "Weekend Cashback Active",
      desc: "Get an extra $15 cashback instantly when reserving table slots after 8:00 PM tonight.",
      time: "2 hours ago",
      read: false,
      icon: Gift,
      color: "bg-emerald-50 text-emerald-500"
    },
    {
      id: "n3",
      category: "security",
      title: "New Login Detected",
      desc: "Secure session initialized from Chrome browser on Windows platform.",
      time: "1 day ago",
      read: true,
      icon: ShieldCheck,
      color: "bg-indigo-50 text-indigo-500"
    },
    {
      id: "n4",
      category: "reservations",
      title: "Table Visit Completed",
      desc: "Thank you for checking in at The Capital Grill! How did you like Chef's prime steak?",
      time: "Yesterday",
      read: true,
      icon: CalendarCheck,
      color: "bg-primary/10 text-primary"
    }
  ]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success("Notification feed cleared");
  };

  const handleToggleRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: !n.read } : n)
    );
  };

  const filteredNotifications = useMemo(() => {
    if (activeCategory === "all") return notifications;
    return notifications.filter(n => n.category === activeCategory);
  }, [notifications, activeCategory]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notification Center
          </h1>
          <p className="text-xs md:text-sm text-slate-500">Stay up to date with table check-in times, promotion cashbacks, and security logs</p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs border-slate-200 text-slate-600 rounded-xl gap-1.5 font-bold hover:bg-slate-50"
            >
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Mark all read</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs text-destructive rounded-xl gap-1.5 font-bold hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear all</span>
            </Button>
          </div>
        )}
      </div>

      {/* CATEGORY SELECTOR CARDS */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "All Feeds", badge: notifications.length },
          { id: "reservations", label: "Bookings", badge: notifications.filter(n => n.category === "reservations").length },
          { id: "promotions", label: "Promos", badge: notifications.filter(n => n.category === "promotions").length },
          { id: "security", label: "Security", badge: notifications.filter(n => n.category === "security").length }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-2 ${
              activeCategory === cat.id
                ? "bg-primary border-primary text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>{cat.label}</span>
            <Badge variant="secondary" className={`text-[9px] font-bold rounded-full p-0 h-4.5 min-w-4.5 flex items-center justify-center ${
              activeCategory === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              {cat.badge}
            </Badge>
          </button>
        ))}
      </div>

      {/* NOTIFICATIONS CONTAINER */}
      <Card className="bg-white border-slate-100 shadow-sm p-4 rounded-3xl">
        <CardContent className="p-0 space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {filteredNotifications.map((notif, index) => {
                  const NotifIcon = notif.icon;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      key={notif.id}
                      onClick={() => handleToggleRead(notif.id)}
                      className={`flex gap-4 p-4 items-start select-none cursor-pointer transition rounded-2xl ${
                        notif.read ? "opacity-75" : "bg-primary/5 hover:bg-primary/10"
                      }`}
                    >
                      {/* Left Category Icon */}
                      <div className={`h-10 w-10 rounded-xl ${notif.color} flex items-center justify-center shadow-inner shrink-0`}>
                        <NotifIcon className="h-4.5 w-4.5" />
                      </div>

                      {/* Content block */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`font-bold text-slate-900 text-sm md:text-base ${!notif.read && "text-primary"}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-normal">{notif.desc}</p>
                      </div>

                      {/* Read status marker */}
                      <div className="flex items-center self-center pl-2">
                        {!notif.read && (
                          <span className="h-2 w-2 rounded-full bg-primary ring-4 ring-primary/10"></span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={BellOff}
                title="Feed is clean"
                description="Everything is up to date! Active bookings will trigger notifications here."
                actionLabel="Explore dining page"
                onAction={() => navigate("/profile/discover")}
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

    </div>
  );
}
