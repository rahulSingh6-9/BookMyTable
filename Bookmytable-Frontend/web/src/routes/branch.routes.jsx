import { Route, Navigate } from "react-router-dom";
import { BranchLayout } from "@/components/layout/BranchLayout";
import { BranchSync } from "@/components/layout/BranchSync";
import OwnerDashboard from "@/pages/OwnerDashboard";
import RestaurantBranding from "@/pages/RestaurantBranding";
import OwnerAnalytics from "@/pages/OwnerAnalytics";
import OwnerLogsPage from "@/pages/logs/OwnerLogsPage";
import ManageMenu from "@/pages/ManageMenu";
import StaffListPage from "@/pages/staff/StaffListPage";
import ManageTables from "@/pages/ManageTables";
import OwnerLayoutEditor from "@/pages/OwnerLayoutEditor";
import OwnerAvailabilitySchedule from "@/pages/operations/OwnerAvailabilitySchedule";
import ManageReservations from "@/pages/ManageReservations";
import OwnerBookingPolicies from "@/pages/settings/OwnerBookingPolicies";
import OwnerNotificationsSettings from "@/pages/settings/OwnerNotificationsSettings";
import PermissionProtectedRoute from "@/routes/PermissionProtectedRoute";

export const branchRoutes = (
  <Route path="branch/:branchSlug" element={<BranchSync />}>
    <Route element={<BranchLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
    
    {/* Dashboard & Profile */}
    <Route path="dashboard" element={
      <PermissionProtectedRoute allPermissions={["MANAGE_BOOKINGS", "MANAGE_TABLES"]} requireAll={false}>
        <OwnerDashboard />
      </PermissionProtectedRoute>
    } />
    <Route path="profile" element={
      <PermissionProtectedRoute permission="MANAGE_BRANCH">
        <RestaurantBranding />
      </PermissionProtectedRoute>
    } />
    
    {/* Analytics & Reports */}
    <Route path="analytics" element={<PermissionProtectedRoute permission="VIEW_ANALYTICS"><OwnerAnalytics /></PermissionProtectedRoute>} />
    <Route path="logs" element={<PermissionProtectedRoute permission="VIEW_REPORTS"><OwnerLogsPage /></PermissionProtectedRoute>} />

    {/* Daily Operations */}
    <Route path="menu" element={<PermissionProtectedRoute permission="MANAGE_MENU"><ManageMenu /></PermissionProtectedRoute>} />
    <Route path="staff" element={<PermissionProtectedRoute permission="MANAGE_STAFF"><StaffListPage /></PermissionProtectedRoute>} />
    
    {/* Tables & Layout */}
    <Route path="operations">
      <Route path="tables" element={<PermissionProtectedRoute permission="MANAGE_TABLES"><ManageTables /></PermissionProtectedRoute>} />
      <Route path="layout" element={<PermissionProtectedRoute permission="MANAGE_TABLES"><OwnerLayoutEditor /></PermissionProtectedRoute>} />
      <Route path="availability" element={<PermissionProtectedRoute permission="MANAGE_SETTINGS"><OwnerAvailabilitySchedule /></PermissionProtectedRoute>} />
    </Route>

    {/* Reservations */}
    <Route path="reservations" element={<PermissionProtectedRoute permission="MANAGE_BOOKINGS"><ManageReservations /></PermissionProtectedRoute>} />
    
    {/* Branch Settings */}
    <Route path="settings">
      <Route index element={<Navigate to="booking-policies" replace />} />
      <Route path="booking-policies" element={<PermissionProtectedRoute permission="MANAGE_SETTINGS"><OwnerBookingPolicies /></PermissionProtectedRoute>} />
      <Route path="notifications" element={<PermissionProtectedRoute permission="MANAGE_SETTINGS"><OwnerNotificationsSettings /></PermissionProtectedRoute>} />
    </Route>
    </Route>
  </Route>
);
