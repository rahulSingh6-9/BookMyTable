import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format, parseISO, isValid } from "date-fns";
import {
  BadgeCheck,
  Ban,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Hourglass,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/common/Loader";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useBranch } from "@/context/BranchContext";
import { useRestaurantBookings, useUpdateBookingStatus } from "@/hooks/useBookings";
import {
  socket,
  joinRestaurantRoom,
  leaveRestaurantRoom,
} from "@/services/socket";
import { useQueryClient } from "@tanstack/react-query";

const statusStyles = {
  confirmed: "bg-accent/10 text-accent border-accent/20",
  pending: "bg-primary/10 text-primary border-primary/20",
  payment_pending: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-muted text-muted-foreground border-border",
  checked_in: "bg-accent/10 text-accent border-accent/20",
  no_show: "bg-destructive/10 text-destructive border-destructive/20",
  payment_failed: "bg-destructive/10 text-destructive border-destructive/20",
  expired: "bg-muted text-muted-foreground border-border",
};

const paymentStyles = {
  paid: "bg-accent/10 text-accent border-accent/20",
  pending: "bg-primary/10 text-primary border-primary/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  refunded: "bg-muted text-muted-foreground border-border",
  refund_pending: "bg-primary/10 text-primary border-primary/20",
};

const HIDDEN_STATUSES = new Set(["expired"]);

function customerName(booking) {
  return booking.userId?.name || booking.user?.name || "Guest";
}

function customerContact(booking) {
  return booking.userId?.phone || booking.userId?.email || booking.user?.email || "";
}

function tableLabel(booking) {
  if (Array.isArray(booking.tables) && booking.tables.length > 0) {
    const names = booking.tables.map((t) => t.tableName).filter(Boolean);
    if (names.length) return names.join(", ");
  }
  return booking.tableName || "—";
}

function formatBookingDate(dateStr) {
  if (!dateStr) return "—";
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? format(parsed, "dd MMM yyyy") : dateStr;
}

function bookingIdLabel(id) {
  if (!id) return "—";
  const value = String(id);
  return value.slice(-8).toUpperCase();
}

const STAT_TONES = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600",
  warning: "bg-amber-500/10 text-amber-600",
  danger: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
  info: "bg-sky-500/10 text-sky-600",
};

