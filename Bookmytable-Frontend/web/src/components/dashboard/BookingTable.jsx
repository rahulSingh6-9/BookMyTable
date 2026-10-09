import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  confirmed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  payment_pending: "bg-amber-50 text-amber-600 border-amber-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  expired: "bg-slate-100 text-slate-500 border-slate-200",
  completed: "bg-muted text-muted-foreground border-border",
  payment_failed: "bg-red-50 text-red-600 border-red-200",
};

export function BookingTable({ bookings = [] }) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground text-sm">
        No bookings found in this category.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Booking ID</TableHead>
            <TableHead>Restaurant / Guest</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Guests</TableHead>
            <TableHead>Table</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((b) => {
            const id = b._id ? b._id.slice(-8).toUpperCase() : b.id;
            const restaurantName = b.restaurantId?.name || b.guest || "Restaurant";
            const tableText = b.tables?.length > 0
              ? b.tables.map(t => t.tableName).join(", ")
              : b.tableName || b.table || "Reserved";
            const amount = b.grandTotal != null ? `₹${b.grandTotal}` : b.price || "-";

            return (
              <TableRow key={b._id || b.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono text-xs font-semibold">{id}</TableCell>
                <TableCell className="font-medium text-foreground">{restaurantName}</TableCell>
                <TableCell>{b.date}</TableCell>
                <TableCell>{b.time}</TableCell>
                <TableCell>{b.guests} Guests</TableCell>
                <TableCell>{tableText}</TableCell>
                <TableCell className="font-medium">{amount}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`capitalize font-semibold text-[11px] ${statusColors[b.status] || ""}`}>
                    {b.status?.replace("_", " ") || "confirmed"}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
