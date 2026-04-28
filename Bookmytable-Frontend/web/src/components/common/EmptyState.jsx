import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ icon: Icon = Inbox, title = "Nothing here yet", description = "Get started by adding some content.", actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">{actionLabel}</Button>
      )}
    </motion.div>
  );
}
