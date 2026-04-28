import { BadgeCheck, Ban, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const statusBadge = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-500/30",
  reserved: "bg-amber-50 text-amber-700 border-amber-500/30",
  occupied: "bg-destructive/5 text-destructive border-destructive/20",
};

export function TableActionPanel({
  table,
  status,
  bookingInfo,
  onCheckIn,
  onComplete,
  onAssignWalkIn,
}) {
  if (!table) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            Tap a table to see actions.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base flex items-center justify-between gap-3">
          <span>{table.tableNumber}</span>
          <Badge variant="outline" className={`capitalize ${statusBadge[status] || ""}`}>
            {status}
          </Badge>
        </CardTitle>
        <div className="text-sm text-muted-foreground">{table.capacity} seats • {table.type}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "reserved" && bookingInfo ? (
          <>
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
              <div className="font-medium text-foreground mb-2">Reservation</div>
              <div className="grid gap-1.5 text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span>Customer</span>
                  <span className="font-medium text-foreground">{bookingInfo.customerName}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Time</span>
                  <span className="font-mono text-xs text-foreground">{bookingInfo.time}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Guests</span>
                  <span className="font-medium text-foreground">{bookingInfo.guests}</span>
                </div>
              </div>
            </div>
            <Button className="w-full h-11 gap-2" onClick={onCheckIn}>
              <BadgeCheck className="h-4 w-4" /> Check-in
            </Button>
          </>
        ) : null}

        {status === "occupied" ? (
          <Button
            variant="outline"
            className="w-full h-11 gap-2 hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
            onClick={onComplete}
          >
            <Ban className="h-4 w-4" /> Mark as completed
          </Button>
        ) : null}

        {status === "available" ? (
          <Button className="w-full h-11 gap-2" onClick={onAssignWalkIn}>
            <UserPlus className="h-4 w-4" /> Assign walk-in
          </Button>
        ) : null}

        <Separator />
        <div className="text-xs text-muted-foreground">
          Live updates: ready to wire to sockets later.
        </div>
      </CardContent>
    </Card>
  );
}

