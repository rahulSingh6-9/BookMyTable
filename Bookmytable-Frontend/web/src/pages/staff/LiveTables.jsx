import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { RoomSelector } from "@/components/visual-layout/RoomSelector";
import { LayoutViewer } from "@/components/visual-layout/LayoutViewer";
import { TableActionPanel } from "@/components/staff/TableActionPanel";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { mockBookings } from "@/lib/mockData";
import { useLayout } from "@/hooks/useLayout";

const timeSlots = ["18:00", "19:00", "20:00", "21:00"];

function customerName(userId) {
  const map = { u1: "Alice Johnson", u2: "Bob Smith" };
  return map[userId] || "Customer";
}

export default function StaffLiveTables() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { rooms, activeRoom, activeRoomId, setActiveRoomId } = useLayout("1");

  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState("19:00");

  // tableId -> "available" | "reserved" | "occupied"
  const [overrides, setOverrides] = useState({});
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const baseStatusByTableId = useMemo(() => {
    const map = {};
    for (const b of mockBookings) {
      if (b.restaurant !== "1") continue;
      if (b.date !== date) continue;
      if (b.time !== slot) continue;
      if (b.status === "confirmed" || b.status === "pending") map[b.table] = "reserved";
      if (b.status === "completed") map[b.table] = "occupied";
      if (b.status === "cancelled") map[b.table] = "available";
    }
    return map;
  }, [date, slot]);

  const getTableStatus = (table) => overrides[table._id] || baseStatusByTableId[table._id] || "available";

  const bookingInfoForTable = (tableId) => {
    const b = mockBookings.find((x) => x.restaurant === "1" && x.date === date && x.time === slot && x.table === tableId);
    if (!b) return null;
    return {
      customerName: customerName(b.user),
      time: b.time,
      guests: b.guests,
    };
  };

  const handleSelectTable = (table) => {
    setSelected(table);
    if (isMobile) setDialogOpen(true);
  };

  const selectedStatus = selected ? getTableStatus(selected) : null;
  const selectedBooking = selected ? bookingInfoForTable(selected._id) : null;

  const handleCheckIn = () => {
    if (!selected) return;
    setOverrides((prev) => ({ ...prev, [selected._id]: "occupied" }));
    toast.success("Checked in");
    setDialogOpen(false);
  };

  const handleComplete = () => {
    if (!selected) return;
    setOverrides((prev) => ({ ...prev, [selected._id]: "available" }));
    toast.success("Table freed");
    setDialogOpen(false);
  };

  const handleAssignWalkIn = () => {
    if (!selected) return;
    toast.message("Walk-in", { description: `Creating a walk-in for ${selected.tableNumber}` });
    navigate(`/staff/walkin-booking?table=${encodeURIComponent(selected._id)}`);
  };

  const legend = [
    { label: "Available", className: "bg-emerald-50 text-emerald-700 border-emerald-500/30" },
    { label: "Reserved", className: "bg-amber-50 text-amber-700 border-amber-500/30" },
    { label: "Occupied", className: "bg-destructive/5 text-destructive border-destructive/20" },
  ];

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-52" />
            <Skeleton className="h-10 w-52" />
          </div>
          <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="p-4 lg:p-6">
        <EmptyState
          title="No layout configured"
          description="Ask the owner to set up a room layout first."
          actionLabel="Go to owner layout"
          onAction={() => navigate("/owner/layout")}
        />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Tables</h1>
            <p className="text-muted-foreground">Tap a table to check-in, complete, or assign a walk-in</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" /> Date
              </Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[200px]" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Time slot
              </Label>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {legend.map((l) => (
            <Badge key={l.label} variant="outline" className={l.className}>
              {l.label}
            </Badge>
          ))}
        </div>

        <RoomSelector rooms={rooms} activeRoomId={activeRoomId} onSelect={setActiveRoomId} />

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            <LayoutViewer
              room={activeRoom}
              getTableStatus={getTableStatus}
              selectedId={selected?._id}
              onSelect={handleSelectTable}
            />
          </div>

          {/* Desktop action panel */}
          <div className="hidden lg:block lg:sticky lg:top-24 h-fit">
            <TableActionPanel
              table={selected}
              status={selectedStatus}
              bookingInfo={selectedBooking}
              onCheckIn={handleCheckIn}
              onComplete={handleComplete}
              onAssignWalkIn={handleAssignWalkIn}
            />
          </div>
        </div>

        {/* Mobile modal actions */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Table actions</DialogTitle>
            </DialogHeader>
            <TableActionPanel
              table={selected}
              status={selectedStatus}
              bookingInfo={selectedBooking}
              onCheckIn={handleCheckIn}
              onComplete={handleComplete}
              onAssignWalkIn={handleAssignWalkIn}
            />
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}

