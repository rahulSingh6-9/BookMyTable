import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/components/auth/PermissionGuard";
import { getRestaurantBookings } from "@/services/booking.service";
import { getRestaurantTables } from "@/services/table.service";
import { useBranch } from "@/context/BranchContext";
import { Loader } from "@/components/common/Loader";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { format } from "date-fns";

// Sub-components
import { ManagerOverview } from "@/components/staff/ManagerOverview";
import { ReceptionistOverview } from "@/components/staff/ReceptionistOverview";
import { WaiterOverview } from "@/components/staff/WaiterOverview";

export default function StaffDashboard() {
  const { hasPermission } = usePermission();
  const { activeBranchId: restaurantId } = useBranch();

  // 1️⃣ Fetch Today's Bookings
  const { data: bookingsRes, isLoading: loadingBookings, error: bookingsError } = useQuery({
    queryKey: ["staff", "bookings", "today", restaurantId],
    queryFn: () => getRestaurantBookings(restaurantId, { date: format(new Date(), "yyyy-MM-dd") }),
    enabled: !!restaurantId,
  });

  // 2️⃣ Fetch Tables
  const { data: tablesRes, isLoading: loadingTables } = useQuery({
    queryKey: ["staff", "tables", restaurantId],
    queryFn: () => getRestaurantTables(restaurantId),
    enabled: !!restaurantId,
  });

  if (loadingBookings || loadingTables) return <Loader />;
  if (bookingsError) return <ErrorMessage message="Failed to load dashboard data" />;

  const bookings = bookingsRes?.data?.data || [];
  const tables = tablesRes?.data?.data || [];

  // 🧠 Determine which view to show based on permissions
  const isManager = hasPermission(["manage_staff", "view_logs"]);
  const isReceptionist = hasPermission(["check_in_customers"]) && !isManager;
  const isWaiter = !isManager && !isReceptionist;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {isManager && <ManagerOverview bookings={bookings} tables={tables} />}
      {isReceptionist && <ReceptionistOverview bookings={bookings} />}
      {isWaiter && <WaiterOverview tables={tables} />}
    </div>
  );
}

