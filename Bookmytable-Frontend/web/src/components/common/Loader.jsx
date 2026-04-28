import { motion } from "framer-motion";

export function Loader({ text = "Loading..." }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <motion.div
        className="flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-3 w-3 rounded-full bg-primary"
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
          />
        ))}
      </motion.div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
