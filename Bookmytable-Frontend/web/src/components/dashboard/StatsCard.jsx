import { motion } from "framer-motion";

export function StatsCard({ title, value, change, icon: Icon, index = 0 }) {
  const isPositive = change && change.startsWith("+");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-lg border border-border bg-card p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
      {change && (
        <p className={`mt-1 text-xs font-medium ${isPositive ? "text-accent" : "text-destructive"}`}>
          {change} from last month
        </p>
      )}
    </motion.div>
  );
}
