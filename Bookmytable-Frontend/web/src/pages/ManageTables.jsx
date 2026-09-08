import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Users, List } from "lucide-react";
import { TABLE_TYPES } from "@/lib/mockData";
import { BulkAddForm } from "@/components/partner/register/tables/BulkAddForm";
import { toast } from "sonner";
import { Search, Filter } from "lucide-react";
import { FLOOR_OPTIONS, SECTION_OPTIONS } from "@/lib/tableConstants";
import { CreateTableModal } from "@/components/tables/CreateTableModal";
import { getPriceSourceBadgeClass, getPriceSourceLabel } from "@/lib/priceUtils";

import { useBranch } from "@/context/BranchContext";
import { useTables, useCreateTable, useUpdateTable, useDeleteTable, useBulkGenerateTables } from "@/hooks/useTables";



const typeColor = {
  indoor_dining: "text-primary border-primary/20",
  outdoor_dining: "text-accent border-accent/20",
  rooftop_dining: "text-amber-500 border-amber-500/20",
  private_room: "text-purple-500 border-purple-500/20",
};

export default function ManageTables() {
  const { activeBranchId } = useBranch();
  const restaurantId = activeBranchId;

  const { mutate: createTable, isPending: isCreating } = useCreateTable(restaurantId);
  const { mutate: updateTable, isPending: isUpdating } = useUpdateTable(restaurantId);
  const { mutate: deleteTable, isPending: isDeleting } = useDeleteTable(restaurantId);
  const { mutate: bulkGenerateTables, isPending: isBulkGenerating } = useBulkGenerateTables(restaurantId);

  const { data: tables = [], isLoading } = useTables(restaurantId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  // Subscription Usage
  const [usageData, setUsageData] = useState(null);
  
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const { default: apiClient } = await import("@/lib/api");
        const res = await apiClient.get("/restaurants/subscriptions/my-usage");
        if (res.data?.success) {
          setUsageData(res.data.data);
        }
      } catch (e) {
        console.error("Failed to fetch usage data", e);
      }
    };
    fetchUsage();
  }, []);

  const isLimitReached = usageData ? (usageData.usage?.tablesUsed >= usageData.limits?.maxTables) : false;

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFloor, setFilterFloor] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredTables = tables.filter(t => {
    if (searchQuery && !t.tableCode?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterFloor !== "all" && t.floor !== filterFloor) return false;
    if (filterSection !== "all" && t.section !== filterSection) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  const sortedTables = [...filteredTables].sort((a, b) => {
    const floorA = a.floorLabel || a.floor || "";
    const floorB = b.floorLabel || b.floor || "";
    if (floorA !== floorB) return floorA.localeCompare(floorB);

    const sectionA = a.sectionLabel || a.section || "";
    const sectionB = b.sectionLabel || b.section || "";
    if (sectionA !== sectionB) return sectionA.localeCompare(sectionB);

    return (a.tableCode || "").localeCompare(b.tableCode || "", undefined, { numeric: true, sensitivity: 'base' });
  });

  // Grouping
  const groupedTables = sortedTables.reduce((acc, t) => {
    const floor = t.floorLabel || t.floor || "Unassigned Floor";
    const section = t.sectionLabel || t.section || "Unassigned Section";
    if (!acc[floor]) acc[floor] = {};
    if (!acc[floor][section]) acc[floor][section] = [];
    acc[floor][section].push(t);
    return acc;
  }, {});

  const openNew = () => {
    setEditingTable(null);
    setDialogOpen(true);
  };

  const openEdit = (t) => {
    setEditingTable(t);
    setDialogOpen(true);
  };


  const handleSave = (formData) => {
    if (!formData.tableCode.trim()) {
      toast.error("Table code is required");
      return;
    }

    if (formData.capacity < 1) {
      toast.error("Capacity must be at least 1");
      return;
    }

    if (!editingTable) {
      createTable(formData, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    } else {
      updateTable({ tableId: editingTable._id, data: formData }, {
        onSuccess: () => {
          setDialogOpen(false);
          setEditingTable(null);
        },
      });
    }
  };


  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this table?")) {
      deleteTable(id);
    }
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Manage Tables</h1>
              <p className="text-muted-foreground">Configure your restaurant's table list and details</p>
            </div>
            <Button 
              className="gap-2 rounded-xl shadow-sm" 
              onClick={openNew}
              disabled={isLimitReached}
            >
              <Plus className="h-4 w-4" /> Add Table
            </Button>
          </div>

          <div className="w-full">
            <div className="pt-2">
              
              <div className="mb-6">
                <BulkAddForm onGenerate={bulkGenerateTables} disabled={isLimitReached} restaurantId={restaurantId} />
              </div>

              <div className="mb-6 flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-2xl border border-border/40 shadow-sm">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by table code..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 w-full rounded-xl bg-background border-border/50"
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Select value={filterFloor} onValueChange={setFilterFloor}>
                    <SelectTrigger className="h-10 rounded-xl bg-background border-border/50 min-w-[130px]">
                      <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="All Floors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Floors</SelectItem>
                      {Array.from(new Set(tables.map(t => t.floor).filter(Boolean))).map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterSection} onValueChange={setFilterSection}>
                    <SelectTrigger className="h-10 rounded-xl bg-background border-border/50 min-w-[140px]">
                      <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="All Sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {Array.from(new Set(tables.map(t => t.section).filter(Boolean))).map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-10 rounded-xl bg-background border-border/50 min-w-[130px]">
                      <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-8">
                <AnimatePresence>
                  {Object.entries(groupedTables).map(([floorName, sections]) => (
                    <motion.div key={floorName} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border/40 flex items-center gap-2">
                        {floorName}
                      </h2>
                      <div className="space-y-6 pl-2">
                        {Object.entries(sections).map(([sectionName, sectTables]) => (
                          <div key={`${floorName}-${sectionName}`}>
                            <h3 className="text-md font-semibold text-muted-foreground mb-3">{sectionName}</h3>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                              {sectTables.map((t) => (
                                <motion.div
                                  key={t._id}
                                  layout
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-card-foreground text-lg">{t.tableCode}</h3>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className={`text-xs capitalize ${typeColor[t.type] || ""}`}>{t.type}</Badge>
                                      {!t.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                                    </div>
                                  </div>
                                    <div className="space-y-1.5 mb-4">
                                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>{t.capacity} seats</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
                                        <span className="truncate">{t.floorLabel || t.floor || "Unassigned Floor"}</span>
                                        <span>•</span>
                                        <span className="truncate">{t.sectionLabel || t.section || "Unassigned Section"}</span>
                                      </div>
                                      
                                      {t.resolvedPrice > 0 && (
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10 mt-2 w-fit">
                                          ₹{t.resolvedPrice}
                                          {t.priceSource && (
                                            <>
                                              <span className="text-muted-foreground font-normal mx-0.5">•</span>
                                              <span className="text-[10px] uppercase text-muted-foreground">
                                                {t.priceSource === 'override' ? 'Override' : t.priceSource === 'section' ? 'Section' : 'Area'}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                  <div className="flex gap-2 border-t border-border/40 pt-4 mt-2">
                                    <Button variant="ghost" size="sm" className="gap-1 flex-1 h-8 rounded-lg" onClick={() => openEdit(t)}>
                                      <Edit2 className="h-3.5 w-3.5" /> Edit
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 gap-1 h-8 rounded-lg" 
                                      onClick={() => handleDelete(t._id)}
                                      disabled={isDeleting}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" /> {isDeleting ? "..." : "Remove"}
                                    </Button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {sortedTables.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-3xl bg-card">
                  <p className="text-muted-foreground mb-4">No tables yet. Add your first table to get started.</p>
                  <Button onClick={openNew} disabled={isLimitReached}><Plus className="h-4 w-4 mr-2" /> Add Table</Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Dialog using shared component */}
      <CreateTableModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        restaurantId={restaurantId}
        isCreating={isCreating}
        isUpdating={isUpdating}
        editingTable={editingTable}
        onSave={handleSave}
      />
    </div>
  );
}
