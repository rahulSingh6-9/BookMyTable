import { motion } from "framer-motion";
import { CalendarDays, Users, DollarSign, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const bookingTrend = [
  { day: "Mon", bookings: 12 },
  { day: "Tue", bookings: 18 },
  { day: "Wed", bookings: 15 },
  { day: "Thu", bookings: 22 },
  { day: "Fri", bookings: 30 },
  { day: "Sat", bookings: 35 },
  { day: "Sun", bookings: 28 },
];

const stats = [
  { title: "This Week", value: "156", change: "+18%", icon: CalendarDays },
  { title: "Avg Party Size", value: "3.2", change: "+0.4", icon: Users },
  { title: "Weekly Revenue", value: "$12,840", change: "+22%", icon: DollarSign },
  { title: "Repeat Customers", value: "42%", change: "+5%", icon: TrendingUp },
];



export default function OwnerAnalytics() {
  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Insights and performance metrics for your restaurant</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueChart />
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h3 className="mb-4 text-sm font-semibold text-card-foreground">Booking Trends</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={bookingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "13px" }} />
                  <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
