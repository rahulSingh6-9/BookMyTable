import { Star, CheckCircle, MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function RestaurantReviews({ restaurant }) {
  const avgRating = restaurant.averageRating || 0;
  const total = restaurant.totalReviews || 0;
  
  // Dummy distribution for UI purposes since it's not strictly supplied by API
  const distribution = [
    { stars: 5, pct: total > 0 ? 70 : 0 },
    { stars: 4, pct: total > 0 ? 20 : 0 },
    { stars: 3, pct: total > 0 ? 5 : 0 },
    { stars: 2, pct: total > 0 ? 3 : 0 },
    { stars: 1, pct: total > 0 ? 2 : 0 },
  ];

  const reviews = restaurant.reviews || []; // Future proofing

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Star className="h-5 w-5 text-primary fill-primary" /> 
        Guest Reviews
      </h2>
      
      {/* Aggregate Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-card p-6 rounded-xl border border-border">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-5xl font-black text-foreground mb-2">
            {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
          </div>
          <div className="flex items-center text-yellow-400 mb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={`h-5 w-5 ${i <= Math.round(avgRating) ? "fill-current" : "text-muted fill-muted"}`} />
            ))}
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            Based on {total} ratings
          </div>
        </div>
        
        <div className="md:col-span-2 space-y-3 border-l-0 md:border-l border-border md:pl-8">
          {distribution.map((dist) => (
            <div key={dist.stars} className="flex items-center gap-3 text-sm">
              <div className="w-12 text-muted-foreground font-medium flex items-center gap-1">
                {dist.stars} <Star className="h-3 w-3" />
              </div>
              <Progress value={dist.pct} className="h-2.5 flex-1 bg-muted" />
              <div className="w-8 text-right text-muted-foreground text-xs">{dist.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="mt-8 space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review, i) => (
            <div key={i} className="p-5 rounded-lg border border-border bg-card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {review.authorName?.[0] || "G"}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      {review.authorName || "Guest User"}
                      {review.verified && <CheckCircle className="h-3.5 w-3.5 text-green-500" title="Verified Diner" />}
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(review.date || Date.now()).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-200">
                  {review.rating || 5} <Star className="h-3 w-3 ml-1 fill-current" />
                </div>
              </div>
              <p className="text-foreground text-sm leading-relaxed">{review.text}</p>
            </div>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-muted/20">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-3" />
            <h4 className="text-muted-foreground font-medium">No written reviews yet</h4>
            <p className="text-sm text-muted-foreground mt-1">Be the first to share your dining experience.</p>
          </div>
        )}
      </div>
    </div>
  );
}
