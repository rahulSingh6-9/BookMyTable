import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useBrand } from "@/context/BrandContext";
import {
  getMySubscription,
  getMyUsage,
  getMyFeatures,
} from "@/services/subscription.service";
import { getBrandLogs } from "@/services/logs.service";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Table2,
  Users,
  Store,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  LineChart,
  Sparkles,
} from "lucide-react";

export default function OwnerPlanUsageSettings() {
  const { activeBrand } = useBrand();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    subscription: null,
    usage: null,
    limits: null,
    features: null,
    logs: [],
  });

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      if (!activeBrand?.id) return;
      try {
        setLoading(true);
        const [subRes, usageRes, featuresRes, logsRes] = await Promise.all([
          getMySubscription(),
          getMyUsage(),
          getMyFeatures(),
          getBrandLogs(activeBrand.id, { limit: 4 }),
        ]);

        setData({
          subscription: subRes.data || subRes,
          usage: usageRes.data?.usage || usageRes.usage || {},
          limits: usageRes.data?.limits || usageRes.limits || {},
          features: featuresRes.data || featuresRes || {},
          logs: logsRes.data?.docs || logsRes.data || [],
        });
      } catch (error) {
        console.error("Failed to fetch plan and usage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeBrand]);

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-64 rounded-2xl lg:col-span-1" />
          <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  const { subscription, usage, limits, features, logs } = data;
  const safeUsage = usage || {};
  const safeLimits = limits || {};
  const plan = subscription?.subscriptionPlanId || {};

  // Usage calculations
  const tablesUsed = safeUsage.tablesUsed || 0;
  const tablesLimit = safeLimits.maxTables || 0;
  const tablesPct = tablesLimit > 0 ? (tablesUsed / tablesLimit) * 100 : 0;

  const staffUsed = safeUsage.staffUsed || 0;
  const staffLimit = safeLimits.maxStaff || 0;
  const staffPct = staffLimit > 0 ? (staffUsed / staffLimit) * 100 : 0;

  const branchesUsed = safeUsage.branchesUsed || 0;
  const branchesLimit = safeLimits.maxBranches || 0;
  const branchesPct =
    branchesLimit > 0 ? (branchesUsed / branchesLimit) * 100 : 0;

  const resUsed = safeUsage.reservationsThisMonth || 0;
  const resLimit = safeLimits.maxReservationsPerMonth || 0;
  const resPct = resLimit > 0 ? (resUsed / resLimit) * 100 : 0;

  // Determine approaching limits (>= 80%)
  const isApproachingTableLimit = tablesPct >= 80;
  const isApproachingStaffLimit = staffPct >= 80;
  const isApproachingBranchLimit = branchesPct >= 80;
  const isApproachingResLimit = resPct >= 80;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* SECTION 1: PLAN HERO CARD */}
      <Card className="rounded-2xl border-border shadow-sm overflow-hidden bg-gradient-to-br from-card to-muted/20">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                {plan.name || "Unknown Plan"}
              </h1>
              <Badge
                className={
                  subscription?.status === "active"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-amber-100 text-amber-700 border-amber-200"
                }
              >
                {subscription?.status
                  ? subscription.status.toUpperCase()
                  : "UNKNOWN"}
              </Badge>
            </div>
            <p className="text-muted-foreground pt-2">
              Your plan will automatically renew on{" "}
              <span className="font-semibold text-foreground">
                {subscription?.expiresAt
                  ? format(new Date(subscription.expiresAt), "MMM d, yyyy")
                  : "N/A"}
              </span>
              .
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button variant="outline" className="w-full sm:w-auto font-medium">
              View Billing History
            </Button>
            <Button className="w-full sm:w-auto font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SEGMENTED TAB BAR */}
      <div className="flex flex-wrap items-center gap-1 bg-muted/50 p-1.5 rounded-2xl w-fit border border-border/50">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === "overview" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
        >
          <LineChart className="w-4 h-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab("features")}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === "features" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
        >
          <Sparkles className="w-4 h-4" /> Plan Features
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === "activity" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
        >
          <Clock className="w-4 h-4" /> Recent Activity
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* SECTION 4: LIMIT WARNINGS */}
            {isApproachingTableLimit && (
              <Alert className="bg-amber-50 border-amber-200 text-amber-800 rounded-xl shadow-sm">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <AlertTitle className="text-amber-800 font-bold">
                  Approaching Table Limit
                </AlertTitle>
                <AlertDescription className="text-amber-700/90 text-sm mt-1">
                  You have used {tablesUsed} out of your {tablesLimit} table
                  limit. Consider upgrading your plan to expand.
                </AlertDescription>
              </Alert>
            )}

            {/* SECTION 2: RESOURCE USAGE GRID */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                Resource Usage
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Usage Card: Tables */}
                <Card className="rounded-xl shadow-sm border-border">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <Table2 className="w-4 h-4 text-primary" />
                      Tables
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-2xl font-bold">
                        {tablesUsed}{" "}
                        <span className="text-sm text-muted-foreground font-medium">
                          / {tablesLimit}
                        </span>
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${isApproachingTableLimit ? "text-amber-600 bg-amber-50 border-amber-200" : "text-emerald-600 bg-emerald-50 border-emerald-200"}`}
                      >
                        {Math.max(0, tablesLimit - tablesUsed)} Remaining
                      </span>
                    </div>
                    <Progress
                      value={tablesPct}
                      className={`h-2 bg-muted indicator-${isApproachingTableLimit ? "amber" : "emerald"}-500`}
                      indicatorcolor={`bg-${isApproachingTableLimit ? "amber" : "emerald"}-500`}
                    />
                  </CardContent>
                </Card>

                {/* Usage Card: Staff */}
                <Card className="rounded-xl shadow-sm border-border">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4 text-blue-500" />
                      Staff Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-2xl font-bold">
                        {staffUsed}{" "}
                        <span className="text-sm text-muted-foreground font-medium">
                          / {staffLimit}
                        </span>
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${isApproachingStaffLimit ? "text-amber-600 bg-amber-50 border-amber-200" : "text-emerald-600 bg-emerald-50 border-emerald-200"}`}
                      >
                        {Math.max(0, staffLimit - staffUsed)} Remaining
                      </span>
                    </div>
                    <Progress
                      value={staffPct}
                      className={`h-2 bg-muted indicator-${isApproachingStaffLimit ? "amber" : "emerald"}-500`}
                      indicatorcolor={`bg-${isApproachingStaffLimit ? "amber" : "emerald"}-500`}
                    />
                  </CardContent>
                </Card>

                {/* Usage Card: Reservations */}
                <Card className="rounded-xl shadow-sm border-border">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                      <CalendarCheck className="w-4 h-4 text-pink-500" />
                      Reservations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-2xl font-bold">
                        {resUsed}{" "}
                        <span className="text-sm text-muted-foreground font-medium">
                          / {resLimit}
                        </span>
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${isApproachingResLimit ? "text-amber-600 bg-amber-50 border-amber-200" : "text-emerald-600 bg-emerald-50 border-emerald-200"}`}
                      >
                        {Math.max(0, resLimit - resUsed)} Remaining
                      </span>
                    </div>
                    <Progress
                      value={resPct}
                      className={`h-2 bg-muted indicator-${isApproachingResLimit ? "amber" : "emerald"}-500`}
                      indicatorcolor={`bg-${isApproachingResLimit ? "amber" : "emerald"}-500`}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Recent Activity
            </h2>
            <Card className="rounded-xl border-border shadow-sm overflow-hidden h-full">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {logs && logs.length > 0 ? (
                    logs
                      .filter(
                        (log) =>
                          log.action.includes("SUBSCRIPTION") ||
                          log.action.includes("PLAN") ||
                          log.action.includes("CREATED") ||
                          log.action.includes("UPDATED") ||
                          log.action.includes("DELETED"),
                      )
                      .slice(0, 4)
                      .map((log, index) => (
                        <div
                          key={log._id || index}
                          className="p-4 flex items-start gap-4 hover:bg-muted/5 transition-colors"
                        >
                          <div className="bg-emerald-100 p-1.5 rounded-full mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold capitalize">
                              {log.action.replace(/_/g, " ").toLowerCase()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(
                                new Date(log.createdAt),
                                "MMM d 'at' h:mm a",
                              )}
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No recent activity found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "features" && (
          <motion.div
            key="features"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Plan Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                className={`rounded-xl shadow-sm ${features?.analytics ? "border-emerald-100 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50 opacity-70"}`}
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span
                      className={`block text-sm font-bold ${features?.analytics ? "text-emerald-950" : "text-slate-700"}`}
                    >
                      Advanced Analytics
                    </span>
                    <span
                      className={`block text-xs mt-0.5 ${features?.analytics ? "text-emerald-700/80" : "text-slate-500"}`}
                    >
                      Detailed reporting tools
                    </span>
                  </div>
                  {features?.analytics ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400" />
                  )}
                </CardContent>
              </Card>

              <Card
                className={`rounded-xl shadow-sm ${features?.qrOrdering ? "border-emerald-100 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50 opacity-70"}`}
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span
                      className={`block text-sm font-bold ${features?.qrOrdering ? "text-emerald-950" : "text-slate-700"}`}
                    >
                      QR Ordering
                    </span>
                    <span
                      className={`block text-xs mt-0.5 ${features?.qrOrdering ? "text-emerald-700/80" : "text-slate-500"}`}
                    >
                      Tableside digital menus
                    </span>
                  </div>
                  {features?.qrOrdering ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400" />
                  )}
                </CardContent>
              </Card>

              <Card
                className={`rounded-xl shadow-sm ${features?.loyaltyProgram ? "border-emerald-100 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50 opacity-70"}`}
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span
                      className={`block text-sm font-bold ${features?.loyaltyProgram ? "text-emerald-950" : "text-slate-700"}`}
                    >
                      Loyalty Program
                    </span>
                    <span
                      className={`block text-xs mt-0.5 ${features?.loyaltyProgram ? "text-emerald-700/80" : "text-slate-500"}`}
                    >
                      Customer retention
                    </span>
                  </div>
                  {features?.loyaltyProgram ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400" />
                  )}
                </CardContent>
              </Card>

              <Card
                className={`rounded-xl shadow-sm ${features?.customBranding ? "border-emerald-100 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50 opacity-70"}`}
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span
                      className={`block text-sm font-bold ${features?.customBranding ? "text-emerald-950" : "text-slate-700"}`}
                    >
                      Custom Branding
                    </span>
                    <span
                      className={`block text-xs mt-0.5 ${features?.customBranding ? "text-emerald-700/80" : "text-slate-500"}`}
                    >
                      White-label your page
                    </span>
                  </div>
                  {features?.customBranding ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400" />
                  )}
                </CardContent>
              </Card>

              <Card
                className={`rounded-xl shadow-sm ${features?.multiBranchSupport ? "border-emerald-100 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50 opacity-70"}`}
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span
                      className={`block text-sm font-bold ${features?.multiBranchSupport ? "text-emerald-950" : "text-slate-700"}`}
                    >
                      Multi-Branch
                    </span>
                    <span
                      className={`block text-xs mt-0.5 ${features?.multiBranchSupport ? "text-emerald-700/80" : "text-slate-500"}`}
                    >
                      Manage multiple entities
                    </span>
                  </div>
                  {features?.multiBranchSupport ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400" />
                  )}
                </CardContent>
              </Card>

              <Card
                className={`rounded-xl shadow-sm ${features?.prioritySupport ? "border-emerald-100 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50 opacity-70"}`}
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span
                      className={`block text-sm font-bold ${features?.prioritySupport ? "text-emerald-950" : "text-slate-700"}`}
                    >
                      Priority Support
                    </span>
                    <span
                      className={`block text-xs mt-0.5 ${features?.prioritySupport ? "text-emerald-700/80" : "text-slate-500"}`}
                    >
                      24/7 phone support
                    </span>
                  </div>
                  {features?.prioritySupport ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400" />
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
