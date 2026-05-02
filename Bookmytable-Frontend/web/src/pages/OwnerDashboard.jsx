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

import { useAuth } from "@/context/AuthContext";
import { useTables } from "@/hooks/useTables";
import { Badge } from "@/components/ui/badge";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const restaurantId = user?.restaurant?._id || user?.restaurant;
  const { data: tables = [], isLoading } = useTables(restaurantId);

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
        
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Reservations</h2>
            <div className="rounded-xl border border-border bg-card">
              <BookingTable />
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Active Tables</h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading tables...</div>
              ) : tables.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No active tables found.</div>
              ) : (
                <div className="divide-y divide-border">
                  {tables.slice(0, 5).map((table) => (
                    <div key={table._id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{table.tableCode}</span>
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize">{table.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {table.capacity} Seats • {table.floor || "N/A"} {table.section && `• ${table.section}`}
                        </p>
                      </div>
                      <div className="text-right">
                         <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none text-[10px]">Active</Badge>
                      </div>
                    </div>
                  ))}
                  {tables.length > 5 && (
                    <div className="p-3 text-center">
                       <button className="text-xs text-primary hover:underline font-medium">View All Tables</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

