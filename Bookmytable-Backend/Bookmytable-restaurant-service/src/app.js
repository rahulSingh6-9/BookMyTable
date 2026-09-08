import express from "express";

import cors from "cors";
import membershipRoutes from "./modules/membership/membership.routes.js"
import restaurantRoutes from "./modules/restaurant/restaurant.routes.js";
import tableRoutes from "./modules/table/table.routes.js"
import menuCategoryRoutes from "./modules/menu-category/menuCategory.routes.js"
import menuItemRoutes from "./modules/menu-item/menuItem.routes.js"
import settingsRoutes from "./modules/settings/settings.routes.js"
import staffRoutes from "./modules/staff/staff.routes.js"
import logRoutes from "./modules/log/log.routes.js"
import onboardingRoutes from "./modules/onboarding/onboarding.routes.js"
import brandRoutes from "./modules/brand/brand.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import businessWorkspaceRoutes from "./modules/businessWorkspace/businessWorkspace.routes.js";
import subscriptionRoutes from "./modules/subscriptions/subscription.routes.js";
import discoveryRoutes from "./modules/discovery/discovery.routes.js";
import bookingRoutes from "./modules/booking/booking.routes.js";
import availabilityRoutes from "./modules/availability/availability.routes.js";
import layoutRoutes from "./modules/layout/layout.route.js";
import pricingRoutes from "./modules/pricing/pricing.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

// 📝 Global Request Logger for Debugging
app.use((req, res, next) => {
  console.log(`[RestaurantService] 📥 ${req.method} ${req.url}`);
  // console.log("Headers:", req.headers);
  next();
});

app.use("/logs", logRoutes);

app.use("/internal", adminRoutes);

app.use("/memberships", membershipRoutes)
app.use("/restaurants", restaurantRoutes)
app.use("/brands", brandRoutes)
app.use("/tables", tableRoutes)
app.use("/menu-categories", menuCategoryRoutes)
app.use("/menu-items", menuItemRoutes)
app.use("/availability", settingsRoutes)
app.use("/staff", staffRoutes)
app.use("/onboarding", onboardingRoutes)
app.use("/business-workspace", businessWorkspaceRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/discovery", discoveryRoutes);
app.use("/booking/public/availability", availabilityRoutes);
app.use("/booking", bookingRoutes);
app.use("/layouts", layoutRoutes);
app.use("/pricing", pricingRoutes);



export default app;