import { motion } from "framer-motion";
import { CalendarDays, Users, DollarSign, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { BookingTable } from "@/components/dashboard/BookingTable";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";


const stats = [
  { title: "Today's Bookings", value: "18", change: "+5%", icon: CalendarDays },
  { title: "Total Guests", value: "52", change: "+12%", icon: Users },
  { title: "Revenue", value: "$3,420", change: "+8%", icon: DollarSign },
  { title: "Avg Rating", value: "4.8", change: "+0.1", icon: TrendingUp },
];

export default function OwnerDashboard() {
  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"><RevenueChart /></div>
          <div><ActivityFeed /></div>
        </div>
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Reservations</h2>
          <BookingTable />
        </div>
      </motion.div>
    </div>
  );
}
