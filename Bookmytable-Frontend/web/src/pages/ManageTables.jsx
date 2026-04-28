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
import { useTables } from "@/hooks/useTables";
import { useLayout } from "@/hooks/useLayout";
import { TABLE_TYPES } from "@/lib/mockData";
import { LayoutEditor } from "@/components/visual-layout/LayoutEditor";
import { RoomSelector } from "@/components/visual-layout/RoomSelector";
import { toast } from "sonner";



const typeColor = {
  indoor: "text-primary border-primary/20",
  outdoor: "text-accent border-accent/20",
  vip: "text-amber-500 border-amber-500/20",
};

export default function ManageTables() {
  const { tables, addTable, updateTable, deleteTable } = useTables("1");
  const { rooms, activeRoom, activeRoomId, setActiveRoomId, updateTablePosition, saveLayout } = useLayout("1");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [form, setForm] = useState({ tableNumber: "", capacity: 2, type: "indoor", isActive: true });
  const [activeTab, setActiveTab] = useState("list");

  const openNew = () => {
    setEditingTable(null);
    setForm({ tableNumber: "", capacity: 2, type: "indoor", isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (t) => {
    setEditingTable(t);
    setForm({ tableNumber: t.tableNumber, capacity: t.capacity, type: t.type, isActive: t.isActive });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.tableNumber.trim()) {
      toast.error("Table number is required");
      return;
    }
    if (editingTable) {
      updateTable(editingTable._id, form);
      toast.success("Table updated");
    } else {
      addTable(form);
      toast.success("Table added");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id) => {
    deleteTable(id);
    toast.success("Table removed");
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
                        <h3 className="font-semibold text-card-foreground text-lg">{t.tableNumber}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs capitalize ${typeColor[t.type] || ""}`}>{t.type}</Badge>
                          {!t.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                        <Users className="h-3.5 w-3.5" />
                        <span>{t.capacity} seats</span>
                      </div>
                      <div className="flex gap-2 border-t border-border/40 pt-4 mt-2">
                        <Button variant="ghost" size="sm" className="gap-1 flex-1 h-8 rounded-lg" onClick={() => openEdit(t)}>
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 gap-1 h-8 rounded-lg" onClick={() => handleDelete(t._id)}>
                          <Trash2 className="h-3.5 w-3.5" /> Remove
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
              <Label className="mb-2 block text-sm font-medium">Table Number</Label>
              <Input
                placeholder="e.g., T-07"
                value={form.tableNumber}
                onChange={(e) => setForm((f) => ({ ...f, tableNumber: e.target.value }))}
                className="rounded-lg"
              />
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
            <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border/40 mt-2">
              <Label className="text-sm font-medium cursor-pointer">Active Table</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">Cancel</Button>
            <Button onClick={handleSave} className="rounded-lg">{editingTable ? "Save Changes" : "Create Table"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
