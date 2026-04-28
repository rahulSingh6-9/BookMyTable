import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trash2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ManageReviews() {
  const dummyReviews = [
    { id: 1, user: "Alice Green", restaurant: "Pasta Palace", rating: 2, comment: "Food was cold and service was very slow. Not happy.", isFlagged: true, date: "2 days ago" },
    { id: 2, user: "David Smith", restaurant: "Vegan Bites", rating: 1, comment: "Found a bug in my salad! Disgusting.", isFlagged: true, date: "3 days ago" },
    { id: 3, user: "Sarah Connor", restaurant: "Steakhouse 99", rating: 5, comment: "Best steak I have ever had! Highly recommend.", isFlagged: false, date: "1 week ago" },
  ];

  const renderReviewList = (reviews) => {
    return (
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl bg-card">
            No reviews found.
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="rounded-2xl border-border/40 shadow-sm overflow-hidden bg-card">
              <CardContent className="p-5 md:p-6 flex flex-col md:flex-row gap-6">
                <div className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-border/40 pb-4 md:pb-0 md:pr-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${review.user.replace(' ', '+')}&background=random`} />
                      <AvatarFallback>{review.user.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{review.user}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-1">Reviewed Restaurant</p>
                    <p className="text-sm font-medium">{review.restaurant}</p>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} 
                        />
                      ))}
                    </div>
                    {review.isFlagged && <Badge variant="destructive">Flagged</Badge>}
                  </div>
                  <p className="text-foreground text-sm md:text-base mb-6 leading-relaxed">"{review.comment}"</p>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    {review.isFlagged && (
                      <Button variant="outline" className="rounded-full border-border/50 h-9">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Dismiss Flag
                      </Button>
                    )}
                    <Button variant="destructive" className="rounded-full h-9">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animation-fade-in">
      <PageHeader 
        title="Reviews Moderation" 
        description="Moderate user reviews and handle flagged content to maintain quality." 
      />

      <Tabs defaultValue="flagged" className="w-full">
        <TabsList className="mb-6 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="flagged" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Flagged Reviews</TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">All Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="flagged" className="focus-visible:outline-none focus-visible:ring-0">
          {renderReviewList(dummyReviews.filter(r => r.isFlagged))}
        </TabsContent>
        <TabsContent value="all" className="focus-visible:outline-none focus-visible:ring-0">
          {renderReviewList(dummyReviews)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
