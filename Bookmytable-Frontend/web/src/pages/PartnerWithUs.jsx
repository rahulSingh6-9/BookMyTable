import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, TrendingUp, BarChart3, Users, Zap, LayoutDashboard, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export default function PartnerWithUs() {
  const benefits = [
    {
      title: "Increase Bookings",
      desc: "Reach thousands of diners looking for tables every day and fill your empty seats during off-peak hours.",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Smart Table Management",
      desc: "Manage your floor plan in real-time. Optimize occupancy and reduce wait times for your guests.",
      icon: LayoutDashboard,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Real-time Analytics",
      desc: "Get deep insights into your restaurant's performance, peak hours, and customer preferences.",
      icon: BarChart3,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Customer Insights",
      desc: "Build your own guest database. Understand dining habits and reward your most loyal customers.",
      icon: Users,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    }
  ];

  const steps = [
    { title: "Sign Up", desc: "Create your partner account in minutes with basic contact details." },
    { title: "Add Restaurant Details", desc: "Tell us about your cuisine, location, photos, and menu." },
    { title: "Get Approved", desc: "Our team will verify your details to ensure the best quality for our diners." },
    { title: "Start Receiving Bookings", desc: "Go live on BookMyTable and watch your reservations grow." }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20" />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container relative z-10 mx-auto px-4 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-8">
              <Zap className="h-4 w-4" />
              <span>For Restaurant Owners</span>
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Grow your restaurant <br />
              <span className="text-primary">with BookMyTable</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Manage tables, bookings, and grow your business effortlessly with our comprehensive restaurant partner platform.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-14 rounded-full px-10 text-lg font-bold shadow-xl shadow-primary/20">
                <Link to="/partner/register">Register Your Restaurant</Link>
              </Button>
              <Button variant="outline" size="lg" className="h-14 rounded-full px-10 text-lg font-bold transition-all hover:bg-secondary">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 -z-10 h-full w-full opacity-30">
          <div className="absolute top-20 right-[10%] h-[400px] w-[400px] rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute bottom-20 left-[10%] h-[400px] w-[400px] rounded-full bg-accent/20 blur-[100px]" />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">Powerful Features for Your Growth</h2>
            <p className="text-muted-foreground text-lg">Everything you need to manage your restaurant in the digital age.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative rounded-3xl border border-border bg-card p-8 transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${benefit.bg} ${benefit.color}`}>
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-primary transition-colors">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Four simple steps to start receiving reservations.</p>
          </div>
          <div className="grid gap-12 lg:grid-cols-4 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-[44px] left-[50px] right-[50px] h-[2px] bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 -z-10" />
            
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative text-center lg:text-left"
              >
                <div className="mx-auto lg:mx-0 mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/30">
                  {i + 1}
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground leading-snug">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Footer */}
      <section className="py-24 bg-foreground px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[3rem] bg-gradient-to-br from-primary via-primary to-primary/80 px-8 py-20 text-center text-primary-foreground shadow-3xl overflow-hidden relative"
          >
            {/* Decorative Circle */}
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

            <div className="relative z-10">
              <h2 className="mb-6 text-3xl font-bold sm:text-5xl lg:text-6xl">Ready to fill your tables?</h2>
              <p className="mx-auto mb-10 max-w-xl text-lg opacity-90 sm:text-xl">
                Join thousands of successful restaurants using BookMyTable to manage their bookings and tables.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" variant="secondary" className="h-16 rounded-full px-12 text-xl font-bold shadow-2xl transition-all hover:scale-105 active:scale-95">
                  <Link to="/partner/register">Register Your Restaurant <ArrowRight className="ml-2 h-6 w-6" /></Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
