import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2, ArrowRight, TrendingUp, BarChart3, Users, Zap, LayoutDashboard, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

gsap.registerPlugin(ScrollTrigger);

export default function PartnerWithUs() {
  const containerRef = useRef(null);
  const heroBadgeRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroDescRef = useRef(null);
  const heroActionsRef = useRef(null);
  const heroDecorRef = useRef(null);
  const benefitsHeaderRef = useRef(null);
  const benefitsGridRef = useRef(null);
  const stepsHeaderRef = useRef(null);
  const stepsGridRef = useRef(null);
  const ctaCardRef = useRef(null);

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

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const safetyTimers = [];

    const ctx = gsap.context(() => {
      // Collect all reveal elements for fail-safe fallback
      const heroItems = [
        heroBadgeRef.current,
        heroTitleRef.current,
        heroDescRef.current,
        heroActionsRef.current,
      ].filter(Boolean);

      const benefitCards = benefitsGridRef.current
        ? Array.from(benefitsGridRef.current.children)
        : [];

      const stepCards = stepsGridRef.current
        ? Array.from(stepsGridRef.current.children)
        : [];

      const allElements = [
        ...heroItems,
        benefitsHeaderRef.current,
        ...benefitCards,
        stepsHeaderRef.current,
        ...stepCards,
        ctaCardRef.current,
      ].filter(Boolean);

      // FAIL-SAFE: Guarantee complete visibility within 2.5s if any trigger fails
      allElements.forEach((el) => {
        el.setAttribute("data-gsap-init", "true");
        const timer = setTimeout(() => {
          if (el && el.getAttribute("data-gsap-revealed") !== "true") {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.3,
              clearProps: "all",
              overwrite: "auto",
              onComplete: () => {
                el.setAttribute("data-gsap-revealed", "true");
              },
            });
          }
        }, 2500);
        safetyTimers.push(timer);
      });

      if (prefersReducedMotion) {
        gsap.set(allElements, { clearProps: "all", opacity: 1, y: 0 });
        allElements.forEach((el) => el.setAttribute("data-gsap-revealed", "true"));
        return;
      }

      // 1. Hero Section Sequential Reveal
      if (heroItems.length > 0) {
        gsap.fromTo(
          heroItems,
          { opacity: 0, y: 65 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out",
            stagger: 0.12,
            delay: 0.1,
            clearProps: "all",
            overwrite: "auto",
            onComplete: () => {
              heroItems.forEach((el) => el.setAttribute("data-gsap-revealed", "true"));
            },
          }
        );
      }

      // Background decorative blur entrance
      if (heroDecorRef.current) {
        gsap.fromTo(
          heroDecorRef.current,
          { opacity: 0 },
          { opacity: 0.3, duration: 1.2, ease: "power2.out" }
        );
      }

      // Helper to group elements into rows based on vertical offset
      const groupCardsByRow = (elements) => {
        if (!elements || elements.length === 0) return [];
        const rows = [];
        elements.forEach((el) => {
          const top = Math.round(
            el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0)
          );
          const existingRow = rows.find((r) => Math.abs(r.top - top) < 25);
          if (existingRow) {
            existingRow.items.push(el);
          } else {
            rows.push({ top, items: [el] });
          }
        });
        rows.sort((a, b) => a.top - b.top);
        return rows.map((r) => r.items);
      };

      // 2. Benefits Section Header
      if (benefitsHeaderRef.current) {
        gsap.fromTo(
          benefitsHeaderRef.current,
          { opacity: 0, y: 65 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out",
            clearProps: "all",
            overwrite: "auto",
            scrollTrigger: {
              trigger: benefitsHeaderRef.current,
              start: "top 88%",
              once: true,
              onEnter: () => {
                benefitsHeaderRef.current?.setAttribute("data-gsap-revealed", "true");
              },
            },
          }
        );
      }

      // 3. Benefits Cards (Row-by-Row Reveal)
      const benefitRows = groupCardsByRow(benefitCards);
      benefitRows.forEach((rowCards) => {
        gsap.fromTo(
          rowCards,
          { opacity: 0, y: 65 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out",
            stagger: 0.12,
            clearProps: "all",
            overwrite: "auto",
            scrollTrigger: {
              trigger: rowCards[0],
              start: "top 88%",
              once: true,
              onEnter: () => {
                rowCards.forEach((el) => el.setAttribute("data-gsap-revealed", "true"));
              },
            },
          }
        );
      });

      // 4. How It Works Section Header
      if (stepsHeaderRef.current) {
        gsap.fromTo(
          stepsHeaderRef.current,
          { opacity: 0, y: 65 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out",
            clearProps: "all",
            overwrite: "auto",
            scrollTrigger: {
              trigger: stepsHeaderRef.current,
              start: "top 88%",
              once: true,
              onEnter: () => {
                stepsHeaderRef.current?.setAttribute("data-gsap-revealed", "true");
              },
            },
          }
        );
      }

      // 5. Steps Cards (Row-by-Row Reveal)
      const stepRows = groupCardsByRow(stepCards);
      stepRows.forEach((rowCards) => {
        gsap.fromTo(
          rowCards,
          { opacity: 0, y: 65 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out",
            stagger: 0.12,
            clearProps: "all",
            overwrite: "auto",
            scrollTrigger: {
              trigger: rowCards[0],
              start: "top 88%",
              once: true,
              onEnter: () => {
                rowCards.forEach((el) => el.setAttribute("data-gsap-revealed", "true"));
              },
            },
          }
        );
      });

      // 6. Final CTA Section Banner
      if (ctaCardRef.current) {
        gsap.fromTo(
          ctaCardRef.current,
          { opacity: 0, y: 65 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out",
            clearProps: "all",
            overwrite: "auto",
            scrollTrigger: {
              trigger: ctaCardRef.current,
              start: "top 88%",
              once: true,
              onEnter: () => {
                ctaCardRef.current?.setAttribute("data-gsap-revealed", "true");
              },
            },
          }
        );
      }

      ScrollTrigger.refresh();
    }, containerRef);

    return () => {
      safetyTimers.forEach(clearTimeout);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      <div className="pt-20" />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container relative z-10 mx-auto px-4 text-center lg:px-8">
          <div>
            <div
              ref={heroBadgeRef}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-8"
            >
              <Zap className="h-4 w-4" />
              <span>For Restaurant Owners</span>
            </div>
            <h1
              ref={heroTitleRef}
              className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            >
              Grow your restaurant <br />
              <span className="text-primary">with BookMyTable</span>
            </h1>
            <p
              ref={heroDescRef}
              className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl"
            >
              Manage tables, bookings, and grow your business effortlessly with our comprehensive restaurant partner platform.
            </p>
            <div
              ref={heroActionsRef}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button asChild size="lg" className="h-14 rounded-full px-10 text-lg font-bold shadow-xl shadow-primary/20">
                <Link to="/partner/register">Register Your Restaurant</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  benefitsHeaderRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="h-14 rounded-full px-10 text-lg font-bold transition-all text-foreground hover:bg-secondary hover:text-foreground border-border/80"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div ref={heroDecorRef} className="absolute top-0 -z-10 h-full w-full opacity-30">
          <div className="absolute top-20 right-[10%] h-[400px] w-[400px] rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute bottom-20 left-[10%] h-[400px] w-[400px] rounded-full bg-accent/20 blur-[100px]" />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div ref={benefitsHeaderRef} className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">Powerful Features for Your Growth</h2>
            <p className="text-muted-foreground text-lg">Everything you need to manage your restaurant in the digital age.</p>
          </div>
          <div ref={benefitsGridRef} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="group relative rounded-3xl border border-border bg-card p-8 transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${benefit.bg} ${benefit.color}`}>
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-primary transition-colors">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div ref={stepsHeaderRef} className="text-center mb-20">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Four simple steps to start receiving reservations.</p>
          </div>
          <div ref={stepsGridRef} className="grid gap-12 lg:grid-cols-4 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-[44px] left-[50px] right-[50px] h-[2px] bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 -z-10" />
            
            {steps.map((step, i) => (
              <div
                key={i}
                className="relative text-center lg:text-left"
              >
                <div className="mx-auto lg:mx-0 mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/30">
                  {i + 1}
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground leading-snug">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Footer */}
      <section className="py-24 bg-foreground px-4">
        <div className="container mx-auto">
          <div
            ref={ctaCardRef}
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
          </div>
        </div>
      </section>
    </div>
  );
}
