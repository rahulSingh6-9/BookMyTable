import { Clock, Info } from "lucide-react";
import { useBranch } from "@/context/BranchContext";
import { useRestaurantLogs } from "@/hooks/useLogs";
import { formatDistanceToNow } from "date-fns";

const formatLogAction = (action) => {
  if (!action) return "Unknown Action";
  return action
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export function ActivityFeed() {
  const { activeBranchId } = useBranch();
  
  console.log("[ActivityFeed] Mounted. activeBranchId:", activeBranchId);

  const { data: logs = [], isLoading } = useRestaurantLogs(activeBranchId, { limit: 10 });
  
  console.log("[ActivityFeed] Query Status - Loading:", isLoading, "Logs Count:", logs?.length || 0);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 shadow-card animate-pulse">
        <h3 className="mb-4 h-4 w-24 bg-muted rounded"></h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-muted"></div>
              <div className="space-y-2">
                <div className="h-3 w-48 bg-muted rounded"></div>
                <div className="h-2 w-12 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card">
      <h3 className="mb-4 text-sm font-semibold text-card-foreground">Recent Activity</h3>
      <div className="space-y-4">
        {(!logs || logs.length === 0) ? (
          <div className="py-6 text-center text-muted-foreground text-xs italic">
            No recent activity recorded.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="flex gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-foreground">
                  {formatLogAction(log.action)} 
                  <span className="text-[10px] ml-2 text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded border border-border/50">
                    {log.metadata?.categoryName || log.metadata?.branchName || log.metadata?.email || ""}
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : "Unknown time"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
