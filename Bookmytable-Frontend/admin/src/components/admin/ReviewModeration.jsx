import { Star, Flag, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockReviews = [
  { id: "RV1", user: "Alice J.", restaurant: "Sakura Omakase", rating: 5, text: "Incredible experience! Best omakase in the city.", flagged: false },
  { id: "RV2", user: "Bob S.", restaurant: "Trattoria Bella", rating: 1, text: "This place is terrible, worst food ever!!!", flagged: true },
  { id: "RV3", user: "Carol W.", restaurant: "The Capital Grill", rating: 4, text: "Great steak, excellent service. A bit pricey but worth it.", flagged: false },
  { id: "RV4", user: "Dave B.", restaurant: "Sky Lounge", rating: 2, text: "Spam review with links to external sites...", flagged: true },
];

export function ReviewModeration({ reviews = mockReviews }) {
  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className={`rounded-lg border p-4 ${r.flagged ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">{r.user}</span>
                <span className="text-xs text-muted-foreground">on {r.restaurant}</span>
                {r.flagged && <Badge variant="destructive" className="text-xs"><Flag className="mr-1 h-3 w-3" />Flagged</Badge>}
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-primary text-primary" : "text-muted-foreground/20"}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{r.text}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-accent"><Check className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
