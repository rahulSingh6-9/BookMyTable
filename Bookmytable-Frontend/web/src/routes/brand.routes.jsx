import { Route, Navigate } from "react-router-dom";
import { BrandLayout } from "@/components/layout/BrandLayout";
import BrandDetails from "@/pages/brand/BrandDetails";
import ActiveBranches from "@/pages/brand/ActiveBranches";
import DeactivatedBranches from "@/pages/brand/DeactivatedBranches";
import BrandLogs from "@/pages/brand/BrandLogs";

import OwnerSubscription from "@/pages/OwnerSubscription";
import OwnerBillingSettings from "@/pages/settings/OwnerBillingSettings";
import OwnerAccountSettings from "@/pages/settings/OwnerAccountSettings";
import OwnerIntegrationsSettings from "@/pages/settings/OwnerIntegrationsSettings";
import OwnerSecuritySettings from "@/pages/settings/OwnerSecuritySettings";
import OwnerRolesAccessSettings from "@/pages/settings/OwnerRolesAccessSettings";
import PermissionProtectedRoute from "@/routes/PermissionProtectedRoute";

import BrandProtectedRoute from "@/routes/BrandProtectedRoute";

import { BrandSync } from "@/components/layout/BrandSync";

import { branchRoutes } from "./branch.routes";

import ArchivedBrands from "@/pages/brand/ArchivedBrands";

import ProtectedRoute from "@/routes/ProtectedRoute";

export const brandRoutes = (
  <>
    <Route path="archived" element={<ProtectedRoute><ArchivedBrands /></ProtectedRoute>} />
    <Route path=":brandSlug" element={<BrandSync />}>
      <Route element={<BrandLayout />}>
        <Route index element={<Navigate to="details" replace />} />
        
        {/* Brand Management Pages - Safe */}
        <Route path="details" element={<BrandProtectedRoute><BrandDetails /></BrandProtectedRoute>} />
        <Route path="active" element={<BrandProtectedRoute><ActiveBranches /></BrandProtectedRoute>} />
        
        {/* Sensitive Features - Owner / Manager / Admin only */}
        <Route path="deactivated" element={<BrandProtectedRoute allowedRoles={["owner", "co_owner", "manager"]}><DeactivatedBranches /></BrandProtectedRoute>} />
        
        {/* Subscription & Billing */}
        <Route path="subscription" element={<BrandProtectedRoute allowedRoles={["owner", "co_owner"]}><OwnerSubscription /></BrandProtectedRoute>} />
        <Route path="billing" element={<BrandProtectedRoute allowedRoles={["owner", "co_owner"]}><OwnerBillingSettings /></BrandProtectedRoute>} />
        
        {/* Settings */}
        <Route path="settings">
          <Route index element={<Navigate to="account" replace />} />
          <Route path="account" element={<BrandProtectedRoute allowedRoles={["owner", "co_owner"]}><OwnerAccountSettings /></BrandProtectedRoute>} />
        </Route>
        <Route path="integrations" element={<BrandProtectedRoute allowedRoles={["owner", "co_owner"]}><OwnerIntegrationsSettings /></BrandProtectedRoute>} />
        <Route path="security" element={<BrandProtectedRoute allowedRoles={["owner", "co_owner"]}><OwnerSecuritySettings /></BrandProtectedRoute>} />
        <Route path="roles" element={<BrandProtectedRoute allowedRoles={["owner", "co_owner"]}><OwnerRolesAccessSettings /></BrandProtectedRoute>} />
        <Route path="logs" element={<BrandProtectedRoute allowedRoles={["owner", "co_owner", "manager"]}><BrandLogs /></BrandProtectedRoute>} />
      </Route>
      
      {branchRoutes}
    </Route>
  </>
);
