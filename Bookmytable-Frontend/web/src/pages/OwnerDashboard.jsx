import { motion } from "framer-motion";
import { CalendarDays, Users, DollarSign, TrendingUp, ArrowRight } from "lucide-react";
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

import { useBranch } from "@/context/BranchContext";
import { useTables } from "@/hooks/useTables";
import { useStaff, usePendingInvites } from "@/hooks/useStaff";
import { Badge } from "@/components/ui/badge";
import { BusinessProfileCard } from "@/components/dashboard/BusinessProfileCard";
import { StaffSummaryCard } from "@/components/dashboard/StaffSummaryCard";

export default function OwnerDashboard() {
  const { activeBranchId, activeBranch, activeMembership } = useBranch();
  
  // 1. Data Fetching
  const { data: tables = [], isLoading: loadingTables } = useTables(activeBranchId);
  const { data: staffData = [], isLoading: loadingStaff } = useStaff(activeBranchId);
  const { data: invitesData = [], isLoading: loadingInvites } = usePendingInvites(activeBranchId);

  // Normalize data structures
  const staff = staffData?.data || staffData || [];
  const invites = invitesData?.data || invitesData || [];

  return (
    <div className="w-full pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        
        {/* Top Section: Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}
        </div>

        {/* Mid Section: Business & Staff Overview */}
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-5">
           <div className="xl:col-span-3">
              <BusinessProfileCard 
                branch={activeBranch} 
                brand={activeMembership?.brand} 
                membership={activeMembership}
              />
           </div>
           <div className="xl:col-span-2">
              <StaffSummaryCard 
                staff={staff}
                invites={invites}
              />
           </div>
        </div>

        {/* Lower Section: Analytics & Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"><RevenueChart /></div>
          <div><ActivityFeed /></div>
        </div>
        
        {/* Table & Reservations Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
              Recent Reservations
              <Badge variant="outline" className="text-[10px] font-normal">Live</Badge>
            </h2>
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <BookingTable />
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
              Active Tables
              <Badge variant="outline" className="text-[10px] font-normal">{tables.length}</Badge>
            </h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              {loadingTables ? (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-muted-foreground">Synchronizing tables...</span>
                </div>
              ) : tables.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground bg-muted/5">
                   <p className="text-sm">No active tables found in this branch.</p>
                   <button className="mt-4 text-xs font-semibold text-primary hover:underline underline-offset-4">
                     + Setup Table Layout
                   </button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {tables.slice(0, 5).map((table) => (
                    <div key={table._id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{table.tableCode}</span>
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize font-normal">{table.type}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {table.capacity} Seats • {table.floor || "Ground"} Floor {table.section && `• ${table.section}`}
                        </p>
                      </div>
                      <div className="text-right">
                         <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none text-[10px] font-bold">AVAILABLE</Badge>
                      </div>
                    </div>
                  ))}
                  {tables.length > 5 && (
                    <div className="p-3 text-center bg-muted/5">
                       <button className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 mx-auto">
                         View All {tables.length} Tables <ArrowRight className="h-3 w-3" />
                       </button>
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
