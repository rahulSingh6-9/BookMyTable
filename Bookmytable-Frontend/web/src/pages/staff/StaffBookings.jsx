import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getRestaurantBookings, updateBookingStatus } from "@/services/booking.service";
import { Loader } from "@/components/common/Loader";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { 
  Search, 
  Filter, 
  Calendar, 
  MoreVertical, 
  Check, 
  X,
  User,
  Users as UsersIcon,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckInButton } from "@/components/staff/CheckInButton";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

export default function StaffBookings() {
  const { user } = useAuth();
  const restaurantId = user?.restaurantId || user?.restaurant?._id;
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: bookingsRes, isLoading, error } = useQuery({
    queryKey: ["staff", "bookings", restaurantId],
    queryFn: () => getRestaurantBookings(restaurantId),
    enabled: !!restaurantId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "bookings"] });
      toast.success("Booking status updated");
    },
    onError: (err) => toast.error(err.message || "Update failed"),
  });

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message="Failed to load bookings" />;

  const bookings = bookingsRes?.data?.data || [];
  const filteredBookings = bookings.filter(b => 
    b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b._id?.slice(-6).includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Bookings</h1>
          <p className="text-muted-foreground">View and handle customer reservations</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or ID..." 
              className="pl-9 w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Schedule</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Guests</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{booking.user?.name || "Walk-in"}</p>
                        <p className="text-xs text-muted-foreground mt-1">{booking.email || "No email"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {booking.time}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <UsersIcon className="h-4 w-4 text-muted-foreground" />
                      {booking.guests}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={
                      booking.status === 'confirmed' ? 'success' :
                      booking.status === 'pending' ? 'warning' :
                      booking.status === 'checked_in' ? 'info' :
                      'destructive'
                    } className="capitalize">
                      {booking.status?.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       {/* Permission-based actions */}
                       <PermissionGuard permissions={["check_in_customers"]}>
                         <CheckInButton bookingId={booking._id} currentStatus={booking.status} />
                       </PermissionGuard>

                       {booking.status === 'pending' && (
                         <div className="flex items-center gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => statusMutation.mutate({ id: booking._id, status: 'confirmed' })}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => statusMutation.mutate({ id: booking._id, status: 'cancelled' })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                         </div>
                       )}

                       <Button variant="ghost" size="icon" className="h-8 w-8">
                         <MoreVertical className="h-4 w-4" />
                       </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No bookings found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
