import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Ban, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockBookings, restaurantTables } from "@/lib/mockData";

const statusStyles = {
  confirmed: "bg-accent/10 text-accent border-accent/20",
  pending: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-muted text-muted-foreground border-border",
};

function asCustomerName(userId) {
  const map = { u1: "Alice Johnson", u2: "Bob Smith" };
  return map[userId] || "Customer";
}

function tableLabel(tableId) {
  const table = restaurantTables["1"]?.find((t) => t._id === tableId);
  return table?.tableNumber || tableId;
}

export default function ManageReservations() {
  const [bookings, setBookings] = useState(() => mockBookings.map((b) => ({ ...b })));

  const today = new Date().toISOString().slice(0, 10);

  const groups = useMemo(() => {
    const isPast = (b) => b.date < today;
    const isToday = (b) => b.date === today;
    const isUpcoming = (b) => b.date > today;
    return {
      today: bookings.filter((b) => isToday(b) && b.status !== "cancelled"),
      upcoming: bookings.filter((b) => isUpcoming(b) && b.status !== "cancelled"),
      past: bookings.filter((b) => isPast(b) && b.status !== "cancelled"),
      cancelled: bookings.filter((b) => b.status === "cancelled"),
    };
  }, [bookings, today]);

  const updateStatus = (id, status) => {
    setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status } : b)));
  };

  const handleAccept = (b) => {
    updateStatus(b._id, "confirmed");
    toast.success("Reservation accepted");
  };

  const handleReject = (b) => {
    updateStatus(b._id, "cancelled");
    toast.success("Reservation rejected");
  };

  const handleCancel = (b) => {
    updateStatus(b._id, "cancelled");
    toast.success("Reservation cancelled");
  };

  const handleComplete = (b) => {
    updateStatus(b._id, "completed");
    toast.success("Marked as completed");
  };

  const renderTable = (rows) => {
    return (
      <Card className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Customer</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((b) => (
              <TableRow key={b._id}>
                <TableCell className="font-medium">{asCustomerName(b.user)}</TableCell>
                <TableCell>{tableLabel(b.table)}</TableCell>
                <TableCell>{b.date}</TableCell>
                <TableCell className="font-mono text-xs">{b.time}</TableCell>
                <TableCell>{b.guests}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyles[b.status] || ""}>
                    {b.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex flex-wrap justify-end gap-2">
                    {b.status === "pending" ? (
                      <>
                        <Button size="sm" className="gap-2" onClick={() => handleAccept(b)}>
                          <CheckCircle2 className="h-4 w-4" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => handleReject(b)}>
                          <XCircle className="h-4 w-4" /> Reject
                        </Button>
                      </>
                    ) : null}

                    {b.status === "confirmed" ? (
                      <>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => handleComplete(b)}>
                          <BadgeCheck className="h-4 w-4" /> Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleCancel(b)}
                        >
                          <Ban className="h-4 w-4" /> Cancel
                        </Button>
                      </>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Manage Reservations</h1>
          <p className="mb-6 text-muted-foreground">View and manage all restaurant reservations</p>

          <Tabs defaultValue="today">
            <TabsList className="mb-6">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            <TabsContent value="today">{renderTable(groups.today)}</TabsContent>
            <TabsContent value="upcoming">{renderTable(groups.upcoming)}</TabsContent>
            <TabsContent value="past">{renderTable(groups.past)}</TabsContent>
            <TabsContent value="cancelled">{renderTable(groups.cancelled)}</TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
