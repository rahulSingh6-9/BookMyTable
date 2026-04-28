import { motion } from "framer-motion";
import { ArrowRight, Utensils, Clock, Shield, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SmartSearch } from "@/components/SmartSearch";
import { RestaurantCard } from "@/components/RestaurantCard";
import { restaurants } from "@/lib/data";
import heroImage from "@/assets/hero-restaurant.jpg";
const stats = [
  { label: "Restaurants", value: "2,500+" },
  { label: "Happy Diners", value: "150K+" },
  { label: "Bookings Made", value: "1M+" },
  { label: "Cities", value: "45" }
];
const features = [
  {
    icon: Clock,
    title: "15-Second Booking",
    description: "Find and book your table in seconds, not minutes. Our smart search understands what you want."
  },
  {
    icon: Utensils,
    title: "Curated Selection",
    description: "Every restaurant is vetted for quality. Discover hidden gems and local favorites."
  },
  {
    icon: Shield,
    title: "Instant Confirmation",
    description: "No more phone calls or waiting. Get instant booking confirmation with real-time availability."
  },
  {
    icon: TrendingUp,
    title: "For Restaurant Owners",
    description: "Powerful dashboard to manage tables, track analytics, and grow your business."
  }
];
function Index() {
  return <div className="min-h-screen">
      {
    /* Hero */
  }
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img
    src={heroImage}
    alt="Restaurant ambiance"
    className="h-full w-full object-cover"
  />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
        </div>

        <div className="relative container mx-auto px-4 py-24 lg:px-8 lg:py-36">
          <div className="max-w-2xl">
            <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="mb-4 text-4xl font-bold text-primary-foreground sm:text-5xl lg:text-6xl"
    style={{ letterSpacing: "-0.03em" }}
  >
              Tables found,
              <br />
              <span className="text-primary">not searched.</span>
            </motion.h1>

            <motion.p
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15, duration: 0.5 }}
    className="mb-8 max-w-lg text-lg text-primary-foreground/70"
  >
              Discover and book the perfect table in seconds. Real-time availability, instant confirmation, zero hassle.
            </motion.p>

            <div className="max-w-xl">
              <SmartSearch />
            </div>

            {
    /* Stats */
  }
            <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="mt-12 flex flex-wrap gap-8"
  >
              {stats.map((stat) => <div key={stat.label}>
                  <div className="text-2xl font-bold text-primary-foreground">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/50">{stat.label}</div>
                </div>)}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categorized Sections */}
      <section className="py-16 lg:py-24 space-y-16 overflow-hidden">
        {Object.entries(
          restaurants.reduce((acc, restaurant) => {
            const category = restaurant.cuisine || "Other";
            if (!acc[category]) acc[category] = [];
            acc[category].push(restaurant);
            return acc;
          }, {})
        ).map(([category, items]) => (
          <div key={category} className="container mx-auto px-4 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{category} Delights</h2>
                <p className="mt-1 text-muted-foreground">Premium {category.toLowerCase()} dining experiences near you</p>
              </div>
              <Link to={`/discover?cuisine=${category}`}>
                <Button variant="ghost" className="hidden gap-1 sm:inline-flex">
                  Explore All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Horizontal Scroll Layout */}
            <div className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:-mx-8 lg:px-8">
              {items.map((restaurant, i) => (
                <div key={restaurant.id} className="min-w-[85vw] sm:min-w-[300px] max-w-[320px] shrink-0 snap-start">
                  <RestaurantCard restaurant={restaurant} index={i} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {
    /* How It Works */
  }
      <section id="how-it-works" className="bg-secondary/50 py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Why BookMyTable?</h2>
            <p className="mt-2 text-muted-foreground">Built for speed, designed for delight</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => <motion.div
    key={feature.title}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: i * 0.1 }}
    className="rounded-lg bg-card p-6 shadow-card"
  >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {
    /* CTA */
  }
      <section className="container mx-auto px-4 py-16 text-center lg:px-8 lg:py-24">
        <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="rounded-2xl bg-foreground px-8 py-16"
  >
          <h2 className="mb-4 text-2xl font-bold text-primary-foreground sm:text-3xl">
            Ready to find your table?
          </h2>
          <p className="mb-8 text-primary-foreground/60">
            Join 150,000+ diners who book smarter, not harder.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/discover">
              <Button size="lg" className="gap-2">
                Start Exploring <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/partner-with-us">
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                For Restaurant Owners
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>;
}
export {
  Index as default
};
