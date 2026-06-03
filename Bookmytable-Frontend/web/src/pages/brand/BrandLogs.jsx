import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  History, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  Activity,
  FileJson,
  XCircle,
  User,
  ShieldCheck
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { useBrand } from "@/context/BrandContext";
import { getBrandLogs } from "@/services/logs.service";
import { Loader } from "@/components/common/Loader";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const ACTION_TYPES = [
  { value: "BRAND_CREATED", label: "Brand Created" },
  { value: "BRAND_UPDATED", label: "Brand Updated" },
  { value: "BRANCH_CREATED", label: "Branch Created" },
  { value: "BRANCH_SOFT_DELETED", label: "Branch Soft Deleted" },
  { value: "BRANCH_PERMANENTLY_DELETED", label: "Branch Permanently Deleted" },
  { value: "BRANCH_RESTORED", label: "Branch Restored" },
  { value: "BRANCH_DEACTIVATED", label: "Branch Deactivated" },
  { value: "SUBSCRIPTION_UPDATED", label: "Subscription Updated" },
  { value: "MEMBERSHIP_DELETED", label: "Membership Deleted" },
];

export default function BrandLogs() {
  const { activeBrand } = useBrand();

  const [filters, setFilters] = useState({
    action: "all",
    performedBy: "",
    startDate: "",
    endDate: ""
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const queryFilters = useMemo(() => {
    const params = { ...filters };
    if (params.action === "all") delete params.action;
    return params;
  }, [filters]);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["brand", "logs", activeBrand?.id, queryFilters],
    queryFn: () => getBrandLogs(activeBrand?.id, queryFilters),
    enabled: !!activeBrand?.id,
  });

  const logs = logsData?.data || logsData || [];

  const handleViewMetadata = (log) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  const getActionColor = (action) => {
    if (action.includes("INVITED") || action.includes("CREATED") || action.includes("RESTORED")) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (action.includes("UPDATED")) return "bg-blue-50 text-blue-600 border-blue-100";
    if (action.includes("DELETED") || action.includes("REMOVED") || action.includes("DEACTIVATED")) return "bg-red-50 text-red-600 border-red-100";
    if (action.includes("SUBSCRIPTION")) return "bg-purple-50 text-purple-600 border-purple-100";
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  const resetFilters = () => {
    setFilters({
      action: "all",
      performedBy: "",
      startDate: "",
      endDate: ""
    });
  };

  return (
    <div className="w-full min-h-screen bg-background/50">
      <div className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-3xl border border-border/40 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Brand Audit Logs</h1>
                <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Track all high-level operational changes, subscriptions, and branch operations
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={resetFilters} className="rounded-xl gap-2">
              <XCircle className="w-4 h-4" /> Reset Filters
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-4 rounded-2xl border border-border/40 shadow-sm">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Action Type</label>
              <Select value={filters.action} onValueChange={(v) => setFilters(f => ({ ...f, action: v }))}>
                <SelectTrigger className="rounded-xl bg-muted/20 border-none">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Actions</SelectItem>
                  {ACTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Performed By</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="ID or Name..." 
                  className="pl-10 rounded-xl bg-muted/20 border-none h-10"
                  value={filters.performedBy}
                  onChange={(e) => setFilters(f => ({ ...f, performedBy: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="date"
                  className="pl-10 rounded-xl bg-muted/20 border-none h-10"
                  value={filters.startDate}
                  onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="date"
                  className="pl-10 rounded-xl bg-muted/20 border-none h-10"
                  value={filters.endDate}
                  onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[250px]">Action</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center"><Loader /></TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                          <History className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-muted-foreground font-medium">No brand logs found.</p>
                        <p className="text-xs text-muted-foreground/60 max-w-[250px]">
                          Actions like branch operations or subscription updates will appear here.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log._id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <Badge variant="outline" className={cn("capitalize font-medium px-2 py-0.5", getActionColor(log.action))}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                             <User className="w-3 h-3" />
                           </div>
                           <span className="text-sm font-medium">{log.performedByInfo?.name || log.performedBy || "System"}</span>
                        </div>
                        {log.performedByInfo?.email && <p className="text-[10px] text-muted-foreground ml-8">{log.performedByInfo.email}</p>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize text-[10px]">{log.role || "N/A"}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewMetadata(log)}
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>

      {/* Metadata Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl overflow-hidden">
          <DialogHeader className="pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg">Event Metadata</DialogTitle>
                <DialogDescription>Full technical details for this operation</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-6">
            <div className="bg-slate-950 rounded-2xl p-6 overflow-auto max-h-[400px] shadow-inner border border-slate-800">
              <pre className="text-indigo-400 font-mono text-xs leading-relaxed">
                {JSON.stringify(selectedLog?.metadata || {}, null, 2)}
              </pre>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-xs py-2 border-b border-border/40">
                <span className="text-muted-foreground">IP Address</span>
                <span className="font-medium">{selectedLog?.ipAddress || "N/A"}</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-border/40">
                <span className="text-muted-foreground">Log ID</span>
                <span className="font-medium font-mono text-[10px]">{selectedLog?._id}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button onClick={() => setModalOpen(false)} className="rounded-xl px-8">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
