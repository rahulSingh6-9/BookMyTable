import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AdminLayout from "./components/layout/AdminLayout";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import ManageUsers from "./pages/ManageUsers";
import ManageBrands from "./pages/ManageBrands";
import ManageRestaurants from "./pages/ManageRestaurants";
import ManageBookings from "./pages/ManageBookings";
import ManageReviews from "./pages/ManageReviews";
import Payments from "./pages/Payments";
import ManageSubscriptions from "./pages/ManageSubscriptions";
import Notifications from "./pages/Notifications";
import PlatformAnalytics from "./pages/PlatformAnalytics";
import AdminLogsPage from "./pages/AdminLogsPage";
import Settings from "./pages/Settings";
import AdminInvitations from "./pages/AdminInvitations";
import AdminAcceptInvite from "./pages/AdminAcceptInvite";

import ApprovalQueue from "./pages/ApprovalQueue";
import VerificationCenter from "./pages/VerificationCenter";
import ReportsAbuse from "./pages/ReportsAbuse";
import DiscoveryManagement from "./pages/DiscoveryManagement";
import SupportIssues from "./pages/SupportIssues";
import AuditLogs from "./pages/AuditLogs";

import { PermissionProtectedRoute } from "./routes/PermissionProtectedRoute"
import { AdminAuthProvider } from "./context/AuthContext";
import AdminProtectedRoute from "./routes/ProtectedRoute";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminAuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* 🔓 Public route */}
              <Route path="/login" element={<Login />} />          
              <Route path="/admin/join" element={<AdminAcceptInvite />} />

              {/* 🔁 Redirect root to admin */}
              <Route path="/" element={<Navigate to="/admin" replace />} />          

              {/* 🔒 Protected Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<AdminPanel />} />
                
                <Route path="users" element={
                  <PermissionProtectedRoute permission="users.view">
                    <ManageUsers />
                  </PermissionProtectedRoute>
                } />
                
                <Route path="brands" element={
                  <PermissionProtectedRoute permission="brands.view">
                    <ManageBrands />
                  </PermissionProtectedRoute>
                } />
                
                <Route path="restaurants" element={
                  <PermissionProtectedRoute permission="restaurants.view">
                    <ManageRestaurants />
                  </PermissionProtectedRoute>
                } />
                
                <Route path="bookings" element={
                  <PermissionProtectedRoute permission="bookings.view">
                    <ManageBookings />
                  </PermissionProtectedRoute>
                } />
                
                <Route path="reviews" element={
                  <PermissionProtectedRoute permission="content.moderate">
                    <ManageReviews />
                  </PermissionProtectedRoute>
                } />
                
                <Route path="payments" element={
                  <PermissionProtectedRoute permission="payments.view">
                    <Payments />
                  </PermissionProtectedRoute>
                } />
                
                <Route path="subscriptions" element={
                  <PermissionProtectedRoute permission="payments.view">
                    <ManageSubscriptions />
                  </PermissionProtectedRoute>
                } />
                
                <Route path="notifications" element={
                  <PermissionProtectedRoute permission="settings.manage">
                    <Notifications />
                  </PermissionProtectedRoute>
                } />
                
                <Route path="analytics" element={
                  <PermissionProtectedRoute permission="analytics.view">
                    <PlatformAnalytics />
                  </PermissionProtectedRoute>
                } />
                
                <Route path="logs" element={
                  <PermissionProtectedRoute permission="audit_logs.view">
                    <AdminLogsPage />
                  </PermissionProtectedRoute>
                } />
                
                <Route path="settings" element={
                  <PermissionProtectedRoute permission="settings.manage">
                    <Settings />
                  </PermissionProtectedRoute>
                } />

                {/* NEW Admin Management */}
                <Route path="invitations" element={
                  <PermissionProtectedRoute permission="admins.manage">
                    <AdminInvitations />
                  </PermissionProtectedRoute>
                } />

                {/* NEW Moderation & Operations Pages */}
                <Route path="approvals" element={
                  <PermissionProtectedRoute permission="restaurants.manage">
                    <ApprovalQueue />
                  </PermissionProtectedRoute>
                } />

                <Route path="verifications" element={
                  <PermissionProtectedRoute permission="users.manage">
                    <VerificationCenter />
                  </PermissionProtectedRoute>
                } />

                <Route path="reports" element={
                  <PermissionProtectedRoute permission="content.moderate">
                    <ReportsAbuse />
                  </PermissionProtectedRoute>
                } />

                <Route path="discovery" element={
                  <PermissionProtectedRoute permission="brands.manage">
                    <DiscoveryManagement />
                  </PermissionProtectedRoute>
                } />

                <Route path="support" element={
                  <PermissionProtectedRoute permission="settings.manage">
                    <SupportIssues />
                  </PermissionProtectedRoute>
                } />

                <Route path="audit" element={
                  <PermissionProtectedRoute permission="audit_logs.view">
                    <AuditLogs />
                  </PermissionProtectedRoute>
                } />

              </Route>

              {/* 404 Redirect */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </BrowserRouter>
        </AdminAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
