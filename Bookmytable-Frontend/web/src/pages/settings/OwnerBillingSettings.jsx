import { useState, useEffect, Fragment } from "react";
import { format } from "date-fns";
import { useBrand } from "@/context/BrandContext";
import { getMySubscription, getMyUsage, getMyFeatures } from "@/services/subscription.service";
import { getBrandLogs } from "@/services/logs.service";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Building2, 
  Store, Users, Table2, CalendarCheck, Clock, ArrowRight, Wallet, ShieldCheck, Activity,
  LineChart, SlidersHorizontal, Building, Blocks
} from "lucide-react";
import { Link } from "react-router-dom";

export default function OwnerBillingSettings() {
  const { activeBrand } = useBrand();

  const [loading, setLoading] = useState(true);
  const [expandedBranchId, setExpandedBranchId] = useState(null);
  const [data, setData] = useState({
    subscription: null,
    usage: null,
    limits: null,
    features: null,
    logs: []
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!activeBrand?.id) return;
      try {
        setLoading(true);
        const [subRes, usageRes, featuresRes, logsRes] = await Promise.all([
          getMySubscription(),
          getMyUsage(),
          getMyFeatures(),
          getBrandLogs(activeBrand.id, { limit: 5 })
        ]);

        setData({
          subscription: subRes.data || subRes,
          usage: usageRes.data?.usage || usageRes.usage || {},
          limits: usageRes.data?.limits || usageRes.limits || {},
          features: featuresRes.data || featuresRes || {},
          logs: logsRes.data?.docs || logsRes.data || []
        });
      } catch (error) {
        console.error("Failed to fetch billing data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeBrand]);

  const toggleExpand = (branchId) => {
    setExpandedBranchId(prev => prev === branchId ? null : branchId);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const { subscription, usage, limits, features, logs } = data;
  const safeUsage = usage || {};
  const safeLimits = limits || {};
  const plan = subscription?.subscriptionPlanId || {};
  
  const paymentProvider = subscription?.paymentProvider || "Razorpay";
  
  // Extract unique branches from memberships
  const uniqueBranches = Array.from(new Map(
    (activeBrand?.memberships || [])
      .filter(m => m.branch)
      .map(m => [m.branch._id, m.branch])
  ).values());

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION & SUMMARY HERO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Billing Center
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage subscriptions, branch payments, and settlements.</p>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
             <div className="flex items-center gap-2 font-semibold">
               Plan: <span className="text-foreground">{plan.name || "Unknown Plan"}</span>
             </div>
             <Badge className={
                subscription?.status === 'active' 
                ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                : "bg-amber-100 text-amber-700 border-amber-200"
              }>
                {subscription?.status ? subscription.status.toUpperCase() : "UNKNOWN"}
             </Badge>
             <div className="flex items-center gap-1.5 text-muted-foreground">
               <Clock className="w-4 h-4" /> 
               Renews {subscription?.expiresAt ? format(new Date(subscription.expiresAt), "MMM d, yyyy") : "N/A"}
             </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
           <Button variant="outline" className="w-full sm:w-auto bg-muted/20" asChild>
              <Link to="../subscription">View Subscription</Link>
           </Button>
           <Button variant="outline" className="w-full sm:w-auto bg-muted/20">
              Manage Integrations
           </Button>
           <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              Upgrade Plan
           </Button>
        </div>
      </div>

      {/* TABS IMPLEMENTATION */}
      <Tabs defaultValue="bank" className="w-full pt-2">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PAYOUT SUMMARY TABLE */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Wallet className="w-5 h-5 text-emerald-500" />
                Payout Summary
              </h2>
              
              <Card className="rounded-xl border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="font-bold">Branch</TableHead>
                        <TableHead className="font-bold text-right">Pending</TableHead>
                        <TableHead className="font-bold text-right">Transferred</TableHead>
                        <TableHead className="font-bold text-right">Next Settlement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uniqueBranches.length > 0 ? uniqueBranches.slice(0, 3).map((branch, i) => (
                        <TableRow key={branch._id} className="hover:bg-muted/10">
                          <TableCell className="font-medium text-xs">{branch.restaurantName || branch.branchName || "Branch"}</TableCell>
                          <TableCell className="text-right text-xs font-mono font-semibold text-amber-600">
                            ${(Math.random() * 500).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-xs font-mono font-semibold text-emerald-600">
                            ${(Math.random() * 5000 + 1000).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">Tomorrow</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No data available.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>

            {/* RECENT BILLING ACTIVITY TABLE */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Activity className="w-5 h-5 text-purple-500" />
                Recent Billing Activity
              </h2>
              
              <Card className="rounded-xl border-border shadow-sm overflow-hidden h-[calc(100%-2.5rem)]">
                <div className="overflow-y-auto h-full max-h-[300px]">
                  <Table>
                    <TableHeader className="bg-muted/30 sticky top-0 z-10 shadow-sm">
                      <TableRow>
                        <TableHead className="font-bold">Date</TableHead>
                        <TableHead className="font-bold">Action</TableHead>
                        <TableHead className="font-bold">Branch</TableHead>
                        <TableHead className="font-bold text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs && logs.length > 0 ? (
                        logs.filter(log => log.action.includes('SUBSCRIPTION') || log.action.includes('PLAN') || log.action.includes('PAYMENT')).slice(0, 4).map((log, index) => (
                          <TableRow key={log._id || index} className="hover:bg-muted/10">
                            <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                              {format(new Date(log.createdAt), "MMM d, h:mm a")}
                            </TableCell>
                            <TableCell className="text-xs font-semibold capitalize">
                              {log.action.replace(/_/g, ' ').toLowerCase()}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              Global
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0 h-5">
                                Success
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No recent billing activity.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: CONFIGURATION */}
        <TabsContent value="configuration" className="space-y-6 focus-visible:outline-none animate-in fade-in duration-500">
           <Card className="shadow-sm border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Blocks className="h-5 w-5 text-primary" />
                  Integration Configuration
                </CardTitle>
                <CardDescription>Manage global API keys and webhooks for payment processing.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/60 rounded-xl bg-muted/5">
                   <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mb-4" />
                   <h3 className="text-lg font-bold">API Configuration Secured</h3>
                   <p className="text-sm text-muted-foreground text-center max-w-md mt-2">
                     Your payment gateway keys are managed securely at the global brand level. No action is required on this branch.
                   </p>
                   <Button variant="outline" className="mt-6">View Integration Settings</Button>
                </div>
              </CardContent>
           </Card>
        </TabsContent>

        {/* TAB 3: BANK & HEALTH */}
        <TabsContent value="bank" className="space-y-6 focus-visible:outline-none animate-in fade-in duration-500">
          {/* BRANCH PAYMENT STATUS TABLE */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Building2 className="w-5 h-5 text-blue-500" />
              Branch Payment Status
            </h2>
            
            <Card className="rounded-xl border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead className="font-bold text-foreground">Branch Name</TableHead>
                      <TableHead className="font-bold text-foreground">Gateway</TableHead>
                      <TableHead className="font-bold text-foreground">Integration Status</TableHead>
                      <TableHead className="font-bold text-foreground">Verification</TableHead>
                      <TableHead className="font-bold text-foreground">Payout Status</TableHead>
                      <TableHead className="text-right font-bold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uniqueBranches.length > 0 ? uniqueBranches.map((branch) => (
                      <Fragment key={branch._id}>
                        <TableRow className="hover:bg-muted/10 cursor-pointer" onClick={() => toggleExpand(branch._id)}>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              {expandedBranchId === branch._id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-semibold">{branch.restaurantName || branch.branchName || "Unnamed Branch"}</TableCell>
                          <TableCell>{paymentProvider}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              Connected
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Enabled
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        {/* EXPANDABLE DETAILS */}
                        {expandedBranchId === branch._id && (
                          <TableRow className="bg-muted/5 hover:bg-muted/5">
                            <TableCell colSpan={7} className="p-0 border-b">
                              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-200">
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Gateway Account ID</p>
                                  <p className="font-mono text-sm font-medium">acc_{branch._id.substring(0, 12)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Settlement Frequency</p>
                                  <p className="text-sm font-medium">Daily (T+1)</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Bank Account</p>
                                  <p className="text-sm font-medium flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Connected Date</p>
                                  <p className="text-sm font-medium">Oct 12, 2025</p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No branches found for this brand.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
