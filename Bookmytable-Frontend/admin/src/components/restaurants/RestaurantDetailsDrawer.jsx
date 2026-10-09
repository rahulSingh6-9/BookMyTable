import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Store,
  MapPin,
  Settings,
  BarChart3,
  Users,
  CheckCircle,
  Ban,
  XCircle,
  Clock,
  Phone,
  AlertTriangle,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";

import {
  getRestaurantDetails,
  getRestaurantMetrics,
  approveRestaurant,
  suspendRestaurant,
  rejectRestaurant,
} from "@/services/restaurant.service";

const ProfileSection = ({ restaurant }) => (
  <div className="space-y-4">
    {restaurant?.coverImage && (
      <div className="h-32 w-full rounded-xl overflow-hidden relative">
        <img src={restaurant.coverImage} alt="Cover" className="w-full h-full object-cover" />
      </div>
    )}
    <div className={`flex items-end gap-4 ${restaurant?.coverImage ? '-mt-12 relative z-10 px-4' : ''}`}>
      <Avatar className="h-24 w-24 rounded-xl border-4 border-background shadow-md bg-card">
        <AvatarImage src={restaurant?.logo} className="object-cover" />
        <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-2xl font-bold">
          {restaurant?.branchName?.charAt(0) || "R"}
        </AvatarFallback>
      </Avatar>
      <div className="mb-1">
        <h3 className="text-xl font-bold">{restaurant?.branchName || "Unknown Restaurant"}</h3>
        <p className="text-sm text-muted-foreground">{restaurant?.brandId?.name || "Independent"}</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground mb-1">Status</p>
        <Badge variant={restaurant?.status === "approved" ? "success" : restaurant?.status === "suspended" ? "destructive" : "secondary"}>
          {restaurant?.status || "Pending"}
        </Badge>
      </div>
      <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground mb-1">Cuisine</p>
        <div className="flex gap-1 flex-wrap mt-1">
          {restaurant?.cuisineTypes?.length > 0 ? (
            restaurant.cuisineTypes.slice(0, 2).map((c, i) => <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>)
          ) : "N/A"}
        </div>
      </div>
      <div className="bg-muted/30 p-3 rounded-lg border border-border/50 col-span-2">
        <p className="text-xs text-muted-foreground mb-1">Description</p>
        <p className="text-sm">{restaurant?.description || "No description provided."}</p>
      </div>
    </div>
  </div>
);

const LocationSection = ({ restaurant }) => {
  const address = restaurant?.address;
  const city = restaurant?.city || (typeof address === "object" ? address?.city : null);

  const phone =
    restaurant?.contactInfo?.phone?.e164 ||
    (restaurant?.contactInfo?.phone?.number
      ? `${restaurant.contactInfo.phone.countryCode || ""} ${restaurant.contactInfo.phone.number}`.trim()
      : null) ||
    (typeof restaurant?.phone === "string" ? restaurant.phone : null) ||
    restaurant?.ownerId?.phone ||
    null;

  const email =
    restaurant?.contactInfo?.email ||
    restaurant?.email ||
    restaurant?.ownerId?.email ||
    null;

  const isPhoneVerified = restaurant?.contactInfo?.isPhoneVerified ?? restaurant?.phoneVerified;
  const isEmailVerified = restaurant?.contactInfo?.isEmailVerified ?? restaurant?.emailVerified;

  const renderAddress = () => {
    if (!address) {
      return <span>{city || "No Address Provided"}</span>;
    }
    if (typeof address === "string") {
      return (
        <div className="space-y-0.5">
          <p>{address}</p>
          {city && city !== address && <p className="text-xs text-muted-foreground">{city}</p>}
        </div>
      );
    }
    if (typeof address === "object") {
      const { addressLine1, addressLine2, landmark, state, postalCode, country } = address;
      const addrCity = address.city || city;
      const cityStateZip = [addrCity, state, postalCode].filter(Boolean).join(", ");

      const hasAnyDetail = addressLine1 || addressLine2 || landmark || cityStateZip || country;
      if (!hasAnyDetail) {
        return <span>No Address Provided</span>;
      }

      return (
        <div className="space-y-0.5">
          {addressLine1 && <p>{addressLine1}</p>}
          {addressLine2 && <p className="text-xs text-muted-foreground">{addressLine2}</p>}
          {landmark && <p className="text-xs text-muted-foreground">Near {landmark}</p>}
          {cityStateZip && <p className="text-xs text-muted-foreground">{cityStateZip}</p>}
          {country && <p className="text-xs text-muted-foreground">{country}</p>}
        </div>
      );
    }
    return <span>No Address Provided</span>;
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" /> Location & Contact
      </h4>
      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
        <div className="flex justify-between items-start gap-4">
          <span className="text-xs text-muted-foreground w-20 shrink-0">Address</span>
          <div className="text-sm font-medium text-right">
            {renderAddress()}
          </div>
        </div>
        <Separator />
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs text-muted-foreground">Phone</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{phone || "N/A"}</span>
            {phone && (
              <Badge variant={isPhoneVerified ? "success" : "secondary"} className="text-[10px] py-0 px-1.5 h-4">
                {isPhoneVerified ? "Verified" : "Unverified"}
              </Badge>
            )}
          </div>
        </div>
        <Separator />
        <div className="flex justify-between items-center gap-4">
          <span className="text-xs text-muted-foreground">Email</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{email || "N/A"}</span>
            {email && (
              <Badge variant={isEmailVerified ? "success" : "secondary"} className="text-[10px] py-0 px-1.5 h-4">
                {isEmailVerified ? "Verified" : "Unverified"}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricsSection = ({ id }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-restaurant-metrics", id],
    queryFn: () => getRestaurantMetrics(id),
    enabled: !!id,
  });

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;
  const metrics = data?.data?.data || data?.data || data || {};

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" /> Business Metrics
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Total Bookings</p>
          <p className="text-2xl font-bold text-primary mt-1">{metrics.bookingsCount || 0}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
          <p className="text-xs text-amber-600/70 uppercase font-semibold">Average Rating</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{metrics.averageRating?.toFixed(1) || "N/A"} ⭐</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <p className="text-xs text-emerald-600/70 uppercase font-semibold">Total Reviews</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics.reviewsCount || 0}</p>
        </div>
      </div>
    </div>
  );
};

