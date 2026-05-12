import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getRestaurantLogs } from "@/services/logs.service";
import { Loader } from "@/components/common/Loader";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { 
  History, 
  User, 
  Activity, 
  Clock, 
  Info, 
  AlertCircle 
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

import { useBranch } from "@/context/BranchContext";

export default function StaffLogs() {
  const { user } = useAuth();
  const { activeBranchId } = useBranch();

  console.log("[StaffLogs] Component Mounted. Active Branch:", activeBranchId);

  const { data: logsData, isLoading, error } = useQuery({
    queryKey: ["staff", "logs", activeBranchId],
    queryFn: async () => {
      console.log("[StaffLogs] Executing getRestaurantLogs for:", activeBranchId);
      const response = await getRestaurantLogs(activeBranchId);
      console.log("[StaffLogs] Logs received:", response?.data?.length || 0);
      return response;
    },
    enabled: !!activeBranchId,
  });

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message="Failed to load audit logs" />;

  const logs = logsData?.data || [];

  const getActionColor = (action) => {
    if (action.includes("DELETE") || action.includes("CANCEL")) return "destructive";
    if (action.includes("UPDATE") || action.includes("EDIT")) return "warning";
    if (action.includes("CREATE") || action.includes("INVITE") || action.includes("ACCEPTED")) return "success";
    return "secondary";
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          Audit Logs
        </h1>
        <p className="text-muted-foreground">Track all operational changes and actions</p>
      </header>

      <div className="space-y-4">
        {logs.map((log) => (
          <div 
            key={log._id} 
            className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <div className={`mt-1 p-2 rounded-lg ${
              log.action.includes("STAFF") ? "bg-blue-100 text-blue-600" : 
              log.action.includes("BOOKING") ? "bg-purple-100 text-purple-600" :
              "bg-muted text-muted-foreground"
            }`}>
              <Activity className="w-4 h-4" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <Badge variant={getActionColor(log.action)} className="text-[10px] uppercase font-bold">
                  {log.action.replace(/_/g, " ")}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(log.createdAt), "MMM d, h:mm a")}
                </span>
              </div>
              
              <p className="text-sm font-medium">
                {log.action.includes("INVITE") ? `Invited staff member` : 
                 log.action.includes("ACCEPTED") ? `Accepted staff invitation` :
                 log.action.includes("BOOKING") ? `Booking status updated` :
                 `Operational action performed`}
              </p>

              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs flex items-center gap-1 text-muted-foreground">
                  <User className="w-3 h-3" />
                  By: {log.performedBy || "System"} 
                  <span className="opacity-60">({log.role})</span>
                </span>
                {log.ipAddress && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    IP: {log.ipAddress}
                  </span>
                )}
              </div>

              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="mt-2 p-2 rounded bg-muted/50 text-[10px] font-mono text-muted-foreground">
                  {JSON.stringify(log.metadata, null, 2)}
                </div>
              )}
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed border-border">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-20" />
            <p className="text-muted-foreground">No logs found for this restaurant.</p>
          </div>
        )}
      </div>
    </div>
  );
}
