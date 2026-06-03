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
  Server,
  AlertTriangle,
  Info,
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
import { getSystemLogs } from "@/services/logs.service";
import { format } from "date-fns";

export default function AdminLogsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    service: "all",
    level: "all",
    startDate: "",
    endDate: "",
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const queryFilters = useMemo(() => {
    const params = { ...filters, page, limit: 15 };
    if (params.service === "all") delete params.service;
    if (params.level === "all") delete params.level;
    return params;
  }, [filters, page]);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["logs", "system", queryFilters],
    queryFn: () => getSystemLogs(queryFilters),
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

  const getLevelBadge = (level) => {
    switch (level) {
      case "error":
        return <Badge variant="destructive" className="font-mono text-[10px] uppercase"><ShieldAlert className="w-3 h-3 mr-1" /> Error</Badge>;
      case "warn":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-mono text-[10px] uppercase"><AlertTriangle className="w-3 h-3 mr-1" /> Warn</Badge>;
      case "info":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-mono text-[10px] uppercase"><Info className="w-3 h-3 mr-1" /> Info</Badge>;
      default:
        return <Badge variant="outline" className="font-mono text-[10px] uppercase">{level}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="System Logs" 
        description="Monitor backend services, Kafka consumer failures, and technical events."
      />

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-5 rounded-2xl border border-border shadow-sm">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Service</label>
          <div className="relative">
            <Select value={filters.service} onValueChange={(v) => setFilters(f => ({ ...f, service: v }))}>
              <SelectTrigger className="rounded-xl pl-9">
                <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="admin-service">admin-service</SelectItem>
                <SelectItem value="restaurant-service">restaurant-service</SelectItem>
                <SelectItem value="booking-service">booking-service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Level</label>
          <Select value={filters.level} onValueChange={(v) => setFilters(f => ({ ...f, level: v }))}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="info">Info</SelectItem>
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
              <TableHead>Level</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Metadata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Loading system logs...</TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No system logs found.</TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    {getLevelBadge(log.level)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-medium font-mono">{log.service}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold">{log.message || "N/A"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground font-mono">{log.source || "N/A"}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {safeFormatDate(log.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewMetadata(log)} className="h-8 w-8 p-0">
                      <FileJson className="w-4 h-4 text-muted-foreground hover:text-foreground" />
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
        <DialogContent className="sm:max-w-[800px] rounded-2xl overflow-hidden border-border/40">
          <DialogHeader className="pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Log Metadata</DialogTitle>
                <DialogDescription>Full technical details, stack traces, and payloads.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-6">
            <div className="bg-slate-950 rounded-2xl p-6 overflow-auto max-h-[500px] shadow-inner border border-slate-800">
              <pre className="text-primary/70 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">
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
