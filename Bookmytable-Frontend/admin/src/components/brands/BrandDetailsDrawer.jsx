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
  Briefcase,
  Store,
  BarChart3,
  User,
  Settings2,
  CheckCircle,
  Ban,
  Clock,
} from "lucide-react";

import {
  getBrandDetails,
  getBrandRestaurants,
  getBrandMetrics,
  approveBrand,
  suspendBrand,
} from "@/services/brand.service";

const BasicInfoSection = ({ brand }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16 rounded-xl border border-border/50">
        <AvatarImage src={brand?.logo} />
        <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xl font-bold">
          {brand?.name?.charAt(0) || "B"}
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 className="text-lg font-bold">{brand?.name || "Unknown Brand"}</h3>
        <p className="text-sm text-muted-foreground font-mono">ID: {brand?._id}</p>
        <p className="text-xs text-muted-foreground">Slug: {brand?.slug || "N/A"}</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground mb-1">Status</p>
        <Badge variant={brand?.status === "approved" ? "success" : brand?.status === "suspended" ? "destructive" : "secondary"}>
          {brand?.status || "Pending"}
        </Badge>
      </div>
      <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground mb-1">Created Date</p>
        <p className="text-sm font-medium">{brand?.createdAt ? new Date(brand.createdAt).toLocaleDateString() : "N/A"}</p>
      </div>
      <div className="bg-muted/30 p-3 rounded-lg border border-border/50 col-span-2">
        <p className="text-xs text-muted-foreground mb-1">Description</p>
        <p className="text-sm">{brand?.description || "No description provided."}</p>
      </div>
    </div>
  </div>
);

const MetricsSection = ({ id }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-brand-metrics", id],
    queryFn: () => getBrandMetrics(id),
    enabled: !!id,
  });

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;
  const metrics = data?.data || data || {};

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" /> Brand Metrics
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Total Restaurants</p>
          <p className="text-2xl font-bold text-primary mt-1">{metrics.totalRestaurants || 0}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <p className="text-xs text-emerald-600/70 uppercase font-semibold">Approved</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics.approvedRestaurants || 0}</p>
        </div>
        <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
          <p className="text-xs text-rose-600/70 uppercase font-semibold">Suspended</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{metrics.suspendedRestaurants || 0}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
          <p className="text-xs text-amber-600/70 uppercase font-semibold">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{metrics.pendingRestaurants || 0}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 flex justify-between items-center">
          <span className="text-sm font-medium">Total Staff</span>
          <span className="font-bold">{metrics.totalStaff || 0}</span>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 flex justify-between items-center">
          <span className="text-sm font-medium">Total Bookings</span>
          <span className="font-bold">{metrics.totalBookings || 0}</span>
        </div>
      </div>
    </div>
  );
};

const OwnerSection = ({ brand }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-semibold flex items-center gap-2">
      <User className="w-4 h-4 text-primary" /> Owner Information
    </h4>
    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Owner ID</span>
        <span className="text-xs font-mono">{brand?.ownerId || "N/A"}</span>
      </div>
      <Separator />
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Verification Status</span>
        <Badge variant={brand?.isVerified ? "success" : "secondary"}>
          {brand?.isVerified ? "Verified" : "Unverified"}
        </Badge>
      </div>
    </div>
  </div>
);

const RestaurantsSection = ({ id }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-brand-restaurants", id],
    queryFn: () => getBrandRestaurants(id),
    enabled: !!id,
  });

  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;
  const restaurants = data?.data || data || [];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Store className="w-4 h-4 text-primary" /> Restaurant Locations
      </h4>
      {restaurants.length === 0 ? (
        <p className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-xl text-center border border-dashed">
          No restaurants under this brand.
        </p>
      ) : (
        <div className="space-y-3">
          {restaurants.map((r, idx) => (
            <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border/50 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{r.address?.street || "No address"}</p>
              </div>
              <Badge variant={r.status === 'approved' ? 'success' : 'secondary'}>{r.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function BrandDetailsDrawer({ brandId, open, onOpenChange }) {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-brand-details", brandId],
    queryFn: () => getBrandDetails(brandId),
    enabled: !!brandId && open,
  });

  const brand = response?.data || response;

  const approveMutation = useMutation({
    mutationFn: () => approveBrand(brandId),
    onSuccess: () => {
      toast.success("Brand approved successfully");
      queryClient.invalidateQueries(["admin-brand-details", brandId]);
      queryClient.invalidateQueries(["admin-brands"]);
    },
    onError: (err) => toast.error(`Failed to approve: ${err.message}`)
  });

  const suspendMutation = useMutation({
    mutationFn: () => suspendBrand(brandId),
    onSuccess: () => {
      toast.success("Brand suspended successfully");
      queryClient.invalidateQueries(["admin-brand-details", brandId]);
      queryClient.invalidateQueries(["admin-brands"]);
    },
    onError: (err) => toast.error(`Failed to suspend: ${err.message}`)
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-background border-l shadow-2xl">
        <SheetHeader className="p-6 border-b bg-card z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">Brand Details</SheetTitle>
              <SheetDescription className="text-xs mt-1">
                Deep dive into brand metrics, ownership, and operations.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="p-6 space-y-8">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ) : !brand ? (
            <div className="p-6 text-center text-muted-foreground mt-20">
              Failed to load brand data.
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6 pb-24 space-y-8">
                <BasicInfoSection brand={brand} />
                <Separator />
                
                <Tabs defaultValue="metrics" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 bg-muted/50 p-1 rounded-xl h-auto">
                    <TabsTrigger value="metrics" className="rounded-lg py-2 text-xs font-medium">Metrics</TabsTrigger>
                    <TabsTrigger value="restaurants" className="rounded-lg py-2 text-xs font-medium">Restaurants</TabsTrigger>
                    <TabsTrigger value="owner" className="rounded-lg py-2 text-xs font-medium">Owner</TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-6">
                    <TabsContent value="metrics" className="animate-in fade-in-50 zoom-in-95 duration-200">
                      <MetricsSection id={brandId} />
                    </TabsContent>

                    <TabsContent value="restaurants" className="animate-in fade-in-50 zoom-in-95 duration-200">
                      <RestaurantsSection id={brandId} />
                    </TabsContent>

                    <TabsContent value="owner" className="animate-in fade-in-50 zoom-in-95 duration-200">
                      <OwnerSection brand={brand} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </ScrollArea>
          )}
        </div>

        {brand && (
          <div className="border-t bg-card/50 backdrop-blur-md p-4 flex gap-3 z-10 sticky bottom-0 items-center justify-between">
            {brand.status === "pending" && (
              <Button 
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Approve Brand
              </Button>
            )}
            
            <Button 
              variant={brand.status === "suspended" ? "outline" : "destructive"}
              onClick={() => brand.status === "suspended" ? null : suspendMutation.mutate()}
              disabled={suspendMutation.isPending || brand.status === "suspended"}
              className={`flex-1 h-11 shadow-lg ${brand.status === "suspended" ? 'opacity-50 cursor-not-allowed' : 'shadow-destructive/20'}`}
            >
              <Ban className="w-4 h-4 mr-2" />
              {brand.status === "suspended" ? "Suspended" : "Suspend Brand"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
