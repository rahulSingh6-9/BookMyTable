import { useState, useEffect } from "react";
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
  UserCircle,
  Shield,
  Activity,
  Calendar,
  Store,
  Users,
  Ban,
  CheckCircle,
  LogOut,
  AlertTriangle,
} from "lucide-react";

import {
  getUserDetails,
  getUserActivity,
  getUserBookings,
  blockUser,
  unblockUser,
  changeUserRole,
  forceLogoutUser,
} from "@/services/user.service";

// Internal sections for better organization
const ProfileSection = ({ user }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={user?.profile?.avatar || user?.avatar} />
        <AvatarFallback>{user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="text-lg font-semibold">{user?.profile?.fullName || user?.name || "No Name Provided"}</h3>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <p className="text-xs text-muted-foreground">ID: {user?._id}</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
        <p className="text-sm font-medium">{user?.phone || "Not provided"}</p>
      </div>
      <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground mb-1">Created Date</p>
        <p className="text-sm font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
      </div>
      <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground mb-1">Last Login</p>
        <p className="text-sm font-medium">{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</p>
      </div>
      <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground mb-1">Account Status</p>
        <Badge variant={user?.accountStatus === "active" ? "success" : "secondary"}>
          {user?.accountStatus || (user?.isBlocked ? "blocked" : "active")}
        </Badge>
      </div>
    </div>
  </div>
);

const RolesSection = ({ roles }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-semibold flex items-center gap-2">
      <Shield className="w-4 h-4 text-primary" /> Global Platform Roles
    </h4>
    <div className="flex flex-wrap gap-2">
      {roles && roles.length > 0 ? (
        roles.map((role) => (
          <Badge key={role} variant="outline" className="capitalize text-xs font-medium bg-primary/5">
            {role.replace(/_/g, " ")}
          </Badge>
        ))
      ) : (
        <p className="text-sm text-muted-foreground italic">No global roles assigned.</p>
      )}
    </div>
  </div>
);

const SecuritySection = ({ user }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-semibold flex items-center gap-2">
      <Shield className="w-4 h-4 text-primary" /> Security & Verification
    </h4>
    <div className="space-y-3">
      <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
        <span className="text-sm font-medium">Email Verified</span>
        {user?.emailVerified ? (
          <Badge variant="success" className="bg-emerald-50 text-emerald-600 border-emerald-200">Yes</Badge>
        ) : (
          <Badge variant="secondary">No</Badge>
        )}
      </div>
      <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
        <span className="text-sm font-medium">Phone Verified</span>
        {user?.phoneVerified ? (
          <Badge variant="success" className="bg-emerald-50 text-emerald-600 border-emerald-200">Yes</Badge>
        ) : (
          <Badge variant="secondary">No</Badge>
        )}
      </div>
      <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
        <span className="text-sm font-medium">Blocked Status</span>
        {user?.isBlocked ? (
          <Badge variant="destructive">Blocked</Badge>
        ) : (
          <Badge variant="outline" className="text-emerald-600">Active</Badge>
        )}
      </div>
    </div>
  </div>
);

const ActivitySection = ({ id }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-user-activity", id],
    queryFn: () => getUserActivity(id),
    enabled: !!id,
  });

  if (isLoading) return <Skeleton className="h-32 w-full rounded-xl" />;
  const activity = data?.data?.data || [];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" /> Recent Account Activity
      </h4>
      {activity.length === 0 ? (
        <p className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-xl text-center border border-dashed">
          No recent activity logs found.
        </p>
      ) : (
        <div className="space-y-3">
          {activity.slice(0, 10).map((log, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
              <div>
                <p className="text-sm font-medium">{log.action}</p>
                <p className="text-xs text-muted-foreground">{log.ip || "Unknown IP"}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(log.timestamp || log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomerDataSection = ({ id }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-user-bookings", id],
    queryFn: () => getUserBookings(id),
    enabled: !!id,
  });

  if (isLoading) return <Skeleton className="h-32 w-full rounded-xl" />;
  const total = data?.data?.total ?? data?.total ?? 0;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Calendar className="w-4 h-4 text-primary" /> Customer Data
      </h4>
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-center">
          <p className="text-2xl font-bold text-primary">{total}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Total Bookings</p>
        </div>
      </div>
    </div>
  );
};

const RestaurantDataSection = ({ user }) => {
  const owned = user?.ownedRestaurants || [];
  const staff = user?.staffAffiliations || [];

  return (
    <div className="space-y-6">
      {/* Total Memberships Header */}
      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex justify-between items-center">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Total Memberships</span>
        <span className="text-2xl font-bold text-primary">{user?.totalMemberships || 0}</span>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Store className="w-4 h-4 text-primary" /> Owned Restaurants
        </h4>
        {owned.length === 0 ? (
          <p className="text-sm text-muted-foreground">No restaurants owned.</p>
        ) : (
          <div className="space-y-2">
            {owned.map((r, i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg border border-border/50 flex justify-between items-center">
                <span className="text-sm font-medium">{r.name}</span>
                <Badge variant={r.status === 'approved' ? 'success' : 'secondary'}>{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" /> Staff Affiliations
        </h4>
        {staff.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not a staff member at any branch.</p>
        ) : (
          <div className="space-y-2">
            {staff.map((s, i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-sm font-medium">{s.branchName || "Unknown Branch"}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">Role: <Badge variant="outline" className="text-[10px] uppercase ml-1">{s.role}</Badge></span>
                  <span className="text-xs text-muted-foreground">Status: <Badge variant="secondary" className="text-[10px] uppercase ml-1">{s.status}</Badge></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export function UserDetailsDrawer({ userId, open, onOpenChange }) {
  const queryClient = useQueryClient();

  const { data: userDetailsResponse, isLoading, error } = useQuery({
    queryKey: ["admin-user-details", userId],
    queryFn: () => getUserDetails(userId),
    enabled: !!userId && open,
  });

  const user = userDetailsResponse?.data?.data || userDetailsResponse?.data || userDetailsResponse;

  const blockMutation = useMutation({
    mutationFn: () => user?.isBlocked ? unblockUser(userId) : blockUser(userId),
    onSuccess: () => {
      toast.success(`User ${user?.isBlocked ? "unblocked" : "blocked"} successfully`);
      queryClient.invalidateQueries(["admin-user-details", userId]);
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (err) => {
      toast.error(`Failed to update status: ${err.message}`);
    }
  });

  const forceLogoutMutation = useMutation({
    mutationFn: () => forceLogoutUser(userId),
    onSuccess: () => toast.success("Force logout command sent"),
    onError: (err) => toast.error(`Force logout failed: ${err.message}`),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-background border-l shadow-2xl">
        <SheetHeader className="p-6 border-b bg-card z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">User Details</SheetTitle>
              <SheetDescription className="text-xs mt-1">
                Deep dive into account, security, and activity data.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="p-6 space-y-8">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ) : error?.response?.data?.error === "RESYNC_REQUIRED" ? (
            <div className="p-6 text-center mt-20 space-y-4">
              <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-amber-600">Resync Required</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                The local read model for this user is missing or stale. This might be due to a Kafka synchronization delay or a missing event. Please wait or trigger a manual resync.
              </p>
            </div>
          ) : !user ? (
            <div className="p-6 text-center text-muted-foreground mt-20">
              Failed to load user data.
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6 pb-24 space-y-8">
                <ProfileSection user={user} />
                <Separator />
                
                <Tabs defaultValue="access" className="w-full">
                  <TabsList className="w-full grid grid-cols-4 bg-muted/50 p-1 rounded-xl h-auto">
                    <TabsTrigger value="access" className="rounded-lg py-2 text-xs font-medium data-[state=active]:shadow-sm">Access</TabsTrigger>
                    <TabsTrigger value="data" className="rounded-lg py-2 text-xs font-medium data-[state=active]:shadow-sm">Customer</TabsTrigger>
                    <TabsTrigger value="business" className="rounded-lg py-2 text-xs font-medium data-[state=active]:shadow-sm">Business</TabsTrigger>
                    <TabsTrigger value="activity" className="rounded-lg py-2 text-xs font-medium data-[state=active]:shadow-sm">Activity</TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-6">
                    <TabsContent value="access" className="space-y-8 animate-in fade-in-50 zoom-in-95 duration-200">
                      <RolesSection roles={user.roles} />
                      <Separator />
                      <SecuritySection user={user} />
                    </TabsContent>

                    <TabsContent value="data" className="animate-in fade-in-50 zoom-in-95 duration-200">
                      <CustomerDataSection id={userId} />
                    </TabsContent>

                    <TabsContent value="business" className="animate-in fade-in-50 zoom-in-95 duration-200">
                      <RestaurantDataSection user={user} />
                    </TabsContent>

                    <TabsContent value="activity" className="animate-in fade-in-50 zoom-in-95 duration-200">
                      <ActivitySection id={userId} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Action Bar pinned to bottom */}
        {user && (
          <div className="border-t bg-card/50 backdrop-blur-md p-4 flex gap-3 z-10 sticky bottom-0 items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => forceLogoutMutation.mutate()}
              disabled={forceLogoutMutation.isPending}
              className="flex-1 h-11 border-border/60 hover:bg-muted"
            >
              <LogOut className="w-4 h-4 mr-2 text-muted-foreground" />
              Force Logout
            </Button>
            
            <Button 
              variant={user.isBlocked ? "outline" : "destructive"}
              onClick={() => blockMutation.mutate()}
              disabled={blockMutation.isPending}
              className={`flex-1 h-11 shadow-lg ${user.isBlocked ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800' : 'shadow-destructive/20'}`}
            >
              {user.isBlocked ? <CheckCircle className="w-4 h-4 mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
              {user.isBlocked ? "Unblock User" : "Block User"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
