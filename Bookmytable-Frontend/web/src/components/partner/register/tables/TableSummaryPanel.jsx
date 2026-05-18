import { Users, Grip, Plus, Trash2, ArrowUpRight, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TableSummaryPanel({ tables }) {
  const totalTables = tables.length;
  const totalSeats = tables.reduce((acc, t) => acc + Number(t.capacity || 0), 0);
  const avgCapacity = totalTables ? Math.round(totalSeats / totalTables) : 0;
  const largestTable = tables.length ? Math.max(...tables.map(t => Number(t.capacity || 0))) : 0;

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm sticky top-24">
      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
        <ArrowUpRight className="h-5 w-5 text-primary" /> Capacity Summary
      </h3>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
          <p className="text-xs text-muted-foreground font-semibold mb-1">Total Tables</p>
          <p className="text-2xl font-black text-primary">{totalTables}</p>
        </div>
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
          <p className="text-xs text-muted-foreground font-semibold mb-1">Total Seats</p>
          <p className="text-2xl font-black text-primary">{totalSeats}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm border-b border-border pb-3">
          <span className="text-muted-foreground font-medium">Average Capacity</span>
          <span className="font-bold text-foreground">{avgCapacity} Seats</span>
        </div>
        <div className="flex justify-between items-center text-sm border-b border-border pb-3">
          <span className="text-muted-foreground font-medium">Largest Table</span>
          <span className="font-bold text-foreground">{largestTable} Seats</span>
        </div>
        <div className="flex justify-between items-center text-sm pb-1">
          <span className="text-muted-foreground font-medium">Reservation Ready</span>
          {totalTables > 0 ? (
            <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-0">Yes</Badge>
          ) : (
             <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">No</Badge>
          )}
        </div>
      </div>
      
      {totalTables > 0 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-2xl">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Your restaurant can accommodate approximately <strong className="text-foreground">{totalSeats * 2.5} covers</strong> per day assuming a 2.5x table turnover rate.
          </p>
        </div>
      )}
    </div>
  );
}
