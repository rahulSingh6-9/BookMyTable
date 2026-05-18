import { useState } from "react";
import { motion } from "framer-motion";
import {
  History,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  UserCheck,
  XCircle,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomerActivity() {
  const [activities, setActivities] = useState([
    {
      id: "act1",
      type: "reservation",
      title: "Table Reserved Successfully",
      desc: "Confirmed table booking at Sakura Omakase (2 Guests) for Tonight at 7:00 PM.",
      date: "Today, 11:24 AM",
      icon: CalendarCheck,
      iconBg: "bg-primary/10 text-primary",
      badgeColor: "bg-primary/10 text-primary border-primary/20"
    },
    {
      id: "act2",
      type: "payment",
      title: "Wallet Payment Processed",
      desc: "Processed deposit of $120.00 for Sakura Omakase using pre-paid wallet funds.",
      date: "Today, 11:22 AM",
      icon: CreditCard,
      iconBg: "bg-emerald-50 text-emerald-500",
      badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100"
    },
    {
      id: "act3",
      type: "review",
      title: "Feedback Review Submitted",
      desc: "Rated The Capital Grill 5/5 stars: 'Decent meal, loved the Wagyu and attentive host stand desk.'",
      date: "Yesterday, 9:45 PM",
      icon: MessageSquare,
      iconBg: "bg-amber-50 text-amber-500",
      badgeColor: "bg-amber-50 text-amber-600 border-amber-100"
    },
    {
      id: "act4",
      type: "cancellation",
      title: "Table Booking Cancelled",
      desc: "Cancelled booking at Siam Garden for April 12. Refund of $60.00 returned to wallet cash balance.",
      date: "2026-05-12, 3:15 PM",
      icon: XCircle,
      iconBg: "bg-slate-100 text-slate-500",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200"
    },
    {
      id: "act5",
      type: "profile",
      title: "Profile Preferences Updated",
      desc: "Added peanut allergy flags, updated custom address coordinates, and linked secondary phone contact.",
      date: "2026-05-10, 10:04 AM",
      icon: UserCheck,
      iconBg: "bg-indigo-50 text-indigo-500",
      badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-100"
    },
    {
      id: "act6",
      type: "rewards",
      title: "Loyalty Points Credited",
      desc: "Earned +500 loyalty points for successfully referring guest Rahul S.",
      date: "2026-05-04, 5:40 PM",
      icon: Sparkles,
      iconBg: "bg-pink-50 text-pink-500",
      badgeColor: "bg-pink-50 text-pink-600 border-pink-100"
    }
  ]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-12">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          Activity Timeline
        </h1>
        <p className="text-xs md:text-sm text-slate-500">View a granular, centralized audit log of your reservation history and reward milestones</p>
      </div>

      {/* TIMELINE LOGGER CARDS */}
      <Card className="bg-white border-slate-100 shadow-sm p-6 rounded-3xl">
        <CardContent className="p-0 relative">
          
          {/* Vertical Connecting Line */}
          <div className="absolute left-[21px] top-3 bottom-3 w-0.5 bg-slate-100 hidden sm:block"></div>

          <div className="space-y-8 relative">
            {activities.map((act, index) => {
              const EventIcon = act.icon;
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={act.id} 
                  className="flex flex-col sm:flex-row gap-4 items-start relative group"
                >
                  {/* Event Node Bullet */}
                  <div className={`h-11 w-11 rounded-full ${act.iconBg} border border-white flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-105 shrink-0`}>
                    <EventIcon className="h-4.5 w-4.5" />
                  </div>

                  {/* Event details block */}
                  <div className="flex-1 space-y-2 bg-slate-50/30 group-hover:bg-slate-50/60 transition-colors p-4 rounded-2xl border border-slate-100">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm md:text-base leading-snug">{act.title}</h4>
                        <Badge className={`text-[9px] font-bold rounded-lg border px-2 py-0.5 ${act.badgeColor} uppercase tracking-wider`}>
                          {act.type}
                        </Badge>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {act.date}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{act.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </CardContent>
      </Card>

    </div>
  );
}
