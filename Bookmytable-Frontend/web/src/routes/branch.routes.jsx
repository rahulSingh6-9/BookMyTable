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
import LayoutManagementPage from "@/pages/operations/LayoutManagementPage";
import DedicatedLayoutEditor from "@/pages/operations/DedicatedLayoutEditor";
import OwnerAvailabilitySchedule from "@/pages/operations/OwnerAvailabilitySchedule";
import PricingManagement from "@/pages/operations/PricingManagement";
import ManageReservations from "@/pages/ManageReservations";
import OwnerBookingPolicies from "@/pages/settings/OwnerBookingPolicies";
import OwnerNotificationsSettings from "@/pages/settings/OwnerNotificationsSettings";
import OwnerPaymentsSettings from "@/pages/settings/OwnerPaymentsSettings";
import OwnerPlanUsageSettings from "@/pages/settings/OwnerPlanUsageSettings";
import BranchContactSettings from "@/pages/settings/BranchContactSettings";
import BranchLocationSettings from "@/pages/settings/BranchLocationSettings";
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
      <Route path="layout" element={<PermissionProtectedRoute permission="MANAGE_TABLES"><LayoutManagementPage /></PermissionProtectedRoute>} />
      <Route path="layout/:diningAreaId" element={<PermissionProtectedRoute permission="MANAGE_TABLES"><DedicatedLayoutEditor /></PermissionProtectedRoute>} />
      <Route path="availability" element={<PermissionProtectedRoute permission="MANAGE_SETTINGS"><OwnerAvailabilitySchedule /></PermissionProtectedRoute>} />
      <Route path="pricing" element={<PermissionProtectedRoute permission="MANAGE_TABLES"><PricingManagement /></PermissionProtectedRoute>} />
    </Route>

    {/* Reservations */}
    <Route path="reservations" element={<PermissionProtectedRoute permission="MANAGE_BOOKINGS"><ManageReservations /></PermissionProtectedRoute>} />
    
    {/* Branch Settings */}
    <Route path="settings">
      <Route index element={<Navigate to="booking-policies" replace />} />
      <Route path="booking-policies" element={<PermissionProtectedRoute permission="MANAGE_SETTINGS"><OwnerBookingPolicies /></PermissionProtectedRoute>} />
      <Route path="contact-information" element={<PermissionProtectedRoute permission="MANAGE_SETTINGS"><BranchContactSettings /></PermissionProtectedRoute>} />
      <Route path="location" element={<PermissionProtectedRoute permission="MANAGE_SETTINGS"><BranchLocationSettings /></PermissionProtectedRoute>} />
      <Route path="payments" element={<PermissionProtectedRoute permission="MANAGE_SETTINGS"><OwnerPaymentsSettings /></PermissionProtectedRoute>} />
      <Route path="plan" element={<PermissionProtectedRoute permission="MANAGE_SETTINGS"><OwnerPlanUsageSettings /></PermissionProtectedRoute>} />
      <Route path="notifications" element={<PermissionProtectedRoute permission="MANAGE_SETTINGS"><OwnerNotificationsSettings /></PermissionProtectedRoute>} />
    </Route>
    </Route>
  </Route>
);
