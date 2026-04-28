import { motion } from "framer-motion";
import { Search, Mail, Phone, MessageSquare, LifeBuoy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Support() {
  const contactOptions = [
    { label: "Email Support", value: "support@bookmytable.com", icon: Mail },
    { label: "Phone Support", value: "+1 (800) BOOK-TABLE", icon: Phone },
    { label: "Live Chat", value: "Available 24/7", icon: MessageSquare },
  ];

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LifeBuoy className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">How can we help?</h1>
          <p className="text-muted-foreground text-lg">
            Search our help center or contact our support team.
          </p>
          <div className="relative mx-auto max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-12 pl-10 pr-4 rounded-xl" placeholder="Search for articles, guides..." />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {contactOptions.map((option, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
            >
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                <option.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{option.label}</p>
              <p className="font-semibold text-foreground">{option.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Common Questions</h2>
          <div className="grid gap-4">
            {[
              "How do I cancel my reservation?",
              "What is the policy for no-shows?",
              "How can I change my booking time?",
              "Do I need to pay a reservation fee?",
            ].map((question, i) => (
              <button
                key={i}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-6 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <span className="font-medium text-foreground">{question}</span>
                <span className="text-muted-foreground">→</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
