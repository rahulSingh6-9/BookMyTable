import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Crown, ReceiptText } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$29/mo",
    description: "For small restaurants getting started.",
    features: ["Basic bookings", "Table management", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$79/mo",
    description: "Best for growing restaurants.",
    features: ["Everything in Starter", "Layout editor", "Live availability", "Analytics"],
    highlighted: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "$149/mo",
    description: "For multi-room, high volume operations.",
    features: ["Everything in Pro", "Priority support", "Custom rules", "Advanced reports"],
  },
];

const billingHistory = [
  { id: "inv_1042", date: "2026-04-01", amount: "$79.00", status: "paid" },
  { id: "inv_1009", date: "2026-03-01", amount: "$79.00", status: "paid" },
  { id: "inv_0977", date: "2026-02-01", amount: "$79.00", status: "paid" },
];

export default function OwnerSubscription() {
  const [currentPlan, setCurrentPlan] = useState("pro");
  const plan = useMemo(() => plans.find((p) => p.id === currentPlan), [currentPlan]);

  const handleChangePlan = (planId) => {
    setCurrentPlan(planId);
    toast.success("Plan updated (mock)");
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Subscription</h1>
            <p className="text-muted-foreground">Manage your plan, payments, and billing history</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-6">
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-primary" />
                      Current plan
                    </CardTitle>
                    <CardDescription>Your active subscription and payment status.</CardDescription>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {plan?.name || "Pro"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Billing</div>
                    <div className="font-medium text-foreground">{plan?.price || "$79/mo"}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Payment status</div>
                    <Badge variant="secondary" className="gap-1">
                      <CreditCard className="h-3.5 w-3.5" /> Active
                    </Badge>
                  </div>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    This is a mock billing UI. Connect to Stripe later for real invoices and plan changes.
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {plans.map((p) => {
                  const isCurrent = p.id === currentPlan;
                  return (
                    <Card
                      key={p.id}
                      className={`shadow-card ${p.highlighted ? "border-primary/20" : ""}`}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{p.name}</span>
                          {p.highlighted && <Badge className="bg-primary/10 text-primary border border-primary/20">Popular</Badge>}
                        </CardTitle>
                        <CardDescription>{p.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-2xl font-bold text-foreground">{p.price}</div>
                        <ul className="space-y-2 text-sm">
                          {p.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-muted-foreground">
                              <Check className="h-4 w-4 mt-0.5 text-accent" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className="w-full"
                          variant={isCurrent ? "outline" : "default"}
                          onClick={() => handleChangePlan(p.id)}
                          disabled={isCurrent}
                        >
                          {isCurrent ? "Current plan" : "Choose plan"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ReceiptText className="h-5 w-5 text-primary" />
                    Billing history
                  </CardTitle>
                  <CardDescription>Recent invoices (mock)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Invoice</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billingHistory.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-mono text-xs">{row.id}</TableCell>
                            <TableCell>{row.date}</TableCell>
                            <TableCell className="font-medium">{row.amount}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {row.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-card h-fit lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="text-base">Next steps</CardTitle>
                <CardDescription>Ready for backend integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>- Wire plan change to Stripe checkout / customer portal.</div>
                <div>- Fetch invoices from backend and support downloads.</div>
                <div>- Gate features based on plan (layout editor, live view, analytics).</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

