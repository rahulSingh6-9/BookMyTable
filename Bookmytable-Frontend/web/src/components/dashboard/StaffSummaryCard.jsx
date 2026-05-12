import { motion } from "framer-motion";
import { Users, UserCheck, UserPlus, ShieldAlert, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

export function StaffSummaryCard({ staff = [], invites = [] }) {
  const stats = useMemo(() => {
    const active = staff.filter(s => s.status === 'active' || s.isActive);
    const managers = staff.filter(s => ['manager', 'owner', 'co_owner'].includes(s.role?.toLowerCase()));
    
    return [
      { label: "Total Staff", value: staff.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Active", value: active.length, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "Pending Invites", value: invites.length, icon: UserPlus, color: "text-amber-600", bg: "bg-amber-50" },
      { label: "Managers", value: managers.length, icon: ShieldAlert, color: "text-indigo-600", bg: "bg-indigo-50" },
    ];
  }, [staff, invites]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-border bg-card shadow-card flex flex-col h-full"
    >
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h3 className="font-bold text-foreground">Staff Summary</h3>
        <Link to="/owner/staff" className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="p-6 grid grid-cols-2 gap-4 flex-1">
        {stats.map((stat) => (
          <div key={stat.label} className="p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className={`h-8 w-8 rounded-md ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <span className="text-xl font-bold text-foreground">{stat.value}</span>
            </div>
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-muted/10 border-t border-border">
        <div className="flex items-center gap-2">
           <div className="flex -space-x-2">
              {staff.slice(0, 3).map((s, i) => (
                <div key={i} className="h-6 w-6 rounded-full border-2 border-card bg-primary/10 flex items-center justify-center text-[8px] font-bold">
                  {s.user?.name?.charAt(0) || "S"}
                </div>
              ))}
           </div>
           <p className="text-[10px] text-muted-foreground">
             {staff.length > 0 ? `Managed by ${staff[0]?.user?.name || 'Manager'}` : 'No staff members added yet'}
           </p>
        </div>
      </div>
    </motion.div>
  );
}
