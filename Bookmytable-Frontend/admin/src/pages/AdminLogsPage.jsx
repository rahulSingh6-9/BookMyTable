import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  Search, 
  Eye, 
  Calendar, 
  Activity,
  FileJson,
  Store,
  User,
  ChevronLeft,
  ChevronRight,
  Filter
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
import { PageHeader } from "@/components/shared/PageHeader";
import { getGlobalLogs } from "@/services/logs.service";
import { format } from "date-fns";

export default function AdminLogsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    restaurantId: "",
    performedBy: "",
    action: "all",
    startDate: "",
    endDate: "",
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const queryFilters = useMemo(() => {
    const params = { ...filters, page, limit: 15 };
    if (params.action === "all") delete params.action;
    return params;
  }, [filters, page]);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["logs", "global", queryFilters],
    queryFn: () => getGlobalLogs(queryFilters),
  });

  const logs = Array.isArray(logsData?.data) ? logsData.data : (Array.isArray(logsData) ? logsData : []);
  const totalPages = logsData?.pagination?.pages || 1;

  const handleViewMetadata = (log) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  const safeFormatDate = (dateStr) => {
    try {
      if (!dateStr) return "N/A";
      return format(new Date(dateStr), "MMM d, HH:mm:ss");
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Global System Logs" 
        description="Monitor all restaurant and staff activities across the platform."
      />

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-card p-5 rounded-2xl border border-border shadow-sm">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Restaurant ID</label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by Store..." 
              className="pl-10 rounded-xl"
              value={filters.restaurantId}
              onChange={(e) => setFilters(f => ({ ...f, restaurantId: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">User / Staff</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="ID or Email..." 
              className="pl-10 rounded-xl"
              value={filters.performedBy}
              onChange={(e) => setFilters(f => ({ ...f, performedBy: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Action</label>
          <Select value={filters.action} onValueChange={(v) => setFilters(f => ({ ...f, action: v }))}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="STAFF_INVITED">Staff Invited</SelectItem>
              <SelectItem value="APPROVE_RESTAURANT">Store Approved</SelectItem>
              <SelectItem value="BOOKING_CANCELLED">Booking Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Start Date</label>
          <Input 
            type="date"
            className="rounded-xl"
            value={filters.startDate}
            onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">End Date</label>
          <Input 
            type="date"
            className="rounded-xl"
            value={filters.endDate}
            onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Action</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Restaurant</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Metadata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Loading logs...</TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No logs found.</TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{log.performedBy}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">{log.restaurantInfo?.name || "N/A"}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{log.restaurant}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize text-[10px]">{log.role}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {safeFormatDate(log.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewMetadata(log)} className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground font-medium">
            Showing page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg h-8 px-3"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg h-8 px-3"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Metadata Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl overflow-hidden border-border/40">
          <DialogHeader className="pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Event Metadata</DialogTitle>
                <DialogDescription>Full technical details for system monitoring</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-6">
            <div className="bg-slate-950 rounded-2xl p-6 overflow-auto max-h-[400px] shadow-inner border border-slate-800">
              <pre className="text-primary/70 font-mono text-xs leading-relaxed">
                {JSON.stringify(selectedLog?.metadata || {}, null, 2)}
              </pre>
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
