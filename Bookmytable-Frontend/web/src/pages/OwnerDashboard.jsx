import { motion } from "framer-motion";
import { 
  CalendarDays, Users, DollarSign, TrendingUp, ArrowRight, 
  Plus, CheckCircle2, AlertTriangle, AlertCircle, Clock, 
  MapPin, Activity, Table2, Settings, UtensilsCrossed 
} from "lucide-react";

import { useBranch } from "@/context/BranchContext";
import { useTables } from "@/hooks/useTables";
import { useStaff, usePendingInvites } from "@/hooks/useStaff";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { BookingTable } from "@/components/dashboard/BookingTable";
import { Link } from "react-router-dom";

export default function OwnerDashboard() {
  const { activeBranchId, activeBranch, activeMembership } = useBranch();
  
  // Data Fetching
  const { data: tables = [], isLoading: loadingTables } = useTables(activeBranchId);
  const { data: staffData = [], isLoading: loadingStaff } = useStaff(activeBranchId);
  const { data: invitesData = [], isLoading: loadingInvites } = usePendingInvites(activeBranchId);

  // Normalize data structures
  const staff = staffData?.data || staffData || [];
  const invites = invitesData?.data || invitesData || [];
  const activeStaffCount = staff.filter(s => s.status === "active").length;
  const availableTables = tables.length; // Placeholder logic until real-time table status exists

  return (
    <div className="w-full pb-10 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        {/* SECTION 1: HERO SUMMARY AREA (Compact) */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-8 divide-x divide-border overflow-x-auto w-full md:w-auto">
            
            <div className="px-4 first:pl-0 flex flex-col">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Reservations</span>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-black text-foreground">18</span>
              </div>
            </div>

            <div className="px-4 flex flex-col">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Occupancy</span>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                <span className="text-2xl font-black text-foreground">65%</span>
              </div>
            </div>

            <div className="px-4 flex flex-col">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Active Tables</span>
              <div className="flex items-center gap-2">
                <Table2 className="w-5 h-5 text-amber-500" />
                <span className="text-2xl font-black text-foreground">12 <span className="text-sm font-medium text-muted-foreground">/ {tables.length || 20}</span></span>
              </div>
            </div>

            <div className="px-4 flex flex-col">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Revenue (Est)</span>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-2xl font-black text-foreground">$3,420</span>
              </div>
            </div>

          </div>
          
          <div className="hidden md:block">
             <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <Activity className="w-3 h-3 mr-1" /> Operations Normal
             </Badge>
          </div>
        </div>

        {/* 3-COLUMN MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT & CENTER COLUMNS (OPERATIONS) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SECTION 4: TODAY'S OPERATIONS */}
            <Card className="rounded-xl border-border shadow-sm">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Today's Operations</CardTitle>
                  <CardDescription>Live view of your floor and bookings.</CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Live Sync</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
                  
                  {/* Left Half: Reservations Table */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-foreground">Upcoming Reservations</h3>
                      <Link to="reservations" className="text-xs text-primary hover:underline font-semibold flex items-center">
                        View All <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                    <div className="bg-muted/5 rounded-lg border border-border/50 overflow-hidden">
                       <BookingTable />
                    </div>
                  </div>

                  {/* Right Half: Active Tables List */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-foreground">Available Tables</h3>
                      <Link to="operations/tables" className="text-xs text-primary hover:underline font-semibold flex items-center">
                        Manage <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                    
                    {loadingTables ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center gap-3 bg-muted/5 rounded-lg border border-border/50 h-full">
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-muted-foreground">Syncing floor...</span>
                      </div>
                    ) : tables.length === 0 ? (
                      <div className="p-8 text-center bg-muted/5 rounded-lg border border-border/50 h-full flex flex-col items-center justify-center">
                         <Table2 className="w-8 h-8 text-muted-foreground/30 mb-2" />
                         <p className="text-sm font-medium">No active tables</p>
                         <p className="text-xs text-muted-foreground mb-4">Setup your floor plan.</p>
                         <Button variant="outline" size="sm" className="h-8 text-xs">Add Table</Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tables.slice(0, 5).map((table) => (
                          <div key={table._id} className="p-3 bg-muted/5 border border-border/50 rounded-lg flex items-center justify-between hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                               </div>
                               <div>
                                 <p className="text-sm font-bold">{table.tableCode}</p>
                                 <p className="text-xs text-muted-foreground capitalize">{table.capacity} Seats • {table.type}</p>
                               </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] bg-white">Ready</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SECTION 5: PERFORMANCE SNAPSHOT */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="rounded-xl shadow-sm border-border bg-gradient-to-br from-card to-muted/10">
                <CardContent className="p-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Booking Trend</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">+15%</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">vs last week</p>
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-sm border-border bg-gradient-to-br from-card to-muted/10">
                <CardContent className="p-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Turnover Time</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">42m</span>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Average per table</p>
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-sm border-border bg-gradient-to-br from-card to-muted/10">
                <CardContent className="p-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Walk-ins</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">30%</span>
                    <MapPin className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Of total traffic</p>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* RIGHT COLUMN (CONTEXT & ACTIONS) */}
          <div className="space-y-6">
            
            {/* SECTION 6: ATTENTION REQUIRED */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                Needs Attention
              </h2>
              {invites.length > 0 && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-800 rounded-xl shadow-sm py-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <AlertTitle className="text-amber-800 font-bold text-sm">Pending Invitations</AlertTitle>
                  <AlertDescription className="text-amber-700/90 text-xs mt-0.5">
                    You have {invites.length} staff member(s) who haven't accepted their invite.
                  </AlertDescription>
                </Alert>
              )}
              {availableTables < 5 && availableTables > 0 && (
                <Alert className="bg-blue-50 border-blue-200 text-blue-800 rounded-xl shadow-sm py-3">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <AlertTitle className="text-blue-800 font-bold text-sm">Low Capacity Warning</AlertTitle>
                  <AlertDescription className="text-blue-700/90 text-xs mt-0.5">
                    You are approaching maximum table capacity for tonight.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* SECTION 3: ACTION CENTER */}
            <Card className="rounded-xl border-border shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors" asChild>
                    <Link to="operations/tables">
                      <Table2 className="w-5 h-5 text-primary" />
                      <span className="text-xs">Add Table</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors" asChild>
                    <Link to="reservations">
                      <CalendarDays className="w-5 h-5 text-primary" />
                      <span className="text-xs">New Booking</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors" asChild>
                    <Link to="staff">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-xs">Invite Staff</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors" asChild>
                    <Link to="menu">
                      <UtensilsCrossed className="w-5 h-5 text-primary" />
                      <span className="text-xs">Manage Menu</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SECTION 2: OPERATIONAL HEALTH */}
            <Card className="rounded-xl border-border shadow-sm bg-muted/10">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-muted-foreground">Health Check</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Active Staff</span>
                    <span className="font-bold">{activeStaffCount} / {staff.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Tables Configured</span>
                    <span className="font-bold">{tables.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Payment Gateway</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 px-1.5 py-0 text-[10px]">Connected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SECTION 7: RECENT ACTIVITY */}
            <Card className="rounded-xl border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/50 p-4 py-3">
                <CardTitle className="text-sm flex items-center justify-between font-bold">
                  <span>Recent Activity</span>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  <div className="p-3 flex items-start gap-3 hover:bg-muted/5 transition-colors">
                    <div className="bg-blue-100 p-1.5 rounded-full mt-0.5">
                      <CalendarDays className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">New Reservation (John D.)</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">10 mins ago</p>
                    </div>
                  </div>
                  <div className="p-3 flex items-start gap-3 hover:bg-muted/5 transition-colors">
                    <div className="bg-emerald-100 p-1.5 rounded-full mt-0.5">
                      <Table2 className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Table 12 Checked In</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">25 mins ago</p>
                    </div>
                  </div>
                  <div className="p-3 flex items-start gap-3 hover:bg-muted/5 transition-colors">
                    <div className="bg-amber-100 p-1.5 rounded-full mt-0.5">
                      <Settings className="w-3 h-3 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Menu Updated</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
