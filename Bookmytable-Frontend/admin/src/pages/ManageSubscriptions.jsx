import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Plus,
  Wrench,
  History,
  ShieldCheck,
  Zap,
  Clock,
  Ban,
  Activity,
  Award,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubscriptionPlans,
  getActiveSubscriptions,
  getBillingHistory,
  getOverridesHistory,
  getDashboardStats,
  createSubscriptionPlan,
  applySubscriptionOverride,
} from "@/services/subscription.service";
import { toast } from "sonner";

export default function ManageSubscriptions() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dialog States
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedBrandSub, setSelectedBrandSub] = useState(null);

  // Form states - Plan creation
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    pricingMonthly: 0,
    pricingYearly: 0,
    maxBranches: 1,
    maxTables: 15,
    maxStaff: 5,
    maxReservations: 100,
    analytics: false,
    qrOrdering: false,
    loyaltyProgram: false,
    customBranding: false,
    multiBranchSupport: false,
    prioritySupport: false,
    isTrialPlan: false,
    trialDays: 0,
  });

  // Form states - Override application
  const [overrideData, setOverrideData] = useState({
    overrideType: "trial_extension",
    reason: "",
    extendDays: "15",
    durationDays: "30",
    graceDays: "7",
    targetPlanId: "",
    amountCharge: "0",
  });

  // Queries
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["subscription-stats"],
    queryFn: getDashboardStats,
  });

  const { data: plansData, isLoading: isPlansLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: getSubscriptionPlans,
  });

  const { data: activeSubsData, isLoading: isSubsLoading } = useQuery({
    queryKey: ["active-subscriptions"],
    queryFn: getActiveSubscriptions,
  });

  const { data: billingData, isLoading: isBillingLoading } = useQuery({
    queryKey: ["billing-history"],
    queryFn: getBillingHistory,
  });

  const { data: overridesData, isLoading: isOverridesLoading } = useQuery({
    queryKey: ["overrides-history"],
    queryFn: getOverridesHistory,
  });

  // Mutations
  const createPlanMutation = useMutation({
    mutationFn: createSubscriptionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-stats"] });
      toast.success("Subscription plan created successfully!");
      setIsPlanModalOpen(false);
      // Reset plan form
      setNewPlan({
        name: "",
        description: "",
        pricingMonthly: 0,
        pricingYearly: 0,
        maxBranches: 1,
        maxTables: 15,
        maxStaff: 5,
        maxReservations: 100,
        analytics: false,
        qrOrdering: false,
        loyaltyProgram: false,
        customBranding: false,
        multiBranchSupport: false,
        prioritySupport: false,
        isTrialPlan: false,
        trialDays: 0,
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create plan");
    },
  });

  const applyOverrideMutation = useMutation({
    mutationFn: applySubscriptionOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["overrides-history"] });
      queryClient.invalidateQueries({ queryKey: ["billing-history"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-stats"] });
      toast.success("Manual subscription override applied successfully!");
      setIsOverrideModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to apply override");
    },
  });

  const handleCreatePlan = (e) => {
    e.preventDefault();
    const payload = {
      name: newPlan.name,
      description: newPlan.description,
      pricing: {
        monthly: Number(newPlan.pricingMonthly),
        yearly: Number(newPlan.pricingYearly),
      },
      limits: {
        maxBranches: Number(newPlan.maxBranches),
        maxTables: Number(newPlan.maxTables),
        maxStaff: Number(newPlan.maxStaff),
        maxReservationsPerMonth: Number(newPlan.maxReservations),
      },
      features: {
        analytics: newPlan.analytics,
        qrOrdering: newPlan.qrOrdering,
        loyaltyProgram: newPlan.loyaltyProgram,
        customBranding: newPlan.customBranding,
        multiBranchSupport: newPlan.multiBranchSupport,
        prioritySupport: newPlan.prioritySupport,
      },
      isTrialPlan: newPlan.isTrialPlan,
      trialDays: Number(newPlan.trialDays),
    };
    createPlanMutation.mutate(payload);
  };

  const handleApplyOverride = (e) => {
    e.preventDefault();
    if (!selectedBrandSub) return;

    const details = {};
    if (overrideData.overrideType === "trial_extension") {
      details.extendDays = overrideData.extendDays;
    } else if (overrideData.overrideType === "temporary_upgrade" || overrideData.overrideType === "downgrade") {
      details.planId = overrideData.targetPlanId;
      details.durationDays = overrideData.durationDays;
      details.amountCharge = overrideData.amountCharge;
    } else if (overrideData.overrideType === "reactivate") {
      details.extendDays = overrideData.extendDays;
      details.amountCharge = overrideData.amountCharge;
    } else if (overrideData.overrideType === "grace_period") {
      details.graceDays = overrideData.graceDays;
    }

    const payload = {
      brandId: selectedBrandSub.brandId?._id || selectedBrandSub.brandId,
      overrideType: overrideData.overrideType,
      reason: overrideData.reason,
      details,
    };

    applyOverrideMutation.mutate(payload);
  };

  const openOverrideModal = (row) => {
    setSelectedBrandSub(row);
    setOverrideData({
      overrideType: "trial_extension",
      reason: "",
      extendDays: "15",
      durationDays: "30",
      graceDays: "7",
      targetPlanId: plansData?.data?.data?.[0]?._id || "",
      amountCharge: "0",
    });
    setIsOverrideModalOpen(true);
  };

  // UI Helpers
  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-full px-3 py-1 font-semibold">Active</Badge>;
      case "trial":
        return <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded-full px-3 py-1 font-semibold">Free Trial</Badge>;
      case "suspended":
        return <Badge variant="destructive" className="rounded-full px-3 py-1 font-semibold">Suspended</Badge>;
      case "expired":
      case "cancelled":
        return <Badge className="bg-amber-500 text-white rounded-full px-3 py-1 font-semibold">Expired</Badge>;
      default:
        return <Badge variant="outline" className="rounded-full px-3 py-1 font-semibold">{status}</Badge>;
    }
  };

  const stats = statsData?.data?.data || {
    plansCount: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    suspendedSubscriptions: 0,
    expiredSubscriptions: 0,
    totalRevenue: 0,
    overridesCount: 0,
    planBreakdown: {},
  };

  const activeSubs =
    activeSubsData?.data?.data?.map((s) => ({
      ...s,
      brandName: s.brandId?.name || "Deleted Brand",
      planName: s.subscriptionPlanId?.name || "Unknown Plan",
      expiryDate: new Date(s.expiresAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      statusLabel: s.status,
    })) || [];

  const billings =
    billingData?.data?.data?.map((b) => ({
      ...b,
      brandName: b.brandId?.name || "Unknown Brand",
      planName: b.subscriptionId?.subscriptionPlanId?.name || "Subscription Plan",
      amountFormatted: formatCurrency(b.amount),
      dateFormatted: new Date(b.paidAt || b.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    })) || [];

  const overrides =
    overridesData?.data?.data?.map((o) => ({
      ...o,
      brandName: o.brandId?.name || "Deleted Brand",
      typeLabel: o.overrideType.replace(/_/g, " ").toUpperCase(),
      dateFormatted: new Date(o.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    })) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animation-fade-in p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="SaaS Subscriptions"
          description="Enterprise plan management, manual override systems, billing logs, and usage guardrails."
        />
        <div className="flex items-center gap-3">
          <Button
            className="shadow-md bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white rounded-xl gap-2 font-medium px-4"
            onClick={() => setIsPlanModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Create Plan
          </Button>
        </div>
      </div>

      {/* Modern Dashboard Statistics */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Total Revenue</p>
                  <h3 className="text-3xl font-bold tracking-tight text-foreground mt-2">{formatCurrency(stats.totalRevenue)}</h3>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950 rounded-2xl text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5" /> Synchronized with Billing model
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Active Subscriptions</p>
                  <h3 className="text-3xl font-bold tracking-tight text-foreground mt-2">{stats.activeSubscriptions}</h3>
                </div>
                <div className="p-3 bg-indigo-100 dark:bg-indigo-950 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-indigo-600">
                <Clock className="w-3.5 h-3.5" /> {stats.trialSubscriptions} on Free Trial
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Manual Overrides</p>
                  <h3 className="text-3xl font-bold tracking-tight text-foreground mt-2">{stats.overridesCount}</h3>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-950 rounded-2xl text-amber-600 dark:text-amber-400">
                  <Wrench className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-amber-600">
                <Activity className="w-3.5 h-3.5" /> Full audit logs recorded
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Active Plans</p>
                  <h3 className="text-3xl font-bold tracking-tight text-foreground mt-2">{stats.plansCount}</h3>
                </div>
                <div className="p-3 bg-rose-100 dark:bg-rose-950 rounded-2xl text-rose-600 dark:text-rose-400">
                  <Award className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-rose-600">
                <Check className="w-3.5 h-3.5" /> 1 Trial Plan registered
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs Container */}
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/80 p-1 rounded-2xl border flex flex-wrap gap-1 h-auto max-w-fit">
          <TabsTrigger value="dashboard" className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
            Overview Stats
          </TabsTrigger>
          <TabsTrigger value="plans" className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
            Plans Catalog
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
            Brand Subscriptions
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
            Invoice Logs
          </TabsTrigger>
          <TabsTrigger value="overrides" className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">
            Audit Overrides
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Analytics View */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/40 bg-white/70 dark:bg-slate-950/70 backdrop-blur shadow-sm">
              <CardHeader>
                <CardTitle>Plan Breakdown</CardTitle>
                <CardDescription>Visual breakdown of registered restaurant brands per subscription tier.</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex flex-col justify-center gap-4">
                {Object.keys(stats.planBreakdown).length === 0 ? (
                  <p className="text-center text-muted-foreground">No subscriber breakdown metrics available.</p>
                ) : (
                  Object.entries(stats.planBreakdown).map(([planName, count]) => (
                    <div key={planName} className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                        <span>{planName}</span>
                        <span>{count} Subscriptions</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (count / (stats.totalSubscriptions || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-white/70 dark:bg-slate-950/70 backdrop-blur shadow-sm">
              <CardHeader>
                <CardTitle>SaaS Usage Guards</CardTitle>
                <CardDescription>Hard limit thresholds enforced dynamically on restaurant operations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl">
                  <div className="p-2 bg-indigo-200 dark:bg-indigo-900 rounded-lg text-indigo-700 dark:text-indigo-300">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Branches Limit</h4>
                    <p className="text-xs text-muted-foreground">Checks maximum active branches of brand</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl">
                  <div className="p-2 bg-emerald-200 dark:bg-emerald-900 rounded-lg text-emerald-700 dark:text-emerald-300">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Table Code Guard</h4>
                    <p className="text-xs text-muted-foreground">Blocks adding branch tables if plan capacity exceeded</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl">
                  <div className="p-2 bg-amber-200 dark:bg-amber-900 rounded-lg text-amber-700 dark:text-amber-300">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Staff Limit Controls</h4>
                    <p className="text-xs text-muted-foreground">Inviting branch staff triggers subscription limits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans">
          {isPlansLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plansData?.data?.data?.map((plan) => (
                <Card key={plan._id} className="border-border/40 shadow-sm hover:shadow-md transition-all flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xl">{plan.name}</h3>
                      {plan.isTrialPlan && (
                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 rounded-full font-semibold border-indigo-200">
                          Trial Plan ({plan.trialDays} Days)
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-baseline gap-1 py-2 border-b">
                        <span className="text-2xl font-bold">{formatCurrency(plan.pricing.monthly)}</span>
                        <span className="text-xs text-muted-foreground">/ month</span>
                        <span className="text-sm font-semibold ml-auto text-primary">{formatCurrency(plan.pricing.yearly)}/year</span>
                      </div>
                      
                      <div className="space-y-3 mt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Limits & Guardrails</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-foreground font-medium">
                          <div>🏢 Max Branches: {plan.limits.maxBranches}</div>
                          <div>🪑 Max Tables: {plan.limits.maxTables}</div>
                          <div>🧑‍🍳 Max Staff: {plan.limits.maxStaff}</div>
                          <div>📅 Monthly Bookings: {plan.limits.maxReservationsPerMonth}</div>
                        </div>
                      </div>

                      <div className="space-y-2 mt-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enabled Features</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(plan.features).map(([feat, enabled]) => (
                            <div key={feat} className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                              {enabled ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-rose-400" />
                              )}
                              <span className="capitalize">{feat.replace(/([A-Z])/g, " $1")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          {isSubsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <DataTable
              columns={[
                {
                  header: "Brand Name",
                  accessorKey: "brandName",
                  cell: (row) => <div className="font-semibold text-foreground">{row.brandName}</div>,
                },
                {
                  header: "Plan Tier",
                  accessorKey: "planName",
                  cell: (row) => <Badge variant="outline" className="font-bold border-indigo-200 text-indigo-700 bg-indigo-50/50">{row.planName}</Badge>,
                },
                {
                  header: "Billing Cycle",
                  accessorKey: "billingCycle",
                  cell: (row) => <span className="capitalize">{row.billingCycle}</span>,
                },
                {
                  header: "Expiry Date",
                  accessorKey: "expiryDate",
                },
                {
                  header: "Status",
                  accessorKey: "statusLabel",
                  cell: (row) => getStatusBadge(row.status),
                },
                {
                  header: "Actions",
                  accessorKey: "id",
                  cell: (row) => (
                    <Button
                      variant="outline"
                      className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl gap-1.5 font-medium text-xs px-3 h-8 shadow-sm"
                      onClick={() => openOverrideModal(row)}
                    >
                      <Wrench className="w-3 h-3" /> Override
                    </Button>
                  ),
                },
              ]}
              data={activeSubs}
            />
          )}
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          {isBillingLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <DataTable
              columns={[
                {
                  header: "Brand Name",
                  accessorKey: "brandName",
                  cell: (row) => <div className="font-semibold text-foreground">{row.brandName}</div>,
                },
                {
                  header: "Amount Paid",
                  accessorKey: "amountFormatted",
                  cell: (row) => <div className="font-bold text-foreground">{row.amountFormatted}</div>,
                },
                {
                  header: "Payment status",
                  accessorKey: "paymentStatus",
                  cell: (row) => (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold border-none px-3 py-1">
                      {row.paymentStatus.toUpperCase()}
                    </Badge>
                  ),
                },
                {
                  header: "Payment Provider",
                  accessorKey: "paymentProvider",
                  cell: (row) => <span className="capitalize font-medium text-muted-foreground">{row.paymentProvider}</span>,
                },
                {
                  header: "Transaction ID",
                  accessorKey: "transactionId",
                  cell: (row) => <code className="text-xs bg-slate-100 p-1.5 rounded-lg border">{row.transactionId || "N/A"}</code>,
                },
                {
                  header: "Billing Date",
                  accessorKey: "dateFormatted",
                },
              ]}
              data={billings}
            />
          )}
        </TabsContent>

        {/* Overrides Tab */}
        <TabsContent value="overrides">
          {isOverridesLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <DataTable
              columns={[
                {
                  header: "Brand Name",
                  accessorKey: "brandName",
                  cell: (row) => <div className="font-semibold text-foreground">{row.brandName}</div>,
                },
                {
                  header: "Override Action",
                  accessorKey: "typeLabel",
                  cell: (row) => (
                    <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 font-bold px-3 py-1 rounded-full text-xs">
                      {row.typeLabel}
                    </Badge>
                  ),
                },
                {
                  header: "Reason for manual override",
                  accessorKey: "reason",
                },
                {
                  header: "Applied By Admin ID",
                  accessorKey: "appliedBy",
                  cell: (row) => <code className="text-xs bg-slate-100 p-1 rounded border">{row.appliedBy}</code>,
                },
                {
                  header: "Timestamp",
                  accessorKey: "dateFormatted",
                },
              ]}
              data={overrides}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* PLAN CREATION MODAL */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Plus className="w-6 h-6 text-primary" /> Create New Subscription Plan
            </DialogTitle>
            <DialogDescription>
              Define plan pricing, hard usage limits, and unlockable features for restaurant brands.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePlan} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planName" className="font-semibold">Plan Name</Label>
                <Input
                  id="planName"
                  placeholder="e.g. Professional Premium"
                  required
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planDesc" className="font-semibold">Description</Label>
                <Input
                  id="planDesc"
                  placeholder="Plan summary for marketing / info"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice" className="font-semibold">Monthly Price (INR)</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  required
                  value={newPlan.pricingMonthly}
                  onChange={(e) => setNewPlan({ ...newPlan, pricingMonthly: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearlyPrice" className="font-semibold">Yearly Price (INR)</Label>
                <Input
                  id="yearlyPrice"
                  type="number"
                  required
                  value={newPlan.pricingYearly}
                  onChange={(e) => setNewPlan({ ...newPlan, pricingYearly: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Usage Guardrails & Limits</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="maxBranches" className="text-xs font-semibold">Max Branches</Label>
                  <Input
                    id="maxBranches"
                    type="number"
                    required
                    value={newPlan.maxBranches}
                    onChange={(e) => setNewPlan({ ...newPlan, maxBranches: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maxTables" className="text-xs font-semibold">Max Tables</Label>
                  <Input
                    id="maxTables"
                    type="number"
                    required
                    value={newPlan.maxTables}
                    onChange={(e) => setNewPlan({ ...newPlan, maxTables: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maxStaff" className="text-xs font-semibold">Max Staff</Label>
                  <Input
                    id="maxStaff"
                    type="number"
                    required
                    value={newPlan.maxStaff}
                    onChange={(e) => setNewPlan({ ...newPlan, maxStaff: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maxReservations" className="text-xs font-semibold">Reservations/Mo</Label>
                  <Input
                    id="maxReservations"
                    type="number"
                    required
                    value={newPlan.maxReservations}
                    onChange={(e) => setNewPlan({ ...newPlan, maxReservations: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Feature Toggles</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="featAnalytics"
                    checked={newPlan.analytics}
                    onCheckedChange={(val) => setNewPlan({ ...newPlan, analytics: !!val })}
                  />
                  <Label htmlFor="featAnalytics" className="text-xs cursor-pointer font-medium">Analytics Engine</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="featQr"
                    checked={newPlan.qrOrdering}
                    onCheckedChange={(val) => setNewPlan({ ...newPlan, qrOrdering: !!val })}
                  />
                  <Label htmlFor="featQr" className="text-xs cursor-pointer font-medium">QR Menu Ordering</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="featLoyalty"
                    checked={newPlan.loyaltyProgram}
                    onCheckedChange={(val) => setNewPlan({ ...newPlan, loyaltyProgram: !!val })}
                  />
                  <Label htmlFor="featLoyalty" className="text-xs cursor-pointer font-medium">Loyalty Program</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="featBrand"
                    checked={newPlan.customBranding}
                    onCheckedChange={(val) => setNewPlan({ ...newPlan, customBranding: !!val })}
                  />
                  <Label htmlFor="featBrand" className="text-xs cursor-pointer font-medium">Custom Branding</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="featMulti"
                    checked={newPlan.multiBranchSupport}
                    onCheckedChange={(val) => setNewPlan({ ...newPlan, multiBranchSupport: !!val })}
                  />
                  <Label htmlFor="featMulti" className="text-xs cursor-pointer font-medium">Multi-branch HQ</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="featPriority"
                    checked={newPlan.prioritySupport}
                    onCheckedChange={(val) => setNewPlan({ ...newPlan, prioritySupport: !!val })}
                  />
                  <Label htmlFor="featPriority" className="text-xs cursor-pointer font-medium">Priority 24/7 Support</Label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isTrialPlan"
                  checked={newPlan.isTrialPlan}
                  onCheckedChange={(val) => setNewPlan({ ...newPlan, isTrialPlan: !!val })}
                />
                <Label htmlFor="isTrialPlan" className="cursor-pointer font-semibold">Mark as Free Trial Plan</Label>
              </div>
              {newPlan.isTrialPlan && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="trialDays" className="text-xs font-semibold">Trial Duration (Days)</Label>
                  <Input
                    id="trialDays"
                    type="number"
                    className="w-20 rounded-xl"
                    value={newPlan.trialDays}
                    onChange={(e) => setNewPlan({ ...newPlan, trialDays: e.target.value })}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsPlanModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPlanMutation.isPending} className="bg-primary text-white rounded-xl">
                {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MANUAL SUBSCRIPTION OVERRIDE MODAL */}
      <Dialog open={isOverrideModalOpen} onOpenChange={setIsOverrideModalOpen}>
        <DialogContent className="max-w-xl rounded-3xl border shadow-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Wrench className="w-6 h-6 text-amber-500" /> Manual Subscription Override
            </DialogTitle>
            <DialogDescription>
              Force override terms for brand <span className="font-bold text-foreground">"{selectedBrandSub?.brandName}"</span>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApplyOverride} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="overrideType" className="font-semibold">Override Action Type</Label>
              <Select
                value={overrideData.overrideType}
                onValueChange={(val) => setOverrideData({ ...overrideData, overrideType: val })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select override type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial_extension">Extend Trial Period</SelectItem>
                  <SelectItem value="temporary_upgrade">Temporary Plan Upgrade</SelectItem>
                  <SelectItem value="downgrade">Downgrade subscription</SelectItem>
                  <SelectItem value="reactivate">Reactivate cancelled subscription</SelectItem>
                  <SelectItem value="suspend">Suspend subscription status</SelectItem>
                  <SelectItem value="grace_period">Grant grace period days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Override Input Fields */}
            {overrideData.overrideType === "trial_extension" && (
              <div className="space-y-2 p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
                <Label htmlFor="extendDays" className="font-semibold">Days to extend trial by</Label>
                <Input
                  id="extendDays"
                  type="number"
                  required
                  value={overrideData.extendDays}
                  onChange={(e) => setOverrideData({ ...overrideData, extendDays: e.target.value })}
                  className="rounded-xl bg-white"
                />
                <p className="text-xs text-amber-600 font-medium">Adds these days to the current subscription expiry date.</p>
              </div>
            )}

            {(overrideData.overrideType === "temporary_upgrade" || overrideData.overrideType === "downgrade") && (
              <div className="space-y-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <div className="space-y-1.5">
                  <Label htmlFor="targetPlan" className="font-semibold">Target Subscription Plan</Label>
                  <Select
                    value={overrideData.targetPlanId}
                    onValueChange={(val) => setOverrideData({ ...overrideData, targetPlanId: val })}
                  >
                    <SelectTrigger className="bg-white rounded-xl">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plansData?.data?.data?.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {overrideData.overrideType === "temporary_upgrade" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="durationDays" className="text-xs font-semibold">Duration (Days)</Label>
                      <Input
                        id="durationDays"
                        type="number"
                        value={overrideData.durationDays}
                        onChange={(e) => setOverrideData({ ...overrideData, durationDays: e.target.value })}
                        className="rounded-xl bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="amountCharge" className="text-xs font-semibold">One-time charge (INR)</Label>
                      <Input
                        id="amountCharge"
                        type="number"
                        value={overrideData.amountCharge}
                        onChange={(e) => setOverrideData({ ...overrideData, amountCharge: e.target.value })}
                        className="rounded-xl bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {overrideData.overrideType === "reactivate" && (
              <div className="space-y-3 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="reactivateDays" className="font-semibold">Extend Expiry by (Days)</Label>
                    <Input
                      id="reactivateDays"
                      type="number"
                      value={overrideData.extendDays}
                      onChange={(e) => setOverrideData({ ...overrideData, extendDays: e.target.value })}
                      className="rounded-xl bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reactivateCharge" className="font-semibold">Charge amount (INR)</Label>
                    <Input
                      id="reactivateCharge"
                      type="number"
                      value={overrideData.amountCharge}
                      onChange={(e) => setOverrideData({ ...overrideData, amountCharge: e.target.value })}
                      className="rounded-xl bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {overrideData.overrideType === "grace_period" && (
              <div className="space-y-2 p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
                <Label htmlFor="graceDays" className="font-semibold">Grace period (Days)</Label>
                <Input
                  id="graceDays"
                  type="number"
                  value={overrideData.graceDays}
                  onChange={(e) => setOverrideData({ ...overrideData, graceDays: e.target.value })}
                  className="rounded-xl bg-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason" className="font-semibold flex items-center gap-1">
                Reason for override <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
              </Label>
              <Textarea
                id="reason"
                placeholder="Audit description for override justification"
                required
                value={overrideData.reason}
                onChange={(e) => setOverrideData({ ...overrideData, reason: e.target.value })}
                className="rounded-xl min-h-[80px]"
              />
            </div>

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsOverrideModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={applyOverrideMutation.isPending} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                {applyOverrideMutation.isPending ? "Applying..." : "Apply Override"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