function StatCard({ icon: Icon, label, value, hint, tone = "primary" }) {
  return (
    <Card className="rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-md">
      <CardContent className="p-3.5 sm:p-4">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
            {label}
          </p>
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${STAT_TONES[tone] || STAT_TONES.primary}`}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className="text-xl font-bold tracking-tight text-foreground sm:text-[22px]">{value}</p>
        {hint ? <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export default function ManageReservations() {
  const { activeBranchId, activeBranch } = useBranch();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useRestaurantBookings(activeBranchId);

  const statusMutation = useUpdateBookingStatus(activeBranchId);

  useEffect(() => {
    if (!activeBranchId) return;
    joinRestaurantRoom(activeBranchId);

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", activeBranchId] });
    };

    socket.on("table:availability_changed", invalidate);
    socket.on("booking:confirmed", invalidate);
    socket.on("booking:created", invalidate);
    socket.on("booking:cancelled", invalidate);

    return () => {
      leaveRestaurantRoom(activeBranchId);
      socket.off("table:availability_changed", invalidate);
      socket.off("booking:confirmed", invalidate);
      socket.off("booking:created", invalidate);
      socket.off("booking:cancelled", invalidate);
    };
  }, [activeBranchId, queryClient]);

  const today = format(new Date(), "yyyy-MM-dd");

  const visibleBookings = useMemo(
    () => bookings.filter((b) => !HIDDEN_STATUSES.has(b.status)),
    [bookings]
  );

  const stats = useMemo(() => {
    const notCancelled = visibleBookings.filter((b) => b.status !== "cancelled");
    return {
      total: visibleBookings.length,
      today: notCancelled.filter((b) => b.date === today).length,
      upcoming: notCancelled.filter((b) => b.date > today).length,
      confirmed: visibleBookings.filter((b) => b.status === "confirmed").length,
      pending: visibleBookings.filter((b) =>
        ["pending", "payment_pending"].includes(b.status)
      ).length,
      cancelled: visibleBookings.filter((b) => b.status === "cancelled").length,
      completed: visibleBookings.filter((b) => b.status === "completed").length,
      guests: notCancelled.reduce((sum, b) => sum + (Number(b.guests) || 0), 0),
    };
  }, [visibleBookings, today]);

  const groups = useMemo(() => {
    const matchesStatus = (b) =>
      statusFilter === "all" || b.status === statusFilter ||
      (statusFilter === "pending" && ["pending", "payment_pending"].includes(b.status));

    const rows = visibleBookings.filter(matchesStatus);
    return {
      today: rows.filter((b) => b.date === today && b.status !== "cancelled"),
      upcoming: rows.filter((b) => b.date > today && b.status !== "cancelled"),
      past: rows.filter((b) => b.date < today && b.status !== "cancelled"),
      cancelled: rows.filter((b) => b.status === "cancelled"),
    };
  }, [visibleBookings, today, statusFilter]);

  const mutateStatus = (booking, status, successMessage) => {
    statusMutation.mutate(
      { id: booking._id, status },
      {
        onSuccess: () => toast.success(successMessage),
        onError: (err) =>
          toast.error(err?.response?.data?.message || err.message || "Update failed"),
      }
    );
  };

  const renderTable = (rows) => {
    if (rows.length === 0) {
      return (
        <Card className="rounded-lg border border-border bg-card shadow-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No reservations in this list.</p>
        </Card>
      );
    }

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
              <TableHead>Payment</TableHead>
              <TableHead>Booking ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((b) => (
              <TableRow key={b._id}>
                <TableCell>
                  <div className="font-medium">{customerName(b)}</div>
                  {customerContact(b) ? (
                    <div className="text-xs text-muted-foreground">{customerContact(b)}</div>
                  ) : null}
                  {b.specialRequests ? (
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {b.specialRequests}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell>{tableLabel(b)}</TableCell>
                <TableCell>{formatBookingDate(b.date)}</TableCell>
                <TableCell className="font-mono text-xs">{b.time || "—"}</TableCell>
                <TableCell>{b.guests ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyles[b.status] || ""}>
                    {String(b.status || "").replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={paymentStyles[b.paymentStatus] || ""}>
                    {b.paymentStatus || "—"}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs" title={String(b._id)}>
                  {bookingIdLabel(b._id)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex flex-wrap justify-end gap-2">
                    {["pending", "payment_pending"].includes(b.status) ? (
                      <>
                        <Button
                          size="sm"
                          className="gap-2"
                          disabled={statusMutation.isPending}
                          onClick={() => mutateStatus(b, "confirmed", "Reservation accepted")}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          disabled={statusMutation.isPending}
                          onClick={() => mutateStatus(b, "cancelled", "Reservation rejected")}
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </Button>
                      </>
                    ) : null}

                    {b.status === "confirmed" || b.status === "checked_in" ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          disabled={statusMutation.isPending}
                          onClick={() => mutateStatus(b, "completed", "Marked as completed")}
                        >
                          <BadgeCheck className="h-4 w-4" /> Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                          disabled={statusMutation.isPending}
                          onClick={() => mutateStatus(b, "cancelled", "Reservation cancelled")}
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
          <p className="mb-6 text-muted-foreground">
            View and manage reservations
            {activeBranch?.branchName ? ` for ${activeBranch.branchName}` : ""}
          </p>

          {!activeBranchId ? (
            <ErrorMessage
              title="No branch selected"
              message="Select a restaurant branch to load its reservations."
            />
          ) : isLoading ? (
            <Loader text="Loading reservations..." />
          ) : isError ? (
            <ErrorMessage
              title="Could not load reservations"
              message={error?.response?.data?.message || error?.message || "The reservations API failed. Demo data was not used."}
              onRetry={() => refetch()}
            />
          ) : (
            <>
              <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
                <StatCard icon={CalendarDays} label="Total Reservations" value={stats.total} hint="All branch records" />
                <StatCard icon={CalendarCheck} label="Today" value={stats.today} hint="Scheduled for today" />
                <StatCard icon={Clock} label="Upcoming" value={stats.upcoming} hint="After today" tone="info" />
                <StatCard icon={CheckCircle2} label="Confirmed" value={stats.confirmed} hint="Ready to host" tone="success" />
                <StatCard icon={Hourglass} label="Pending" value={stats.pending} hint="Awaiting action" tone="warning" />
                <StatCard icon={Ban} label="Cancelled" value={stats.cancelled} hint="Closed bookings" tone="danger" />
                <StatCard icon={BadgeCheck} label="Completed" value={stats.completed} hint="Finished visits" tone="muted" />
                <StatCard icon={Users} label="Total Guests" value={stats.guests} hint="Across active bookings" />
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Status</span>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked_in">Checked in</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No show</option>
                </select>
              </div>

              <Tabs defaultValue="today">
                <TabsList className="mb-6">
                  <TabsTrigger value="today">Today ({groups.today.length})</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming ({groups.upcoming.length})</TabsTrigger>
                  <TabsTrigger value="past">Past ({groups.past.length})</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled ({groups.cancelled.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="today">{renderTable(groups.today)}</TabsContent>
                <TabsContent value="upcoming">{renderTable(groups.upcoming)}</TabsContent>
                <TabsContent value="past">{renderTable(groups.past)}</TabsContent>
                <TabsContent value="cancelled">{renderTable(groups.cancelled)}</TabsContent>
              </Tabs>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
