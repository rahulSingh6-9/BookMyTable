import { useState, useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, Sparkles, Loader2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { submitReview, updateReview, deleteReview } from "@/services/review.service";

const RATING_CATEGORIES = [
  { key: "food", label: "Food Quality", description: "Taste, freshness & presentation" },
  { key: "ambience", label: "Ambience", description: "Decor, seating comfort & music" },
  { key: "service", label: "Service", description: "Staff courtesy, speed & attentiveness" },
];

export function BookingReviewModal({ booking, existingReview, isOpen, onClose }) {
  const queryClient = useQueryClient();

  const isEditing = Boolean(existingReview && existingReview._id);

  // Ratings for the 3 mandatory categories
  const [ratings, setRatings] = useState({
    food: 0,
    ambience: 0,
    service: 0,
  });

  const [reviewText, setReviewText] = useState("");
  const [validationError, setValidationError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Initialize ratings and text from existing review if editing
  useEffect(() => {
    if (existingReview) {
      setRatings({
        food: existingReview.ratings?.food || 0,
        ambience: existingReview.ratings?.ambience || 0,
        service: existingReview.ratings?.service || 0,
      });
      setReviewText(existingReview.review || "");
    } else {
      setRatings({ food: 0, ambience: 0, service: 0 });
      setReviewText("");
    }
    setValidationError("");
    setConfirmDelete(false);
  }, [existingReview, isOpen]);

  // Live computed overall rating: (food + ambience + service) / 3
  const overallRating = useMemo(() => {
    const { food, ambience, service } = ratings;
    if (!food || !ambience || !service) return null;
    return ((food + ambience + service) / 3).toFixed(2);
  }, [ratings]);

  const setCategoryRating = (catKey, value) => {
    setRatings((prev) => ({ ...prev, [catKey]: value }));
    setValidationError("");
  };

  const invalidateAllRatingQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
    queryClient.invalidateQueries({ queryKey: ["restaurant-details"] });
    queryClient.invalidateQueries({ queryKey: ["restaurant-reviews"] });
    queryClient.invalidateQueries({ queryKey: ["discovery-sections"] });
    queryClient.invalidateQueries({ queryKey: ["nearby-restaurants"] });
    queryClient.invalidateQueries({ queryKey: ["search-restaurants"] });
    queryClient.invalidateQueries({ queryKey: ["customer-favorites"] });
    queryClient.invalidateQueries({ queryKey: ["booking-review", booking?._id] });
  };

  // Submit Mutation
  const createMutation = useMutation({
    mutationFn: (payload) => submitReview(payload),
    onSuccess: () => {
      toast.success("Thank you for your rating! Your review has been submitted.");
      invalidateAllRatingQueries();
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to submit review.";
      setValidationError(msg);
      toast.error(msg);
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload) => updateReview(existingReview._id, payload),
    onSuccess: () => {
      toast.success("Your review has been updated successfully.");
      invalidateAllRatingQueries();
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to update review.";
      setValidationError(msg);
      toast.error(msg);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteReview(existingReview._id),
    onSuccess: () => {
      toast.success("Your review has been deleted.");
      invalidateAllRatingQueries();
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || "Failed to delete review.";
      toast.error(msg);
    },
  });

  const handleSubmit = () => {
    // Validate all 3 categories
    if (!ratings.food || !ratings.ambience || !ratings.service) {
      setValidationError("Please provide star ratings for all 3 categories (Food, Ambience, Service).");
      return;
    }

    if (isEditing) {
      updateMutation.mutate({
        ratings,
        review: reviewText,
      });
    } else {
      createMutation.mutate({
        bookingId: booking._id,
        ratings,
        review: reviewText,
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const restaurantName = booking?.restaurantId?.name || "the restaurant";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-md bg-white p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-slate-950 font-extrabold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
              {isEditing ? "Edit Your Review" : "Rate Your Dining Experience"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 text-xs">
            Share verified feedback for your visit at <span className="font-semibold text-slate-700">{restaurantName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* THREE MANDATORY CATEGORIES */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {RATING_CATEGORIES.map((cat) => {
              const currentScore = ratings[cat.key];
              return (
                <div key={cat.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      {cat.label}
                      <span className="text-rose-500">*</span>
                    </span>
                    <p className="text-[10px] text-slate-400">{cat.description}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        disabled={isSubmitting}
                        onClick={() => setCategoryRating(cat.key, star)}
                        className="p-1 hover:scale-110 active:scale-95 transition"
                        title={`${star} Star`}
                      >
                        <Star
                          className={`h-5 w-5 transition ${
                            star <= currentScore
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200 fill-transparent hover:text-amber-200"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono font-bold text-slate-600 w-5 text-right ml-1">
                      {currentScore > 0 ? currentScore : "-"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* OVERALL RATING PREVIEW */}
          <div className="flex items-center justify-between bg-primary/5 border border-primary/15 rounded-xl p-3">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Calculated Overall Rating</span>
              <span className="text-[10px] text-slate-500">Average of all 3 mandatory categories</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-extrabold text-base text-slate-900 font-mono">
                {overallRating ? `${overallRating} / 5.0` : "Select stars"}
              </span>
            </div>
          </div>

          {/* OPTIONAL WRITTEN REVIEW */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">
                Comments & Detailed Feedback <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {reviewText.length}/2000
              </span>
            </div>
            <Textarea
              placeholder="What stood out about the dishes, presentation, atmosphere, or table service?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              maxLength={2000}
              className="min-h-24 text-xs resize-none rounded-xl"
              disabled={isSubmitting}
            />
          </div>

          {/* VALIDATION ERROR ALERT */}
          {validationError && (
            <Alert variant="destructive" className="py-2 text-xs rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* CONFIRM DELETE WARNING */}
          {confirmDelete && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <p className="text-xs text-red-700 font-medium">
                Are you sure you want to delete your review? This will remove your rating contribution.
              </p>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
                  className="rounded-lg"
                >
                  {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Confirm Delete
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-center pt-2">
          {isEditing && !confirmDelete ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setConfirmDelete(true)}
              className="rounded-xl text-destructive hover:!text-destructive hover:bg-destructive/15 border-destructive/30 hover:border-destructive/50 text-xs w-full sm:w-auto transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete Review
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl text-xs"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting || !overallRating}
              className="bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10"
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Review"
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
