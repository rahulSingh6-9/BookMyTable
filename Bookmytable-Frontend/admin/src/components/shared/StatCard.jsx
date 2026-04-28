import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export function StatCard({ title, value, icon: Icon, trend, trendValue }) {
  const isPositive = trend === "up";
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="rounded-2xl border-border/40 font-sans shadow-sm overflow-hidden relative group bg-card">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">{value}</h2>
            </div>
            {Icon && (
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                <Icon className="w-6 h-6 text-primary" />
              </div>
            )}
          </div>
          {trendValue && (
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isPositive ? '+' : '-'}{trendValue}%
              </span>
              <span className="text-muted-foreground ml-2">from last month</span>
            </div>
          )}
        </CardContent>
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/40 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </Card>
    </motion.div>
  );
}
