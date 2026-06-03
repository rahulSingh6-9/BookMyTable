import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Users, LayoutDashboard, List } from "lucide-react";
import { useLayout } from "@/hooks/useLayout";
import { TABLE_TYPES } from "@/lib/mockData";
import { LayoutEditor } from "@/components/visual-layout/LayoutEditor";
import { RoomSelector } from "@/components/visual-layout/RoomSelector";
import { BulkAddForm } from "@/components/partner/register/tables/BulkAddForm";
import { toast } from "sonner";
import { Search, Filter } from "lucide-react";
import { FLOOR_OPTIONS, SECTION_OPTIONS } from "@/lib/tableConstants";

import { useBranch } from "@/context/BranchContext";
import { useTables, useCreateTable, useUpdateTable, useDeleteTable, useBulkGenerateTables } from "@/hooks/useTables";



const typeColor = {
  indoor: "text-primary border-primary/20",
  outdoor: "text-accent border-accent/20",
  vip: "text-amber-500 border-amber-500/20",
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
  const [form, setForm] = useState({ tableCode: "", capacity: 2, type: "indoor", floor: "", floorLabel: "", section: "", sectionLabel: "" });
  const [activeTab, setActiveTab] = useState("list");

  // Subscription Usage
  const [usageData, setUsageData] = useState(null);
  
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const { default: apiClient } = await import("@/lib/api");
        const res = await apiClient.get("/subscriptions/my-usage");
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

  const { rooms, activeRoom, activeRoomId, setActiveRoomId, updateTablePosition, saveLayout } = useLayout(restaurantId);

  const openNew = () => {
    setEditingTable(null);
    setForm({ tableCode: "", capacity: 2, type: "indoor", floor: "", floorLabel: "", section: "", sectionLabel: "", isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (t) => {
    setEditingTable(t);
    setForm({ 
      tableCode: t.tableCode, 
      capacity: t.capacity, 
      type: t.type, 
      floor: t.floor || "", 
      floorLabel: t.floorLabel || "",
      section: t.section || "", 
      sectionLabel: t.sectionLabel || "",
      isActive: t.isActive 
    });
    setDialogOpen(true);
  };


  const handleSave = () => {
    if (!form.tableCode.trim()) {
      toast.error("Table code is required");
      return;
    }

    if (form.capacity < 1) {
      toast.error("Capacity must be at least 1");
      return;
    }

    if (!editingTable) {
      createTable(form, {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({ tableCode: "", capacity: 2, type: "indoor", floor: "", floorLabel: "", section: "", sectionLabel: "" });
        },
      });
    } else {
      updateTable({ tableId: editingTable._id, data: form }, {
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

  const handleSaveLayout = () => {
    saveLayout();
    toast.success("Layout saved successfully!");
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Manage Tables</h1>
              <p className="text-muted-foreground">Configure your restaurant's table layout and details</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-muted/50 rounded-xl p-1">
                <TabsTrigger value="list" className="rounded-lg gap-2 px-4 transition-all">
                  <List className="w-4 h-4" /> List View
                </TabsTrigger>
                <TabsTrigger value="visual" className="rounded-lg gap-2 px-4 transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <LayoutDashboard className="w-4 h-4" /> Visual Editor
                </TabsTrigger>
              </TabsList>
              
              {activeTab === "list" && (
                <Button 
                  className="gap-2 rounded-xl shadow-sm" 
                  onClick={openNew}
                  disabled={isLimitReached}
                >
                  <Plus className="h-4 w-4" /> Add Table
                </Button>
              )}
            </div>

            <TabsContent value="list" className="animate-in fade-in slide-in-from-bottom-2 focus-visible:outline-none focus-visible:ring-0">
              
              <div className="mb-6">
                <BulkAddForm onGenerate={bulkGenerateTables} disabled={isLimitReached} />
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
            </TabsContent>

            <TabsContent value="visual" className="animate-in fade-in slide-in-from-bottom-2 focus-visible:outline-none focus-visible:ring-0">
              <RoomSelector 
                rooms={rooms} 
                activeRoomId={activeRoomId} 
                onSelect={setActiveRoomId} 
              />
              <LayoutEditor 
                room={activeRoom}
                updateTablePosition={updateTablePosition}
                saveLayout={handleSaveLayout}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl border-border/40 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTable ? "Edit Table" : "Add Table"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-2 block text-sm font-medium">Table Code</Label>
              <Input
                placeholder="e.g., T-07"
                value={form.tableCode}
                onChange={(e) => setForm((f) => ({ ...f, tableCode: e.target.value }))}
                className="rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">Floor</Label>
                <Select value={form.floor} onValueChange={(v) => setForm(f => ({ ...f, floor: v, floorLabel: v !== 'custom' ? FLOOR_OPTIONS.find(o => o.value === v)?.label : "" }))}>
                  <SelectTrigger className="rounded-lg bg-white"><SelectValue placeholder="Select Floor" /></SelectTrigger>
                  <SelectContent>
                    {FLOOR_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.floor === 'custom' && (
                  <Input 
                    placeholder="Enter custom floor name" 
                    value={form.floorLabel}
                    onChange={(e) => setForm(f => ({ ...f, floorLabel: e.target.value }))}
                    className="mt-2 rounded-lg"
                  />
                )}
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">Section</Label>
                <Select value={form.section} onValueChange={(v) => setForm(f => ({ ...f, section: v, sectionLabel: v !== 'custom' ? SECTION_OPTIONS.find(o => o.value === v)?.label : "" }))}>
                  <SelectTrigger className="rounded-lg bg-white"><SelectValue placeholder="Select Section" /></SelectTrigger>
                  <SelectContent>
                    {SECTION_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.section === 'custom' && (
                  <Input 
                    placeholder="Enter custom section name" 
                    value={form.sectionLabel}
                    onChange={(e) => setForm(f => ({ ...f, sectionLabel: e.target.value }))}
                    className="mt-2 rounded-lg"
                  />
                )}
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">Capacity (seats)</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {TABLE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
           
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-10 mb-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">Cancel</Button>
            <Button 
              onClick={handleSave} 
              className="rounded-lg" 
              disabled={isCreating || isUpdating}
            >
              {isCreating ? "Creating..." : isUpdating ? "Saving..." : (editingTable ? "Save Changes" : "Create Table")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
