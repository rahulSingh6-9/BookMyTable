import React from "react";

const StatsCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    blue: "bg-primary/10 text-primary",
    green: "bg-emerald-500/10 text-emerald-600",
    yellow: "bg-amber-500/10 text-amber-600",
    red: "bg-destructive/10 text-destructive",
    purple: "bg-purple-500/10 text-purple-600",
  };

  return (
    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border/40 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colorMap[color] || colorMap.blue}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
