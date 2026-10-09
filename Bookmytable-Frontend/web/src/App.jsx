import { BrowserRouter, Navigate, Route, Routes, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { customerRoutes } from "./modules/customer/routes/customer.routes";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import RestaurantSearch from "./pages/RestaurantSearch";
import RestaurantDetail from "./pages/RestaurantDetail";
import RestaurantBooking from "./pages/RestaurantBooking";
import RestaurantCheckout from "./pages/RestaurantCheckout";
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
import ManageMenu from "./pages/ManageMenu";
import OwnerAnalytics from "./pages/OwnerAnalytics";
import OwnerBookingPolicies from "./pages/settings/OwnerBookingPolicies";
import OwnerAccountSettings from "./pages/settings/OwnerAccountSettings";
import OwnerBillingSettings from "./pages/settings/OwnerBillingSettings";
import OwnerNotificationsSettings from "./pages/settings/OwnerNotificationsSettings";
import OwnerIntegrationsSettings from "./pages/settings/OwnerIntegrationsSettings";
import OwnerSecuritySettings from "./pages/settings/OwnerSecuritySettings";
import OwnerRolesAccessSettings from "./pages/settings/OwnerRolesAccessSettings";
import OwnerLayoutEditor from "./pages/OwnerLayoutEditor";
import OwnerAvailabilitySchedule from "./pages/operations/OwnerAvailabilitySchedule";
import OwnerSubscription from "./pages/OwnerSubscription";
import RestaurantBranding from "./pages/RestaurantBranding";
import BusinessVerification from "./pages/BusinessVerification";
import { BrandLayout } from "@/components/layout/BrandLayout";
import { BrandSync } from "@/components/layout/BrandSync";
import { BranchLayout } from "@/components/layout/BranchLayout";
import { brandRoutes } from "@/routes/brand.routes";
import AcceptInvite from "@/pages/staff/AcceptInvite";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import PartnerWithUs from "./pages/PartnerWithUs";
import { InfoLayout } from "@/components/layout/InfoLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { StandaloneLayout } from "@/components/layout/StandaloneLayout";
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
import VerifyBusinessEmail from "./pages/VerifyBusinessEmail";
import StaffListPage from "./pages/staff/StaffListPage";
import OwnerLogsPage from "./pages/logs/OwnerLogsPage";
import NotAuthorized from "./pages/NotAuthorized";
import GsapRestaurantIntro from "./pages/GsapRestaurantIntro";


import ProtectedRoute from "@/routes/ProtectedRoute";
import PermissionProtectedRoute from "@/routes/PermissionProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import { BarbaPageTransition } from "@/components/animation/BarbaPageTransition";


const App = () => (
  <CartProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
      <ScrollToTop />
      <BarbaPageTransition>
        {(renderLocation) => (
          <Routes location={renderLocation}>

        {/* 🍽️ STANDALONE RESTAURANT EXPERIENCES (NO HEADER / FOOTER) */}
        <Route element={<StandaloneLayout />}>
          <Route path="/restaurant/:slug" element={<RestaurantDetail />} />
          <Route path="/restaurant/:slug/book" element={<RestaurantBooking />} />
          <Route path="/restaurant/:slug/checkout" element={<RestaurantCheckout />} />
        </Route>

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
          <Route path="/verify-business-email" element={<VerifyBusinessEmail />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />


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
              {customerRoutes.element}
            </ProtectedRoute>
          }
        >
          {customerRoutes.children.map((route, idx) => (
            <Route
              key={idx}
              index={route.index}
              path={route.path}
              element={route.element}
            >
              {route.children && route.children.map((subRoute, subIdx) => (
                <Route
                  key={subIdx}
                  index={subRoute.index}
                  path={subRoute.path}
                  element={subRoute.element}
                />
              ))}
            </Route>
          ))}
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

        {/* 🏢 BRAND PANEL */}
        <Route path="/brand" element={
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        }>
          <Route index element={<BrandSync />} />
          {brandRoutes}
        </Route>

        {/* Legacy ID-based Redirects */}
        <Route path="/workspace/:contextId/:branchId/*" element={
          <Navigate to="/discover" replace />
        } />
        <Route path="/branch/:branchId/*" element={
          <Navigate to="/discover" replace />
        } />
        <Route path="/owner" element={<Navigate to="/brand" replace />} />
        <Route path="/owner/*" element={<Navigate to="/brand" replace />} />




        {/* 🔐 Access Denied */}
        <Route path="/not-authorized" element={<NotAuthorized />} />

        {/* 🎬 CINEMATIC ANIMATION EXPERIMENT (Isolated, no layout) */}
        <Route path="/gsap-restaurant-intro" element={<GsapRestaurantIntro />} />

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />

          </Routes>
        )}
      </BarbaPageTransition>
      </BrowserRouter>
    </TooltipProvider>
  </CartProvider>
);

export default App;
