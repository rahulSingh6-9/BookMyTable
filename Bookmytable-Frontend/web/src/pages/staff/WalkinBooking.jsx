import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLayout } from "@/hooks/useLayout";

const timeSlots = ["18:00", "19:00", "20:00", "21:00"];

function defaultEnd(start) {
  const [h, m] = start.split(":").map(Number);
  const dt = new Date();
  dt.setHours(h, m, 0, 0);
  dt.setMinutes(dt.getMinutes() + 90);
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function StaffWalkinBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTable = searchParams.get("table");

  const { rooms, activeRoom, activeRoomId, setActiveRoomId } = useLayout("1");

  const allTables = useMemo(() => rooms.flatMap((r) => r.layout?.tables || []), [rooms]);

  const [tableId, setTableId] = useState(preselectedTable || "");
  const [guests, setGuests] = useState(2);
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState(defaultEnd("19:00"));
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (preselectedTable) setTableId(preselectedTable);
  }, [preselectedTable]);

  const tableOptions = useMemo(() => {
    return allTables
      .slice()
      .sort((a, b) => String(a.tableNumber).localeCompare(String(b.tableNumber)));
  }, [allTables]);

  const handleStartTimeChange = (v) => {
    setStartTime(v);
    setEndTime(defaultEnd(v));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tableId) return toast.error("Please select a table");
    if (!guests || guests < 1) return toast.error("Guests must be at least 1");
    if (!startTime || !endTime) return toast.error("Please choose a time slot");

    toast.success("Walk-in booking created (mock)");

    setCustomerName("");
    setPhone("");
    setGuests(2);
    setStartTime("19:00");
    setEndTime(defaultEnd("19:00"));
  };

  return (
    <div className="p-4 lg:p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Walk-in Booking</h1>
            <p className="text-muted-foreground">Create a quick booking for guests without the app</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/staff/live-tables")}>
            Back to live tables
          </Button>
        </div>

        <Card className="shadow-card max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Create booking
            </CardTitle>
            <CardDescription>Fast, waiter-friendly form</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Table</Label>
                  <Select value={tableId} onValueChange={setTableId}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tableOptions.map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.tableNumber} • {t.capacity} seats • {t.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Guests</Label>
                  <Input
                    className="h-11"
                    type="number"
                    min={1}
                    max={20}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start time</Label>
                  <Select value={startTime} onValueChange={handleStartTimeChange}>
                    <SelectTrigger className="h-11">
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
                <div className="space-y-2">
                  <Label>End time</Label>
                  <Input className="h-11 font-mono text-sm" value={endTime} readOnly />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Customer name (optional)</Label>
                  <Input className="h-11" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g., John" />
                </div>
                <div className="space-y-2">
                  <Label>Phone (optional)</Label>
                  <Input className="h-11" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +1 555 010 1234" />
                </div>
              </div>

              <Button type="submit" className="h-11 w-full">
                Create Booking
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

