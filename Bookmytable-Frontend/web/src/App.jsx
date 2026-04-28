import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import RestaurantSearch from "./pages/RestaurantSearch";
import RestaurantDetail from "./pages/RestaurantDetail";
import TableBooking from "./pages/TableBooking";
import BookingConfirmation from "./pages/BookingConfirmation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import BookingHistory from "./pages/BookingHistory";
import Favorites from "./pages/Favorites";
import OwnerDashboard from "./pages/OwnerDashboard";
import ManageTables from "./pages/ManageTables";
import ManageReservations from "./pages/ManageReservations";
import UploadMenu from "./pages/UploadMenu";
import OwnerAnalytics from "./pages/OwnerAnalytics";
import RestaurantSettings from "./pages/RestaurantSettings";
import OwnerLayoutEditor from "./pages/OwnerLayoutEditor";
import OwnerAvailability from "./pages/OwnerAvailability";
import OwnerSubscription from "./pages/OwnerSubscription";
import { StaffLayout } from "@/components/layout/StaffLayout";
import StaffLiveTables from "@/pages/staff/LiveTables";
import StaffWalkinBooking from "@/pages/staff/WalkinBooking";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import { OwnerLayout } from "@/components/layout/OwnerLayout";
import PartnerWithUs from "./pages/PartnerWithUs";
import { InfoLayout } from "@/components/layout/InfoLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ProfileLayout } from "@/components/layout/ProfileLayout";
import ProfileBookings from "@/pages/profile/Bookings";
import ProfileFavorites from "@/pages/profile/Favorites";
import ProfileAccountSettings from "@/pages/profile/Settings";
import Privacy from "./pages/info/Privacy";
import Security from "./pages/info/Security";
import Terms from "./pages/info/Terms";
import Support from "./pages/info/Support";
import ReportFraud from "./pages/info/ReportFraud";
import Blog from "./pages/info/Blog";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Pricing from "./pages/Pricing";
import NearMe from "./pages/NearMe";
import TopRated from "./pages/TopRated";
import NewOpenings from "./pages/NewOpenings";
import PartnerRegister from "./pages/PartnerRegister";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "@/routes/ProtectedRoute";
import RoleProtectedRoute from "@/routes/RoleProtectedRoute";


const App = () => (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
      <Routes>

        {/* 🌍 PUBLIC ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/near-me" element={<NearMe />} />
          <Route path="/top-rated" element={<TopRated />} />
          <Route path="/new-openings" element={<NewOpenings />} />
          <Route path="/partner-with-us" element={<PartnerWithUs />} />

          <Route path="/partner/register"
           element={
                <ProtectedRoute>
                  <PartnerRegister />
                </ProtectedRoute>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/search" element={<RestaurantSearch />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />

          {/* 🔥 Booking needs login */}
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute>
                <TableBooking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/booking-confirmation/:id"
            element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            }
          />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />


          <Route
            path="/booking-history"
            element={
              <ProtectedRoute>
                <BookingHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 👤 CUSTOMER PROFILE (PROTECTED) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="bookings" replace />} />
          <Route path="bookings" element={<ProfileBookings />} />
          <Route path="favorites" element={<ProfileFavorites />} />
          <Route path="settings" element={<ProfileAccountSettings />} />
        </Route>

        {/* ℹ️ INFO PAGES */}
        <Route element={<InfoLayout />}>
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/security" element={<Security />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/support" element={<Support />} />
          <Route path="/report-fraud" element={<ReportFraud />} />
          <Route path="/blog" element={<Blog />} />
        </Route>

        {/* 🏢 OWNER PANEL (ROLE PROTECTED) */}
        <Route
          path="/owner"
          element={
            <RoleProtectedRoute allowedRoles={["owner"]}>
              <OwnerLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="tables" element={<ManageTables />} />
          <Route path="layout" element={<OwnerLayoutEditor />} />
          <Route path="reservations" element={<ManageReservations />} />
          <Route path="availability" element={<OwnerAvailability />} />
          <Route path="menu" element={<UploadMenu />} />
          <Route path="analytics" element={<OwnerAnalytics />} />
          <Route path="settings" element={<RestaurantSettings />} />
          <Route path="subscription" element={<OwnerSubscription />} />
        </Route>

        {/* 👨‍🍳 STAFF PANEL (ROLE PROTECTED) */}
        <Route
          path="/staff"
          element={
            <RoleProtectedRoute allowedRoles={["staff"]}>
              <StaffLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<Navigate to="live-tables" replace />} />
          <Route path="live-tables" element={<StaffLiveTables />} />
          <Route path="walkin-booking" element={<StaffWalkinBooking />} />
        </Route>

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
      </BrowserRouter>
    </TooltipProvider>
);

export default App;
