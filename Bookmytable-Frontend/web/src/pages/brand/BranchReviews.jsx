import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  MessageSquare,
  Utensils,
  Sparkles,
  HeartHandshake,
  Users,
  Calendar,
  Clock,
  Hash,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { useBranch } from "@/context/BranchContext";
import { getBranchReviews } from "@/services/review.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BranchReviews() {
  const { branch } = useBranch();
  const [page, setPage] = useState(1);
  const [minRating, setMinRating] = useState("all");

  const branchId = branch?._id || branch?.id;

  const { data: resData, isLoading, error } = useQuery({
    queryKey: ["branch-reviews", branchId, page, minRating],
    queryFn: () =>
      getBranchReviews(branchId, {
        page,
        limit: 10,
        minRating: minRating !== "all" ? Number(minRating) : undefined,
      }),
    enabled: Boolean(branchId),
    staleTime: 30 * 1000,
  });

  const payload = resData?.data?.data;
  const reviews = payload?.reviews || [];
  const pagination = payload?.pagination;

  const avgRating = payload?.averageRating || 0;
  const total = payload?.totalReviews || 0;
  const breakdown = payload?.ratingBreakdown || { food: 0, ambience: 0, service: 0 };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            Guest Reviews & Ratings
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Monitor diner feedback, ratings, and category performance for{" "}
            <span className="font-semibold text-slate-700">{branch?.name || "your branch"}</span>.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <Select value={minRating} onValueChange={(val) => { setMinRating(val); setPage(1); }}>
            <SelectTrigger className="h-9 w-36 text-xs rounded-xl">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Ratings</SelectItem>
              <SelectItem value="4" className="text-xs">4 Stars & Above</SelectItem>
              <SelectItem value="3" className="text-xs">3 Stars & Above</SelectItem>
              <SelectItem value="2" className="text-xs">2 Stars & Above</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Overall Rating */}
        <Card className="rounded-2xl border-slate-100 shadow-sm col-span-2 sm:col-span-1 bg-gradient-to-br from-amber-50/50 to-white">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Overall Rating
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {avgRating > 0 ? Number(avgRating).toFixed(1) : "New"}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {total} verified {total === 1 ? "review" : "reviews"}
            </p>
          </CardContent>
        </Card>

        {/* Total Reviews */}
        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Reviews
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{total}</span>
            <p className="text-[10px] text-slate-500 mt-1">Verified diner reviews</p>
          </CardContent>
        </Card>

        {/* Food */}
        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Utensils className="h-3 w-3 text-amber-500" /> Food Quality
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {breakdown.food ? Number(breakdown.food).toFixed(1) : "-"}
            </span>
            <span className="text-xs text-slate-400 ml-1">/ 5</span>
          </CardContent>
        </Card>

        {/* Ambience */}
        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-500" /> Ambience
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {breakdown.ambience ? Number(breakdown.ambience).toFixed(1) : "-"}
            </span>
            <span className="text-xs text-slate-400 ml-1">/ 5</span>
          </CardContent>
        </Card>

        {/* Service */}
        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <HeartHandshake className="h-3 w-3 text-emerald-500" /> Service
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {breakdown.service ? Number(breakdown.service).toFixed(1) : "-"}
            </span>
            <span className="text-xs text-slate-400 ml-1">/ 5</span>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-50">
          <CardTitle className="text-base font-extrabold text-slate-900">
            Diner Feedback History
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Reviews left by customers who successfully checked in and dined at this branch.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-destructive">
              Failed to load branch reviews.
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4.5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-extrabold text-primary text-xs">
                        {r.user?.name?.[0] || "D"}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          {r.user?.name || "Guest Diner"}
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Verified Visit
                          </Badge>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{r.user?.email}</span>
                          {r.booking && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {r.booking.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {r.booking.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" /> {r.booking.guests} Guests
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200 self-start sm:self-auto">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 mr-1" />
                      {Number(r.overallRating).toFixed(1)} / 5
                    </div>
                  </div>

                  {/* Category Ratings */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-white px-2 py-0.5 rounded-md border text-slate-600 font-medium text-[11px]">
                      Food: <strong className="text-slate-900 font-bold">{r.ratings?.food}★</strong>
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border text-slate-600 font-medium text-[11px]">
                      Ambience: <strong className="text-slate-900 font-bold">{r.ratings?.ambience}★</strong>
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border text-slate-600 font-medium text-[11px]">
                      Service: <strong className="text-slate-900 font-bold">{r.ratings?.service}★</strong>
                    </span>
                  </div>

                  {/* Review Text */}
                  {r.review ? (
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                      "{r.review}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No written comment provided.</p>
                  )}
                </div>
              ))}

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
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <MessageSquare className="h-8 w-8 text-slate-300" />
              <h4 className="font-bold text-sm text-slate-700">No reviews found</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                {minRating !== "all"
                  ? "No reviews match the selected rating filter."
                  : "When verified diners leave reviews after check-in, they will appear here."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
