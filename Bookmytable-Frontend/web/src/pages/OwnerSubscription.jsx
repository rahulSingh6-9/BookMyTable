import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Check, 
  Crown, 
  ReceiptText, 
  AlertTriangle, 
  ShieldAlert, 
  Calendar, 
  ArrowUpRight, 
  Zap, 
  RefreshCw, 
  Lock, 
  Users, 
  Grid, 
  MapPin, 
  CalendarDays,
  FileText,
  LineChart,
  SlidersHorizontal,
  Building
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function OwnerSubscription() {
  // 1. Fetch Subscription Details
  const { 
    data: subscription, 
    isLoading: isSubLoading, 
    isError: isSubError, 
    refetch: refetchSub,
    isRefetching: isSubRefetching
  } = useQuery({
    queryKey: ["mySubscription"],
    queryFn: async () => {
      const res = await apiClient.get("/restaurants/subscriptions/my-subscription");
      return res.data?.data;
    },
  });

  // 2. Fetch Active Usage
  const { 
    data: usagePayload, 
    isLoading: isUsageLoading, 
    isError: isUsageError, 
    refetch: refetchUsage,
    isRefetching: isUsageRefetching
  } = useQuery({
    queryKey: ["myUsage"],
    queryFn: async () => {
      const res = await apiClient.get("/restaurants/subscriptions/my-usage");
      return res.data?.data;
    },
  });

  // 3. Fetch Billing Invoices History
  const {
    data: invoiceHistory = [],
    isLoading: isInvoicesLoading
  } = useQuery({
    queryKey: ["myInvoices"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/restaurants/subscriptions/my-subscription");
        const subId = res.data?.data?._id;
        if (!subId) return [];
        // Optional: query local billing records
        const billingRes = await apiClient.get(`/restaurants/subscriptions/my-usage`);
        return billingRes.data?.invoices || [];
      } catch {
        return [];
      }
    }
  });

  const isLoading = isSubLoading || isUsageLoading || isInvoicesLoading;
  const isError = isSubError || isUsageError;

  const handleRefresh = () => {
    refetchSub();
    refetchUsage();
  };

  // Derive Trial Info
  const trialDaysRemaining = useMemo(() => {
    if (!subscription || subscription.status !== "trial") return 0;
    const end = new Date(subscription.trialEndsAt || subscription.expiresAt);
    const diffTime = end.getTime() - Date.now();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [subscription]);

  // Format Status Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "trial":
        return <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 capitalize font-semibold">Free Trial</Badge>;
      case "active":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 capitalize font-semibold">Active</Badge>;
      case "past_due":
        return <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 capitalize font-semibold animate-pulse">Payment Due</Badge>;
      case "suspended":
        return <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 capitalize font-semibold">Suspended</Badge>;
      case "expired":
        return <Badge className="bg-gray-500/10 text-gray-500 border border-gray-500/20 capitalize font-semibold">Expired</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500 border border-gray-500/20 capitalize font-semibold">{status}</Badge>;
    }
  };

  // Calculate percentages and statuses for limits
  const usage = usagePayload?.usage || {};
  const limits = usagePayload?.limits || {};

  const metrics = [
    {
      title: "Branches",
      icon: MapPin,
      used: usage.branchesUsed || 0,
      max: limits.maxBranches || 1,
      limitKey: "maxBranches"
    },
    {
      title: "Dining Tables",
      icon: Grid,
      used: usage.tablesUsed || 0,
      max: limits.maxTables || 10,
      limitKey: "maxTables"
    },
    {
      title: "Staff Members",
      icon: Users,
      used: usage.staffUsed || 0,
      max: limits.maxStaff || 3,
      limitKey: "maxStaff"
    },
    {
      title: "Monthly Reservations",
      icon: CalendarDays,
      used: usage.reservationsThisMonth || 0,
      max: limits.maxReservationsPerMonth || 100,
      limitKey: "maxReservationsPerMonth"
    }
  ];

  // Features mapping
  const featuresList = [
    { key: "analytics", label: "Analytics Dashboard", desc: "Detailed reservation analytics and guest tracking." },
    { key: "qrOrdering", label: "QR Code Ordering", desc: "Contactless tableside QR menu ordering." },
    { key: "loyaltyProgram", label: "Loyalty Program & Promos", desc: "Keep guests returning with digital rewards." },
    { key: "customBranding", label: "Custom White-label Branding", desc: "Remove BookMyTable tags from booking links." },
    { key: "multiBranchHQ", label: "Multi-branch Management HQ", desc: "Manage operational menus across multiple cities." },
    { key: "prioritySupport", label: "24/7 Priority Support", desc: "Dedicated account support representative." }
  ];

  const planFeatures = subscription?.subscriptionPlanId?.features || {};

  if (isLoading) {
    return (
      <div className="w-full min-h-screen p-8 space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded"></div>
            <div className="h-4 w-72 bg-muted rounded"></div>
          </div>
          <div className="h-10 w-24 bg-muted rounded"></div>
        </div>
        <div className="h-16 w-full max-w-md bg-muted rounded-xl"></div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 bg-muted rounded-xl"></div>
          <div className="h-64 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full mb-4">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Subscription Loading Error</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          We encountered an issue synchronizing your current SaaS subscription model. Please verify that your brand onboarding is fully completed.
        </p>
        <div className="flex gap-4">
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry Connection
          </Button>
          <Link to="/onboarding">
            <Button>Complete Onboarding</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if any limits are breached or close (>= 90%)
  const highUsageMetrics = metrics.filter(m => (m.used / m.max) >= 0.9);

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              Subscription Management
              {(isSubRefetching || isUsageRefetching) && (
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </h1>
            <p className="text-muted-foreground mt-1">Manage your brand billing cycle, monitor resource limits, and upgrade feature access.</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="gap-2 border-border shadow-sm h-10">
            <RefreshCw className="h-4 w-4" /> Refresh Status
          </Button>
        </div>

        {/* Expiry Warning Banner for Trials */}
        {subscription?.status === "trial" && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-5 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm",
              trialDaysRemaining <= 7 
                ? "bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-200" 
                : "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200"
            )}
          >
            <div className="flex items-center gap-3.5 text-left w-full md:w-auto">
              <div className={cn(
                "p-2.5 rounded-lg", 
                trialDaysRemaining <= 7 ? "bg-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
              )}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Your Free Trial ends in {trialDaysRemaining} days!</h4>
                <p className="text-sm opacity-90">
                  {trialDaysRemaining <= 7 
                    ? "Upgrade now to avoid immediate disruption to your reservations and branch operations." 
                    : "Unlock advanced layouts, tableside QR ordering, and custom customer branding by upgrading."}
                </p>
              </div>
            </div>
            <Link to="/pricing" className="w-full md:w-auto">
              <Button className={cn(
                "w-full md:w-auto font-semibold gap-2 shadow-sm text-white",
                trialDaysRemaining <= 7 ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"
              )}>
                <Zap className="h-4 w-4" /> Upgrade to Pro
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Approaching Limit Warning */}
        {highUsageMetrics.length > 0 && subscription?.status !== "trial" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 rounded-xl flex items-start gap-3"
          >
            <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="font-semibold">Resource Warning:</span> You are approaching limits for {" "}
              {highUsageMetrics.map((m, idx) => (
                <strong key={m.title} className="font-bold">
                  {m.title} ({m.used}/{m.max}){idx < highUsageMetrics.length - 1 ? ", " : ""}
                </strong>
              ))}. Consider upgrading your subscription plan to expand capabilities.
            </div>
          </motion.div>
        )}

        {/* TABS IMPLEMENTATION */}
        <Tabs defaultValue="overview" className="w-full pt-4">
          
          <div className="flex w-full mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="h-12 bg-muted/30 p-1.5 rounded-xl border border-border/50 shrink-0">
              <TabsTrigger value="overview" className="h-9 px-5 rounded-lg flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                <LineChart className="w-4 h-4" /> <span className="font-semibold">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="configuration" className="h-9 px-5 rounded-lg flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                <SlidersHorizontal className="w-4 h-4" /> <span className="font-semibold">Configuration</span>
              </TabsTrigger>
              <TabsTrigger value="bank" className="h-9 px-5 rounded-lg flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                <Building className="w-4 h-4" /> <span className="font-semibold">Bank & Health</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6 focus-visible:outline-none animate-in fade-in duration-500">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Card 1: Subscription Overview */}
              <Card className="shadow-sm border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2.5">
                      <Crown className="h-5 w-5 text-primary" />
                      Subscription Overview
                    </CardTitle>
                    <CardDescription>Your active contract parameters and workspace plan.</CardDescription>
                  </div>
                  {getStatusBadge(subscription?.status)}
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Current Plan</span>
                      <span className="font-semibold text-foreground text-base">{subscription?.subscriptionPlanId?.name || "Trial Tier"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Billing Cycle</span>
                      <span className="font-medium text-foreground capitalize">{subscription?.billingCycle || "Monthly"}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" /> Next Renewal
                      </span>
                      <span className="font-semibold text-foreground">
                        {subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'long', day: 'numeric'
                        }) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Auto-Renewal</span>
                      <Badge variant={subscription?.autoRenew ? "default" : "outline"} className="text-xs">
                        {subscription?.autoRenew ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Resource Analytics and Usage */}
              <Card className="shadow-sm border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Resource Limits & Usage</CardTitle>
                  <CardDescription>Dynamic usage metrics aggregated across all active dining branches.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  {metrics.map((metric) => {
                    const percent = Math.min(100, Math.round((metric.used / metric.max) * 100));
                    const isNearLimit = percent >= 90;
                    const isBreached = metric.used > metric.max;

                    return (
                      <div key={metric.title} className="p-4 rounded-xl border border-border bg-muted/30 space-y-3 hover:border-primary/20 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <metric.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-sm">{metric.title}</span>
                          </div>
                          <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full border",
                            isBreached 
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20" 
                              : isNearLimit 
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                                : "bg-primary/10 text-primary border-primary/20"
                          )}>
                            {metric.used} / {metric.max}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isBreached 
                                ? "bg-rose-500" 
                                : isNearLimit 
                                  ? "bg-amber-500" 
                                  : "bg-primary"
                            )} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{percent}% Consumed</span>
                          {isBreached ? (
                            <span className="text-rose-500 font-medium">Limit Breached!</span>
                          ) : isNearLimit ? (
                            <span className="text-amber-500 font-medium">Approaching Limit</span>
                          ) : (
                            <span>Within Limits</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: CONFIGURATION */}
          <TabsContent value="configuration" className="space-y-6 focus-visible:outline-none animate-in fade-in duration-500">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
              {/* Feature Matrix Access */}
              <Card className="shadow-sm border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Feature Access Control</CardTitle>
                  <CardDescription>Features enabled on your brand level subscription plan.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {featuresList.map((feature) => {
                    const isEnabled = !!planFeatures[feature.key] || planFeatures[feature.key] === true;

                    return (
                      <div 
                        key={feature.key} 
                        className={cn(
                          "p-4 rounded-xl border flex items-start gap-3.5 transition-all hover:border-primary/30 cursor-default",
                          isEnabled 
                            ? "bg-card border-border shadow-xs" 
                            : "bg-muted/30 border-dashed border-border opacity-70"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg mt-0.5",
                          isEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                        )}>
                          {isEnabled ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-semibold text-sm flex items-center gap-1.5">
                            {feature.label}
                            {!isEnabled && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">Locked</Badge>
                            )}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Upgrade Limits Panel */}
              <Card className="shadow-sm border-border bg-card flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Need to upgrade limits?</CardTitle>
                  <CardDescription>Choose a premium plan to expand branch nodes, staff seats, and guest capacity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-3 flex-1">
                    <h4 className="font-semibold text-sm flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-primary" /> Pro Plan Highlights
                    </h4>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-accent" /> Up to 5 branches
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-accent" /> Up to 100 Dining Tables
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-accent" /> Custom Guest QR Code Ordering
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-accent" /> 24/7 Priority Support SLAs
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Link to="/pricing">
                      <Button className="w-full gap-2 shadow-sm font-semibold text-white bg-primary hover:bg-primary/90">
                        View Pricing Plans <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Separator className="my-3" />
                    <div className="text-[11px] text-muted-foreground leading-relaxed text-center">
                      By clicking to upgrade, you'll be redirected to the public pricing details. Upgrading recalculates and shifts your quotas immediately.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: BANK & HEALTH */}
          <TabsContent value="bank" className="space-y-6 focus-visible:outline-none animate-in fade-in duration-500">
            <Card className="shadow-sm border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ReceiptText className="h-5 w-5 text-primary" />
                  Billing History
                </CardTitle>
                <CardDescription>View recent invoices and digital payments generated for your brand.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold">Invoice ID</TableHead>
                        <TableHead className="font-bold">Invoice Date</TableHead>
                        <TableHead className="font-bold">Charge Amount</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceHistory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center text-muted-foreground text-sm">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <FileText className="h-10 w-10 text-muted-foreground/40 mb-1" />
                              <span className="font-medium text-foreground">No invoice records found</span>
                              <span className="text-xs opacity-75">Your billing history will appear here once paid plans activate.</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        invoiceHistory.map((row) => (
                          <TableRow key={row.id} className="hover:bg-muted/10 transition-colors">
                            <TableCell className="font-mono text-xs text-foreground font-semibold">{row.id}</TableCell>
                            <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium text-foreground">{row.amount}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5">
                                {row.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}
