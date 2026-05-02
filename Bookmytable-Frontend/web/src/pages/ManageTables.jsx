import { useState } from "react";
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
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { useMyRestaurant, } from "../hooks/useRestaurantSettings";
import { useTables, useCreateTable, useUpdateTable, useDeleteTable } from "@/hooks/useTables";



const typeColor = {
  indoor: "text-primary border-primary/20",
  outdoor: "text-accent border-accent/20",
  vip: "text-amber-500 border-amber-500/20",
};

export default function ManageTables() {
  const { user } = useAuth();
  const { data: restaurant } = useMyRestaurant();
  const restaurantId = restaurant?._id;

  const { mutate: createTable, isPending: isCreating } = useCreateTable(restaurantId);
  const { mutate: updateTable, isPending: isUpdating } = useUpdateTable(restaurantId);
  const { mutate: deleteTable, isPending: isDeleting } = useDeleteTable(restaurantId);

  const { data: tables = [], isLoading } = useTables(restaurantId);

  const { rooms, activeRoom, activeRoomId, setActiveRoomId, updateTablePosition, saveLayout } = useLayout(restaurantId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [form, setForm] = useState({ tableCode: "", capacity: 2, type: "indoor", floor: "", section: "" });
  const [activeTab, setActiveTab] = useState("list");

  const openNew = () => {
    setEditingTable(null);
    setForm({ tableCode: "", capacity: 2, type: "indoor", floor: "", section: "", isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (t) => {
    setEditingTable(t);
    setForm({ 
      tableCode: t.tableCode, 
      capacity: t.capacity, 
      type: t.type, 
      floor: t.floor || "", 
      section: t.section || "", 
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
          setForm({ tableCode: "", capacity: 2, type: "indoor", floor: "", section: "" });
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
                <Button className="gap-2 rounded-xl shadow-sm" onClick={openNew}>
                  <Plus className="h-4 w-4" /> Add Table
                </Button>
              )}
            </div>

            <TabsContent value="list" className="animate-in fade-in slide-in-from-bottom-2 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence>
                  {tables.map((t) => (
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
                        {(t.floor || t.section) && (
                          <p className="text-xs text-muted-foreground italic">
                            {t.floor} {t.section && `• ${t.section}`}
                          </p>
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
                </AnimatePresence>
              </div>

              {tables.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-3xl bg-card">
                  <p className="text-muted-foreground mb-4">No tables yet. Add your first table to get started.</p>
                  <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add Table</Button>
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
                <Input
                  placeholder="e.g., Ground"
                  value={form.floor}
                  onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                  className="rounded-lg"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">Section</Label>
                <Input
                  placeholder="e.g., Hall"
                  value={form.section}
                  onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                  className="rounded-lg"
                />
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
