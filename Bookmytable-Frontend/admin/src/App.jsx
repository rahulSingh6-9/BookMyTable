import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AdminLayout from "./components/layout/AdminLayout";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import ManageUsers from "./pages/ManageUsers";
import ManageRestaurants from "./pages/ManageRestaurants";
import ManageBookings from "./pages/ManageBookings";
import ManageReviews from "./pages/ManageReviews";
import Payments from "./pages/Payments";
import Notifications from "./pages/Notifications";
import PlatformAnalytics from "./pages/PlatformAnalytics";
import Settings from "./pages/Settings";
import { AdminAuthProvider } from "./context/AuthContext";
import AdminProtectedRoute from "./routes/ProtectedRoute"

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
                <Route path="users" element={<ManageUsers />} />
                <Route path="restaurants" element={<ManageRestaurants />} />
                <Route path="bookings" element={<ManageBookings />} />
                <Route path="reviews" element={<ManageReviews />} />
                <Route path="payments" element={<Payments />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="analytics" element={<PlatformAnalytics />} />
                <Route path="settings" element={<Settings />} />
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
