import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Info } from "lucide-react";

import { RoomSelector } from "@/components/visual-layout/RoomSelector";
import { LayoutViewer } from "@/components/visual-layout/LayoutViewer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { mockBookings } from "@/lib/mockData";
import { useLayout } from "@/hooks/useLayout";

const timeSlots = ["18:00", "19:00", "20:00", "21:00"];

function getStatusFromBookings({ tableId, date, slot }) {
  const b = mockBookings.find((x) => x.table === tableId && x.date === date && x.time === slot);
  if (!b) return "available";
  if (b.status === "confirmed") return "reserved";
  if (b.status === "completed") return "occupied";
  if (b.status === "pending") return "reserved";
  return "available";
}

export default function OwnerAvailability() {
  const { rooms, activeRoom, activeRoomId, setActiveRoomId } = useLayout("1");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState("19:00");
  const [selected, setSelected] = useState(null);

  const legend = useMemo(
    () => [
      { label: "Available", status: "available", className: "bg-emerald-50 text-emerald-700 border-emerald-500/30" },
      { label: "Reserved", status: "reserved", className: "bg-amber-50 text-amber-700 border-amber-500/30" },
      { label: "Occupied", status: "occupied", className: "bg-destructive/5 text-destructive border-destructive/20" },
    ],
    []
  );

  const getTableStatus = (table) => getStatusFromBookings({ tableId: table._id, date, slot });

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Availability (Live)</h1>
              <p className="text-muted-foreground">Real-time table status view (socket-ready)</p>
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

          <RoomSelector rooms={rooms} activeRoomId={activeRoomId} onSelect={setActiveRoomId} />

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {legend.map((l) => (
                  <Badge key={l.status} variant="outline" className={l.className}>
                    {l.label}
                  </Badge>
                ))}
              </div>
              <LayoutViewer
                room={activeRoom}
                getTableStatus={getTableStatus}
                selectedId={selected?._id}
                onSelect={setSelected}
              />
            </div>

            <Card className="shadow-card h-fit lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="text-base">Table details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selected ? (
                  <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5" />
                    Select a table to view status for the chosen date/time slot.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-foreground">{selected.tableNumber}</div>
                      <Badge variant="outline" className="capitalize">
                        {getTableStatus(selected)}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-medium">{selected.capacity}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium capitalize">{selected.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Room</span>
                        <span className="font-medium">{activeRoom?.name}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="text-xs text-muted-foreground">
                      Live updates: ready to connect to sockets (table state would update without refreshing).
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

