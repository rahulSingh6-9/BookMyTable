import React from "react";
import { 
  CalendarCheck, 
  Table as TableIcon, 
  TrendingUp,
  Clock
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { format } from "date-fns";

export const ManagerOverview = ({ bookings, tables }) => {
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const activeTables = tables.filter(t => t.status === "occupied").length;
  const occupancyRate = tables.length > 0 ? Math.round((activeTables / tables.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Operations Dashboard</h1>
        <p className="text-muted-foreground mt-1">Full control of restaurant status for today</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Bookings" 
          value={bookings.length} 
          icon={CalendarCheck} 
          index={0} 
        />
        <StatsCard 
          title="Pending Requests" 
          value={pendingBookings} 
          icon={Clock} 
          index={1} 
        />
        <StatsCard 
          title="Active Tables" 
          value={`${activeTables}/${tables.length}`} 
          icon={TableIcon} 
          index={2} 
        />
        <StatsCard 
          title="Occupancy" 
          value={`${occupancyRate}%`} 
          icon={TrendingUp} 
          index={3} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Upcoming Reservations
          </h2>
          <div className="space-y-4">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div>
                  <p className="font-medium text-sm">{booking.user?.name || "Walk-in"}</p>
                  <p className="text-xs text-muted-foreground">{booking.time} • {booking.guests} guests</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-sm text-center text-muted-foreground py-8">No bookings for today.</p>}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-primary" />
            Table Occupancy Status
          </h2>
          <div className="grid grid-cols-4 gap-2">
             {tables.map(table => (
               <div key={table._id} className={`p-3 rounded-lg border text-center ${
                 table.status === 'occupied' ? 'bg-red-50 border-red-100 text-red-600' :
                 table.status === 'reserved' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                 'bg-green-50 border-green-100 text-green-600'
               }`}>
                  <p className="text-xs font-bold">{table.tableCode}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
