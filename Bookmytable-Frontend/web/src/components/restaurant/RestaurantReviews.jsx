import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, CheckCircle, MessageSquare, Loader2, Utensils, Sparkles, HeartHandshake, ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRestaurantReviews } from "@/services/review.service";

export function RestaurantReviews({ restaurant }) {
  const [page, setPage] = useState(1);
  const restaurantParam = restaurant?.slug || restaurant?._id || restaurant?.id || restaurant?.restaurantId;

  const { data: resData, isLoading, error } = useQuery({
    queryKey: ["restaurant-reviews", restaurantParam, page],
    queryFn: () => getRestaurantReviews(restaurantParam, { page, limit: 6 }),
    enabled: Boolean(restaurantParam),
    staleTime: 30 * 1000,
  });

  const reviewPayload = resData?.data?.data;
  const reviews = reviewPayload?.reviews || [];
  const pagination = reviewPayload?.pagination;

  const avgRating = reviewPayload?.averageRating ?? restaurant?.averageRating ?? 0;
  const total = reviewPayload?.totalReviews ?? restaurant?.totalReviews ?? 0;
  const breakdown = reviewPayload?.ratingBreakdown || restaurant?.ratingBreakdown || { food: 0, ambience: 0, service: 0 };

  // Calculate dynamic distribution from reviews if available, or proportioned
  const totalReviewsCount = Math.max(total, reviews.length);
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    if (totalReviewsCount === 0) return { stars, count: 0, pct: 0 };
    const matching = reviews.filter((r) => Math.round(r.overallRating) === stars).length;
    const pct = reviews.length > 0 ? Math.round((matching / reviews.length) * 100) : 0;
    return { stars, count: matching, pct };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> 
          Verified Diner Reviews
        </h2>
        {total > 0 && (
          <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
            {total} {total === 1 ? "Review" : "Reviews"}
          </Badge>
        )}
      </div>
      
      {/* Aggregate Rating Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-card p-6 rounded-2xl border border-border shadow-sm">
        {/* Left: Overall Big Score */}
        <div className="flex flex-col items-center justify-center text-center p-2">
          <div className="text-5xl font-black text-foreground mb-1.5 font-mono">
            {avgRating > 0 ? Number(avgRating).toFixed(1) : "New"}
          </div>
          <div className="flex items-center text-amber-400 mb-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i <= Math.round(avgRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted fill-transparent"
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {total > 0 ? `Based on ${total} verified guest ${total === 1 ? "review" : "reviews"}` : "No reviews yet"}
          </div>
        </div>
        
        {/* Middle: Category Breakdown (Food, Ambience, Service) */}
        <div className="flex flex-col justify-center space-y-3.5 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Rating Breakdown
          </span>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <Utensils className="h-3.5 w-3.5 text-amber-500" /> Food Quality
              </span>
              <span className="font-bold font-mono text-amber-600">
                {breakdown.food ? Number(breakdown.food).toFixed(1) : "-"} / 5
              </span>
            </div>
            <Progress value={(Number(breakdown.food || 0) / 5) * 100} className="h-2 bg-muted" />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Ambience
              </span>
              <span className="font-bold font-mono text-indigo-600">
                {breakdown.ambience ? Number(breakdown.ambience).toFixed(1) : "-"} / 5
              </span>
            </div>
            <Progress value={(Number(breakdown.ambience || 0) / 5) * 100} className="h-2 bg-muted" />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <HeartHandshake className="h-3.5 w-3.5 text-emerald-500" /> Service
              </span>
              <span className="font-bold font-mono text-emerald-600">
                {breakdown.service ? Number(breakdown.service).toFixed(1) : "-"} / 5
              </span>
            </div>
            <Progress value={(Number(breakdown.service || 0) / 5) * 100} className="h-2 bg-muted" />
          </div>
        </div>

        {/* Right: Star Distribution Bars */}
        <div className="flex flex-col justify-center space-y-2 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Distribution
          </span>
          {distribution.map((dist) => (
            <div key={dist.stars} className="flex items-center gap-2 text-xs">
              <div className="w-10 text-muted-foreground font-medium flex items-center gap-1 text-[11px]">
                {dist.stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </div>
              <Progress value={dist.pct} className="h-2 flex-1 bg-muted" />
              <div className="w-8 text-right text-muted-foreground text-[10px] font-mono">{dist.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-destructive">
            Failed to load reviews. Please refresh.
          </div>
        ) : reviews.length > 0 ? (
          <>
            <div className="space-y-3.5">
              {reviews.map((r) => (
                <div key={r._id} className="p-4 sm:p-5 rounded-2xl border border-border bg-card hover:border-border/80 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-extrabold text-primary text-xs">
                        {r.userDisplayName?.[0] || "D"}
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                          {r.userDisplayName}
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" title="Verified Diner Visit" />
                          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 hidden sm:inline">
                            Verified Diner
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : ""}
                        </div>
                      </div>
                    </div>

                    {/* Overall Rating Badge */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="flex items-center bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200/80">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 mr-1" />
                        {Number(r.overallRating).toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown Chips */}
                  {r.ratings && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                        Food: <strong className="text-slate-800">{r.ratings.food}★</strong>
                      </span>
                      <span className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                        Ambience: <strong className="text-slate-800">{r.ratings.ambience}★</strong>
                      </span>
                      <span className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                        Service: <strong className="text-slate-800">{r.ratings.service}★</strong>
                      </span>
                    </div>
                  )}

                  {/* Optional Review Text */}
                  {r.review ? (
                    <p className="text-foreground text-xs sm:text-sm leading-relaxed">{r.review}</p>
                  ) : (
                    <p className="text-muted-foreground italic text-xs">No written comments provided.</p>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl text-xs gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-xs text-muted-foreground font-mono">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl text-xs gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-muted/20 text-center p-6 space-y-2">
            <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
            <h4 className="text-muted-foreground font-bold text-sm">No written reviews yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              Be the first to share your dining experience after your verified reservation check-in!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
