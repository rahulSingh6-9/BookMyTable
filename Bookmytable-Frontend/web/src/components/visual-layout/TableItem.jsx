import { motion } from "framer-motion";
import { Users } from "lucide-react";

export function TableItem({ 
  table, 
  isAvailable = true,
  status,
  isSelected = false, 
  onClick, 
  isEditor = false,
  onDragEnd 
}) {
  // Base scales logic
  const width = table.capacity <= 2 ? 60 : table.capacity <= 4 ? 80 : 100;
  const height = table.capacity <= 2 ? 60 : table.capacity <= 4 ? 60 : 70;
  const borderRadius = table.capacity <= 2 ? '50%' : '12px';

  let bgColor = "bg-muted";
  let borderColor = "border-border";
  let textColor = "text-muted-foreground";

  if (!isEditor) {
    const derivedStatus = status || (isAvailable ? "available" : "occupied");
    if (isSelected) {
      bgColor = "bg-primary/10 backdrop-blur-sm shadow-[0_0_15px_rgba(var(--primary),0.3)]";
      borderColor = "border-primary";
      textColor = "text-primary";
    } else if (derivedStatus === "available") {
      bgColor = "bg-emerald-50 focus:bg-emerald-100 hover:bg-emerald-50 dark:bg-emerald-950/30";
      borderColor = "border-emerald-500/50";
      textColor = "text-emerald-700 dark:text-emerald-400";
    } else if (derivedStatus === "reserved") {
      bgColor = "bg-amber-50 hover:bg-amber-50 dark:bg-amber-950/20";
      borderColor = "border-amber-500/50";
      textColor = "text-amber-700 dark:text-amber-400";
    } else {
      bgColor = "bg-destructive/5 cursor-not-allowed";
      borderColor = "border-destructive/20";
      textColor = "text-destructive/70";
    }
  } else {
    // Editor UI
    bgColor = "bg-card shadow-sm";
    borderColor = "border-border hover:border-primary/50 hover:shadow-md";
    textColor = "text-foreground";
  }

  return (
    <motion.div
      drag={isEditor}
      dragMomentum={false}
      onDragEnd={isEditor ? (e, info) => onDragEnd(table._id, info.point) : undefined}
      initial={{ x: table.position?.x || 0, y: table.position?.y || 0 }}
      animate={{ x: table.position?.x || 0, y: table.position?.y || 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={() => {
        const derivedStatus = status || (isAvailable ? "available" : "occupied");
        if (!isEditor && derivedStatus === "available" && onClick) onClick(table);
      }}
      style={{
        width,
        height,
        position: 'absolute',
        borderRadius,
      }}
      className={`
        flex flex-col items-center justify-center border-2 transition-colors cursor-pointer group
        ${bgColor} ${borderColor} ${textColor}
      `}
      whileHover={(!isEditor && (status || (isAvailable ? "available" : "occupied")) === "available" && !isSelected) ? { scale: 1.05 } : {}}
      whileTap={(!isEditor && (status || (isAvailable ? "available" : "occupied")) === "available") ? { scale: 0.95 } : {}}
    >
      <span className="text-xs font-bold leading-none">{table.tableNumber}</span>
      <div className="flex items-center gap-1 mt-1 opacity-70">
        <Users className="w-3 h-3" />
        <span className="text-[10px] font-medium leading-none">{table.capacity}</span>
      </div>

      {/* Hover Info Tooltip (Simulated with absolute div on group hover) */}
      {!isEditor && (status || (isAvailable ? "available" : "occupied")) === "available" && (
        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-3 py-1.5 rounded-md shadow-md border border-border whitespace-nowrap pointer-events-none z-50">
          <p className="font-semibold">{table.tableNumber}</p>
          <p className="text-muted-foreground capitalize">{table.type} • {table.capacity} Seats</p>
        </div>
      )}
    </motion.div>
  );
}
