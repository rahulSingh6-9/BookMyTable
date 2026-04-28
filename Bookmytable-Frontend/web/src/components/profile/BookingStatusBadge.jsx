import { Badge } from "@/components/ui/badge";

const statusStyles = {
  confirmed: "bg-accent/10 text-accent border-accent/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-muted text-muted-foreground border-border",
};

export function BookingStatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();
  return (
    <Badge variant="outline" className={statusStyles[normalized] || ""}>
      {normalized || "unknown"}
    </Badge>
  );
}

