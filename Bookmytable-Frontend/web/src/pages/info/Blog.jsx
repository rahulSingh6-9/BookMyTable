import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Blog() {
  const posts = [
    {
      title: "How to Optimize Your Restaurant's Seating Arrangement",
      excerpt: "Learn the secrets to maximizing space and efficiency in your dining area without compromising customer comfort.",
      category: "Management",
      date: "April 5, 2026",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&h=400&auto=format&fit=crop",
    },
    {
      title: "Top 5 Dining Trends to Watch in 2026",
      excerpt: "From AI-powered recommendations to sustainable sourcing, discover what's shaping the future of the restaurant industry.",
      category: "Trends",
      date: "March 28, 2026",
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=600&h=400&auto=format&fit=crop",
    },
    {
      title: "The Importance of Real-time Reservation Data",
      excerpt: "Why staying up-to-date with your table availability is crucial for reducing no-shows and increasing revenue.",
      category: "Tech",
      date: "March 15, 2026",
      image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=600&h=400&auto=format&fit=crop",
    },
  ];

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Our Blog</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Insights, guides, and news from the world of restaurant management and smart dining.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md h-full"
            >
              <div className="aspect-video overflow-hidden">
                <img src={post.image} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs uppercase tracking-wider">{post.category}</Badge>
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold leading-tight text-foreground">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                </div>
                <Button variant="ghost" className="w-fit p-0 h-6 text-primary hover:text-primary hover:bg-transparent transition-all group">
                  Read More <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-3xl bg-primary/10 p-12 text-center space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Subscribe to our newsletter</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Get the latest articles and case studies delivered straight to your inbox every two weeks.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input className="flex h-12 w-full rounded-full border border-border bg-background px-6 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" placeholder="Enter your email" />
            <Button size="lg" className="rounded-full px-8 font-bold">Subscribe</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
