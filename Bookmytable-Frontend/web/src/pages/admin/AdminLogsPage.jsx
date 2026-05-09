import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  Activity,
  FileJson,
  Store,
  User,
  ChevronLeft,
  ChevronRight
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
import { getGlobalLogs } from "@/services/logs.service";
import { Loader } from "@/components/common/Loader";
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

  const logs = logsData?.data || logsData?.logs || [];
  const totalPages = logsData?.totalPages || 1;

  const handleViewMetadata = (log) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600 shadow-inner">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global System Logs</h1>
                <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-0.5">
                  <Activity className="w-3.5 h-3.5 text-red-500" />
                  Real-time monitoring across all restaurants
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Restaurant ID</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Filter by Store..." 
                  className="pl-10 rounded-xl border-slate-200"
                  value={filters.restaurantId}
                  onChange={(e) => setFilters(f => ({ ...f, restaurantId: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">User / Staff</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="ID or Email..." 
                  className="pl-10 rounded-xl border-slate-200"
                  value={filters.performedBy}
                  onChange={(e) => setFilters(f => ({ ...f, performedBy: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Action</label>
              <Select value={filters.action} onValueChange={(v) => setFilters(f => ({ ...f, action: v }))}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="STAFF_INVITED">Staff Invited</SelectItem>
                  <SelectItem value="RESTAURANT_APPROVED">Store Approved</SelectItem>
                  <SelectItem value="BOOKING_CANCELLED">Booking Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Start Date</label>
              <Input 
                type="date"
                className="rounded-xl border-slate-200"
                value={filters.startDate}
                onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">End Date</label>
              <Input 
                type="date"
                className="rounded-xl border-slate-200"
                value={filters.endDate}
                onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Action</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center"><Loader /></TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-400">No logs found.</TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log._id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px] uppercase">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-700">{log.performedBy}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">{log.restaurantInfo?.name || "N/A"}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.restaurant}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize text-[10px]">{log.role}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewMetadata(log)} className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <p className="text-xs text-slate-500 font-medium">
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
        </motion.div>
      </div>

      {/* Metadata Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl">
          <DialogHeader>
             <DialogTitle>Log Details</DialogTitle>
             <DialogDescription>Full audit metadata for system monitoring</DialogDescription>
          </DialogHeader>
          <div className="bg-slate-900 rounded-xl p-4 overflow-auto max-h-[350px]">
             <pre className="text-emerald-400 font-mono text-[11px] leading-relaxed">
                {JSON.stringify(selectedLog?.metadata || {}, null, 2)}
             </pre>
          </div>
          <div className="flex justify-end mt-4">
             <Button onClick={() => setModalOpen(false)} className="rounded-xl">Close Details</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
