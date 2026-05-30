import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  X, 
  HelpCircle, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Award,
  ChevronDown,
  RefreshCw,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly or yearly
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Live Query from database via unauthenticated public plans endpoint
  const { data: plans = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["publicPlans"],
    queryFn: async () => {
      const res = await apiClient.get("/restaurants/subscriptions/public/plans");
      return res.data?.data || [];
    },
  });

  const faqs = [
    {
      q: "Can I change my plan at any time?",
      a: "Yes, absolutely! You can upgrade or downgrade your plan at any moment. When upgrading, your new limits will take effect instantly, and any pricing differences will be automatically prorated. When downgrading, the new tier will apply from the beginning of your next billing period."
    },
    {
      q: "What happens when my 30-day Free Trial ends?",
      a: "At the end of your 30-day free trial, you can enter your billing method to continue on your selected plan. Don't worry, your data and configurations are securely stored, and we will never charge you without your explicit approval."
    },
    {
      q: "Are there any hidden fees or setup costs?",
      a: "None at all. The pricing you see is exactly what you pay. There are no hidden onboarding fees, installation charges, transaction commissions on reservations, or contract cancellation penalties."
    },
    {
      q: "What happens if I exceed my plan's operational limits?",
      a: "We will notify you immediately when you approach 80% and 100% of your plan's limits. If you need to exceed them, you can easily scale by upgrading to a higher tier or applying a custom administrative override."
    },
    {
      q: "Do you support multiple branches or locations?",
      a: "Yes! Our Growth and Enterprise plans feature fully integrated Multi-Branch Headquarters (HQ) systems, allowing you to seamlessly manage, switch, configure, and audit all your branches from a single unified workspace."
    }
  ];

  const handleToggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Helper to format limit text
  const formatLimit = (key, val) => {
    if (val === -1 || val >= 9999) return "Unlimited";
    
    switch (key) {
      case "maxBranches":
        return val === 1 ? "1 branch location" : `${val} branch locations`;
      case "maxTables":
        return `${val} dining tables`;
      case "maxStaff":
        return `${val} staff accounts`;
      case "reservationsPerMonth":
        return `${val} reservations/mo`;
      default:
        return val;
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden font-sans">
      {/* 🌌 High-End Ambient Background Blobs */}
      <div className="absolute top-[-10%] left-[-20%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl py-20 px-4 relative z-10">
        
        {/* 1. HERO SECTION */}
        <div className="text-center space-y-5 max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5" /> Simple, Flexible Plans
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] sm:leading-[1.1]"
          >
            Simple Pricing For Every Restaurant
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Scalable plans for cafés, local restaurants, and multi-branch brands. 
            Unlock growth with table management, real-time bookings, and priority support.
          </motion.p>
        </div>

        {/* 2. BILLING CYCLE TOGGLE */}
        <div className="flex justify-center items-center gap-4 mb-16">
          <div className="relative p-1 bg-muted/60 dark:bg-muted/30 border border-border/60 rounded-full flex items-center shadow-inner">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                billingCycle === "monthly" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {billingCycle === "monthly" && (
                <motion.div 
                  layoutId="activeCycleBg"
                  className="absolute inset-0 bg-primary rounded-full -z-10 shadow-md"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-1.5",
                billingCycle === "yearly" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {billingCycle === "yearly" && (
                <motion.div 
                  layoutId="activeCycleBg"
                  className="absolute inset-0 bg-primary rounded-full -z-10 shadow-md"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              Yearly Billing
            </button>
          </div>
          
          {/* Yearly Discount Badge */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 fill-current" /> Save up to 20%
          </motion.div>
        </div>

        {/* 3. PLANS GRID */}
        {isLoading ? (
          /* Loading Skeletons State */
          <div className="grid gap-8 md:grid-cols-3 mb-24">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card/40 border border-border/40 rounded-[2.5rem] p-8 space-y-6 animate-pulse">
                <div className="space-y-3">
                  <div className="h-6 w-24 bg-muted rounded-full" />
                  <div className="h-10 w-48 bg-muted rounded-xl" />
                  <div className="h-4 w-full bg-muted rounded-md" />
                </div>
                <div className="h-12 w-28 bg-muted rounded-xl" />
                <div className="space-y-4 pt-4 border-t border-border/40">
                  <div className="h-4 w-3/4 bg-muted rounded-md" />
                  <div className="h-4 w-5/6 bg-muted rounded-md" />
                  <div className="h-4 w-2/3 bg-muted rounded-md" />
                  <div className="h-4 w-4/5 bg-muted rounded-md" />
                </div>
                <div className="h-12 w-full bg-muted rounded-full mt-4" />
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error Retry State */
          <div className="flex flex-col items-center justify-center py-20 bg-card/30 border border-border/40 rounded-[2.5rem] p-8 mb-24 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Failed to load subscription plans</h3>
            <p className="text-sm text-muted-foreground mb-6">
              There was an issue connecting to our pricing servers. Please verify your connection and try again.
            </p>
            <Button onClick={() => refetch()} className="rounded-full px-6 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Retry Connection
            </Button>
          </div>
        ) : plans.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 bg-card/30 border border-border/40 rounded-[2.5rem] p-8 mb-24 text-center max-w-xl mx-auto shadow-sm animate-fade-in">
            <Info className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No subscription plans available</h3>
            <p className="text-sm text-muted-foreground">
              We are currently restructuring our pricing options. Please check back shortly or contact our support team.
            </p>
          </div>
        ) : (
          /* Live Plans Grid List */
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch mb-24">
            {plans.map((plan, idx) => {
              const isTrial = plan.isTrialPlan;
              const isPopular = plan.isPopular;
              
              // Calculate correct billing cycle pricing
              let displayPrice = plan.pricing?.monthly;
              let isCustom = false;

              if (plan.slug === "enterprise" || (plan.pricing?.monthly === 0 && !isTrial)) {
                isCustom = true;
              } else if (billingCycle === "yearly" && plan.pricing?.yearly) {
                displayPrice = Math.floor(plan.pricing.yearly / 12);
              }

              return (
                <motion.div
                  key={plan.id || plan._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={cn(
                    "relative flex flex-col p-8 rounded-[2.5rem] border bg-card/60 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1.5",
                    isPopular && "border-primary bg-primary/[0.02] ring-2 ring-primary/20",
                    isTrial && "border-amber-500/50 bg-amber-500/[0.01] ring-2 ring-amber-500/10"
                  )}
                >
                  {/* Card Header Top Badges */}
                  {plan.badge && (
                    <div className={cn(
                      "absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow-md",
                      isPopular && "bg-primary text-primary-foreground",
                      isTrial && "bg-amber-500 text-white",
                      !isPopular && !isTrial && "bg-muted text-muted-foreground"
                    )}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      {plan.name}
                      {isPopular && <Award className="w-5 h-5 text-primary" />}
                      {isTrial && <Zap className="w-5 h-5 text-amber-500 fill-current" />}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground min-h-[40px] leading-relaxed">{plan.description}</p>
                    
                    {/* Dynamic Price Display */}
                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="text-5xl font-black text-foreground tracking-tight">
                        {isCustom ? "Custom" : `$${displayPrice}`}
                      </span>
                      {!isCustom && (
                        <span className="text-sm font-semibold text-muted-foreground">
                          /mo
                        </span>
                      )}
                    </div>

                    {/* Bill Summary Notes */}
                    {!isCustom && (
                      <div className="text-xs text-muted-foreground/80 mt-1 min-h-[16px]">
                        {billingCycle === "yearly" ? (
                          <span>Billed annually (${plan.pricing.yearly}/yr)</span>
                        ) : (
                          <span>Billed month-to-month</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Operational Limits */}
                  <div className="space-y-2.5 p-4 rounded-2xl bg-muted/30 dark:bg-muted/10 border border-border/30 mb-6">
                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1.5">Operational Limits</p>
                    {Object.entries(plan.limits || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs text-foreground/90 font-semibold">
                        <span className="capitalize text-muted-foreground">{key.replace("max", "").replace("reservationsPerMonth", "Reservations")}:</span>
                        <span>{formatLimit(key, value)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Feature Lists */}
                  <div className="flex-1 mb-8">
                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-3.5">Included Features</p>
                    <ul className="space-y-3.5">
                      {Object.entries(plan.features || {}).map(([key, enabled]) => (
                        <li key={key} className={cn(
                          "flex items-center gap-3 text-xs",
                          enabled ? "text-foreground" : "text-muted-foreground/50"
                        )}>
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                            enabled ? (isTrial ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" : "bg-primary/10 text-primary dark:bg-primary-foreground/10 dark:text-primary") : "bg-muted text-muted-foreground/30 border border-dashed"
                          )}>
                            {enabled ? <Check className="h-3 w-3 stroke-[3]" /> : <X className="h-3 w-3 stroke-[2.5]" />}
                          </div>
                          <span className={cn(enabled ? "font-semibold" : "font-medium line-through")}>
                            {key
                              .replace("qrOrdering", "QR Code Tableside Ordering")
                              .replace("analytics", "Real-Time Advanced Analytics")
                              .replace("loyaltyProgram", "Loyalty & Rewards Program")
                              .replace("customBranding", "Custom White-Label Branding")
                              .replace("multiBranchHQ", "Multi-Branch HQ Control")
                              .replace("prioritySupport", "24/7 Priority Support")
                            }
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dynamic CTA button */}
                  <Button 
                    asChild 
                    size="lg" 
                    className={cn(
                      "w-full rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300",
                      isPopular && "bg-primary text-primary-foreground hover:bg-primary/90",
                      isTrial && "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/10",
                      !isPopular && !isTrial && "bg-muted/80 text-foreground border border-border/80 hover:bg-muted"
                    )}
                  >
                    <Link to="/partner/register">
                      {isTrial ? "Start Free Trial" : (isCustom ? "Contact Enterprise Sales" : "Get Started Now")}
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* 4. DYNAMIC FEATURE COMPARISON TABLE */}
        {!isLoading && !isError && plans.length > 0 && (
          <div className="space-y-6 mb-24">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Compare Plans & Features</h2>
              <p className="text-sm text-muted-foreground">Select the right package limit based on your operational scale.</p>
            </div>
            
            <div className="overflow-hidden rounded-[2rem] border border-border bg-card/60 backdrop-blur shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-xs font-bold text-foreground">
                      <th className="p-5 font-bold text-muted-foreground min-w-[200px]">Core Capability</th>
                      {plans.map((p) => (
                        <th key={p.id || p._id} className="p-5 font-extrabold text-center min-w-[150px]">
                          <div className="flex flex-col items-center">
                            <span className="text-sm">{p.name}</span>
                            {p.pricing?.monthly !== undefined && (
                              <span className="text-[10px] text-muted-foreground font-semibold">
                                {p.isTrialPlan ? "Free" : `$${p.pricing.monthly}/mo`}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium">
                    {/* Limits rows */}
                    <tr className="border-b border-border/50 hover:bg-muted/10">
                      <td className="p-5 font-bold text-foreground">Branch Locations Allowed</td>
                      {plans.map((p) => (
                        <td key={p.id || p._id} className="p-5 text-center font-semibold text-muted-foreground">
                          {formatLimit("maxBranches", p.limits?.maxBranches)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-muted/10">
                      <td className="p-5 font-bold text-foreground">Dining Tables Allowed</td>
                      {plans.map((p) => (
                        <td key={p.id || p._id} className="p-5 text-center font-semibold text-muted-foreground">
                          {formatLimit("maxTables", p.limits?.maxTables)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-muted/10">
                      <td className="p-5 font-bold text-foreground">Staff Accounts Available</td>
                      {plans.map((p) => (
                        <td key={p.id || p._id} className="p-5 text-center font-semibold text-muted-foreground">
                          {formatLimit("maxStaff", p.limits?.maxStaff)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-muted/10">
                      <td className="p-5 font-bold text-foreground">Monthly Bookings Allowed</td>
                      {plans.map((p) => (
                        <td key={p.id || p._id} className="p-5 text-center font-semibold text-muted-foreground">
                          {formatLimit("reservationsPerMonth", p.limits?.maxReservationsPerMonth ?? p.limits?.reservationsPerMonth)}
                        </td>
                      ))}
                    </tr>
                    {/* Features rows */}
                    <tr className="border-b border-border/50 hover:bg-muted/10">
                      <td className="p-5 font-bold text-foreground">Advanced Live Analytics</td>
                      {plans.map((p) => (
                        <td key={p.id || p._id} className="p-5 text-center">
                          <div className="flex justify-center">
                            {p.features?.analytics ? (
                              <Check className="w-5 h-5 text-primary stroke-[3]" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground/30" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-muted/10">
                      <td className="p-5 font-bold text-foreground">QR Digital Menu Ordering</td>
                      {plans.map((p) => (
                        <td key={p.id || p._id} className="p-5 text-center">
                          <div className="flex justify-center">
                            {p.features?.qrOrdering ? (
                              <Check className="w-5 h-5 text-primary stroke-[3]" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground/30" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-muted/10">
                      <td className="p-5 font-bold text-foreground">Loyalty & Rewards Systems</td>
                      {plans.map((p) => (
                        <td key={p.id || p._id} className="p-5 text-center">
                          <div className="flex justify-center">
                            {p.features?.loyaltyProgram ? (
                              <Check className="w-5 h-5 text-primary stroke-[3]" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground/30" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-muted/10">
                      <td className="p-5 font-bold text-foreground">Custom White-Label Branding</td>
                      {plans.map((p) => (
                        <td key={p.id || p._id} className="p-5 text-center">
                          <div className="flex justify-center">
                            {p.features?.customBranding ? (
                              <Check className="w-5 h-5 text-primary stroke-[3]" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground/30" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-muted/10">
                      <td className="p-5 font-bold text-foreground">Multi-Branch HQ Dashboard</td>
                      {plans.map((p) => (
                        <td key={p.id || p._id} className="p-5 text-center">
                          <div className="flex justify-center">
                            {p.features?.multiBranchHQ ? (
                              <Check className="w-5 h-5 text-primary stroke-[3]" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground/30" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-muted/10">
                      <td className="p-5 font-bold text-foreground">Priority Customer Support</td>
                      {plans.map((p) => (
                        <td key={p.id || p._id} className="p-5 text-center">
                          <div className="flex justify-center">
                            {p.features?.prioritySupport ? (
                              <span className="text-primary font-bold">24/7 Call & Chat</span>
                            ) : (
                              <span className="text-muted-foreground font-semibold">Standard Email</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. FAQ SECTION */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground">Everything you need to know about our subscription and setup process.</p>
          </div>
          
          <div className="space-y-4 pt-4">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <button
                    onClick={() => handleToggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-foreground hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="text-sm sm:text-base font-bold flex items-center gap-2">
                      <HelpCircle className="w-4.5 h-4.5 text-primary shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300",
                      isOpen && "rotate-180 text-primary"
                    )} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/10">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
