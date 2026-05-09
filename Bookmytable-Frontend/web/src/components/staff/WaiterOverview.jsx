import React from "react";
import { 
  Table as TableIcon, 
  UtensilsCrossed, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export const WaiterOverview = ({ tables }) => {
  const navigate = useNavigate();
  // Filter for 'occupied' or 'reserved' as waiters care about active guests
  const activeTables = tables.filter(t => t.status !== "available");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Service View</h1>
        <p className="text-muted-foreground mt-1">Manage your active tables and orders</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeTables.map((table) => (
          <div key={table._id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {table.tableCode}
                </div>
                <div>
                  <Badge variant={table.status === 'occupied' ? 'destructive' : 'info'}>
                    {table.status.toUpperCase()}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{table.capacity} Seats</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate("/staff/live-tables")}>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Seated:
                </span>
                <span className="font-medium">20 mins ago</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <UtensilsCrossed className="w-3 h-3" /> Order Status:
                </span>
                <span className="text-amber-600 font-medium">Pending</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1 h-11" variant="outline">View Order</Button>
              <Button className="flex-1 h-11">Complete</Button>
            </div>
          </div>
        ))}

        {activeTables.length === 0 && (
          <div className="col-span-full py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed border-border">
             <TableIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
             <h3 className="text-lg font-medium text-muted-foreground">No Active Tables</h3>
             <p className="text-sm text-muted-foreground/70">All tables are currently available.</p>
             <Button className="mt-4" onClick={() => navigate("/staff/live-tables")}>View Floor Map</Button>
          </div>
        )}
      </div>

      <div className="bg-muted/30 rounded-2xl p-6 border border-border">
         <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
           <UtensilsCrossed className="w-5 h-5 text-primary" />
           Service Notifications
         </h2>
         <div className="space-y-3">
            <div className="p-3 bg-card border border-border rounded-lg text-sm flex items-center gap-3">
               <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
               Table 4 requested the bill
            </div>
            <div className="p-3 bg-card border border-border rounded-lg text-sm flex items-center gap-3">
               <div className="h-2 w-2 rounded-full bg-green-500" />
               Order for Table 2 is ready to serve
            </div>
         </div>
      </div>
    </div>
  );
};
