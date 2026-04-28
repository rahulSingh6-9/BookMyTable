import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  confirmed: "bg-accent/10 text-accent border-accent/20",
  pending: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-muted text-muted-foreground border-border",
};

const mockBookings = [
  { id: "B001", guest: "Alice Johnson", date: "2026-03-18", time: "7:00 PM", guests: 4, table: "Table 2", status: "confirmed" },
  { id: "B002", guest: "Bob Smith", date: "2026-03-18", time: "8:00 PM", guests: 2, table: "Table 1", status: "pending" },
  { id: "B003", guest: "Carol White", date: "2026-03-19", time: "6:30 PM", guests: 6, table: "Table 5", status: "confirmed" },
  { id: "B004", guest: "Dave Brown", date: "2026-03-17", time: "7:30 PM", guests: 3, table: "Table 3", status: "completed" },
  { id: "B005", guest: "Eva Green", date: "2026-03-16", time: "8:30 PM", guests: 2, table: "Table 4", status: "cancelled" },
];

export function BookingTable({ bookings = mockBookings }) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Booking ID</TableHead>
            <TableHead>Guest</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Guests</TableHead>
            <TableHead>Table</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-mono text-xs">{b.id}</TableCell>
              <TableCell className="font-medium">{b.guest}</TableCell>
              <TableCell>{b.date}</TableCell>
              <TableCell>{b.time}</TableCell>
              <TableCell>{b.guests}</TableCell>
              <TableCell>{b.table}</TableCell>
              <TableCell>
                <Badge variant="outline" className={statusColors[b.status] || ""}>
                  {b.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
