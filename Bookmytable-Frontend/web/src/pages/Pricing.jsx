import { motion } from "framer-motion";
import { Check, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Pricing() {
  const plans = [
    {
      name: "Basic",
      price: "$29",
      desc: "Perfect for small cafes and bistros.",
      features: ["Table Management", "Real-time Bookings", "Email Support", "Digital Menu (lite)"],
    },
    {
      name: "Growth",
      price: "$79",
      desc: "Ideal for growing restaurants.",
      popular: true,
      features: ["Advanced Analytics", "SMS Notifications", "Waitlist Management", "Priority Support", "Interactive Floor Plan"],
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For restaurant groups and fine-dining.",
      features: ["Multi-location support", "Dedicated Account Manager", "Custom API Integration", "Inventory Management"],
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl py-20 px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">Transparent Pricing for Growth</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your restaurant's size and goals. No hidden fees, ever.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col p-8 rounded-[2rem] border ${plan.popular ? "border-primary bg-primary/5 shadow-xl ring-2 ring-primary/20" : "border-border bg-card shadow-sm"}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="mt-2 text-muted-foreground">{plan.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground">/mo</span>}
                </div>
              </div>
              <ul className="mb-10 flex-1 space-y-4">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-foreground/80">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" variant={plan.popular ? "default" : "outline"} className="w-full rounded-full">
                <Link to="/restaurant/register">Get Started</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
