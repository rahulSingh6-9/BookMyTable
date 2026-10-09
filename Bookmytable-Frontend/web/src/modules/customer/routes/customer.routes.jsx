import React from "react";
import { Navigate } from "react-router-dom";
import { CustomerLayout } from "../layouts/CustomerLayout";
import CustomerBookings from "../pages/CustomerBookings";
import CustomerFavorites from "../pages/CustomerFavorites";
import CustomerRewards from "../pages/CustomerRewards";
import CustomerActivity from "../pages/CustomerActivity";
import CustomerNotifications from "../pages/CustomerNotifications";
import CustomerPreferences from "../pages/CustomerPreferences";
import CustomerSettings from "../pages/CustomerSettings";
import ContactVerification from "../pages/ContactVerification";
import UpdatePassword from "../pages/UpdatePassword";
import DeactivateAccount from "../pages/DeactivateAccount";

export const customerRoutes = {
  path: "/profile",
  element: <CustomerLayout />,
  children: [
    { index: true, element: <Navigate to="bookings" replace /> },
    { path: "home", element: <Navigate to="/profile/bookings" replace /> },
    { path: "discover", element: <Navigate to="/discover" replace /> },
    { path: "bookings", element: <CustomerBookings /> },
    { path: "favorites", element: <CustomerFavorites /> },
    { path: "rewards", element: <CustomerRewards /> },
    { path: "activity", element: <CustomerActivity /> },
    { path: "notifications", element: <CustomerNotifications /> },
    { path: "preferences", element: <CustomerPreferences /> },
    { 
      path: "settings", 
      element: <CustomerSettings />,
      children: [
        { index: true, element: <Navigate to="contact-verification" replace /> },
        { path: "contact-verification", element: <ContactVerification /> },
        { path: "update-password", element: <UpdatePassword /> },
        { path: "deactivate-account", element: <DeactivateAccount /> }
      ]
    }
  ]
};
