import { Clock } from "lucide-react";

const activities = [
  { id: 1, text: "New booking by Alice Johnson for Table 2", time: "2 min ago" },
  { id: 2, text: "Bob Smith cancelled reservation B002", time: "15 min ago" },
  { id: 3, text: "New review: 5 stars from Carol White", time: "1 hour ago" },
  { id: 4, text: "Table 5 availability updated", time: "2 hours ago" },
  { id: 5, text: "Menu item 'Wagyu Nigiri' price updated", time: "3 hours ago" },
];

export function ActivityFeed() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card">
      <h3 className="mb-4 text-sm font-semibold text-card-foreground">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((a) => (
          <div key={a.id} className="flex gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground">{a.text}</p>
              <p className="text-xs text-muted-foreground">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