const OperationsSection = ({ restaurant }) => {
  const tablesTotal = restaurant?.tablesCount || 0;
  const staffTotal = restaurant?.staffCount || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center">
          <Users className="w-6 h-6 text-primary mb-2" />
          <span className="text-2xl font-bold">{staffTotal}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Staff Members</span>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center">
          <Store className="w-6 h-6 text-primary mb-2" />
          <span className="text-2xl font-bold">{tablesTotal}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Tables</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" /> Settings
        </h4>
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Bookings Enabled</span>
            <Badge variant={restaurant?.bookingsEnabled ? "success" : "secondary"}>
              {restaurant?.bookingsEnabled ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Auto Approve Bookings</span>
            <Badge variant={restaurant?.autoApproveBookings ? "success" : "secondary"}>
              {restaurant?.autoApproveBookings ? "Yes" : "No"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

const VerificationSection = ({ restaurant }) => {
  const isPhoneVerified = restaurant?.contactInfo?.isPhoneVerified ?? restaurant?.phoneVerified;
  const isEmailVerified = restaurant?.contactInfo?.isEmailVerified ?? restaurant?.emailVerified;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-primary" /> Verification Status
      </h4>
      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Phone Verification</span>
          {isPhoneVerified ? (
            <Badge variant="success" className="flex items-center gap-1"><Check className="w-3 h-3"/> Verified</Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1"><X className="w-3 h-3"/> Not Verified</Badge>
          )}
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Email Verification</span>
          {isEmailVerified ? (
            <Badge variant="success" className="flex items-center gap-1"><Check className="w-3 h-3"/> Verified</Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1"><X className="w-3 h-3"/> Not Verified</Badge>
          )}
        </div>
      <Separator />
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Business Approval</span>
        <Badge variant={
          restaurant?.status === "approved" ? "success" : 
          restaurant?.status === "suspended" || restaurant?.status === "rejected" ? "destructive" : 
          "secondary"
        }>
          {restaurant?.status ? restaurant.status.charAt(0).toUpperCase() + restaurant.status.slice(1) : "Pending"}
        </Badge>
      </div>
      
      {restaurant?.approvedAt && (
        <>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Approved On</span>
            <span className="text-sm font-medium">{new Date(restaurant.approvedAt).toLocaleDateString()}</span>
          </div>
        </>
      )}

      {restaurant?.rejectedAt && (
        <>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Rejected On</span>
            <span className="text-sm font-medium text-destructive">{new Date(restaurant.rejectedAt).toLocaleDateString()}</span>
          </div>
        </>
      )}

      {restaurant?.suspendedAt && (
        <>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Suspended On</span>
            <span className="text-sm font-medium text-destructive">{new Date(restaurant.suspendedAt).toLocaleDateString()}</span>
          </div>
        </>
      )}
    </div>
  </div>
  );
};

export function RestaurantDetailsDrawer({ restaurantId, open, onOpenChange }) {
  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["admin-restaurant-details", restaurantId],
    queryFn: () => getRestaurantDetails(restaurantId),
    enabled: !!restaurantId && open,
  });

  const restaurant = response?.data?.data || response?.data || response;

  const approveMutation = useMutation({
    mutationFn: () => approveRestaurant(restaurantId),
    onSuccess: () => {
      toast.success("Restaurant approved");
      queryClient.invalidateQueries(["admin-restaurant-details", restaurantId]);
      queryClient.invalidateQueries(["admin-restaurants"]);
    },
    onError: (err) => toast.error(`Approval failed: ${err.message}`)
  });

  const suspendMutation = useMutation({
    mutationFn: () => suspendRestaurant(restaurantId),
    onSuccess: () => {
      toast.success("Restaurant suspended");
      queryClient.invalidateQueries(["admin-restaurant-details", restaurantId]);
      queryClient.invalidateQueries(["admin-restaurants"]);
    },
    onError: (err) => toast.error(`Suspension failed: ${err.message}`)
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectRestaurant(restaurantId),
    onSuccess: () => {
      toast.success("Restaurant rejected");
      queryClient.invalidateQueries(["admin-restaurant-details", restaurantId]);
      queryClient.invalidateQueries(["admin-restaurants"]);
    },
    onError: (err) => toast.error(`Rejection failed: ${err.message}`)
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-background border-l shadow-2xl">
        <SheetHeader className="p-6 border-b bg-card z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">Restaurant Details</SheetTitle>
              <SheetDescription className="text-xs mt-1">
                Manage location, operations, and business status.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="p-6 space-y-8">
              <Skeleton className="h-32 w-full rounded-xl" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ) : error?.response?.data?.error === "RESYNC_REQUIRED" ? (
            <div className="p-6 text-center mt-20 space-y-4">
              <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-amber-600">Resync Required</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                The local read model for this restaurant is missing or stale. This might be due to a Kafka synchronization delay or a missing event. Please wait or trigger a manual resync.
              </p>
            </div>
          ) : !restaurant ? (
            <div className="p-6 text-center text-muted-foreground mt-20">
              Failed to load restaurant data.
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6 pb-24 space-y-8">
                <ProfileSection restaurant={restaurant} />
                <Separator />
                
                <Tabs defaultValue="location" className="w-full">
                  <TabsList className="w-full grid grid-cols-4 bg-muted/50 p-1 rounded-xl h-auto">
                    <TabsTrigger value="location" className="rounded-lg py-2 text-xs font-medium">Location</TabsTrigger>
                    <TabsTrigger value="operations" className="rounded-lg py-2 text-xs font-medium">Operations</TabsTrigger>
                    <TabsTrigger value="metrics" className="rounded-lg py-2 text-xs font-medium">Metrics</TabsTrigger>
                    <TabsTrigger value="verification" className="rounded-lg py-2 text-xs font-medium">Verification</TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-6">
                    <TabsContent value="location" className="animate-in fade-in-50 zoom-in-95 duration-200">
                      <LocationSection restaurant={restaurant} />
                    </TabsContent>

                    <TabsContent value="operations" className="animate-in fade-in-50 zoom-in-95 duration-200">
                      <OperationsSection restaurant={restaurant} />
                    </TabsContent>

                    <TabsContent value="metrics" className="animate-in fade-in-50 zoom-in-95 duration-200">
                      <MetricsSection id={restaurantId} />
                    </TabsContent>

                    <TabsContent value="verification" className="animate-in fade-in-50 zoom-in-95 duration-200">
                      <VerificationSection restaurant={restaurant} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </ScrollArea>
          )}
        </div>

        {restaurant && (
          <div className="border-t bg-card/50 backdrop-blur-md p-4 flex gap-3 z-10 sticky bottom-0 items-center justify-between">
            {restaurant.status === "pending" ? (
              <>
                <Button 
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending}
                  className="flex-1 h-11 shadow-lg shadow-destructive/20"
                >
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
              </>
            ) : (
              <Button 
                variant={restaurant.status === "suspended" ? "outline" : "destructive"}
                onClick={() => restaurant.status === "suspended" ? null : suspendMutation.mutate()}
                disabled={suspendMutation.isPending || restaurant.status === "suspended"}
                className={`flex-1 h-11 shadow-lg ${restaurant.status === "suspended" ? 'opacity-50 cursor-not-allowed' : 'shadow-destructive/20'}`}
              >
                <Ban className="w-4 h-4 mr-2" />
                {restaurant.status === "suspended" ? "Suspended" : "Suspend Restaurant"}
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
