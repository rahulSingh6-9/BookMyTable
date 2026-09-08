import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, LayoutDashboard, Search, Settings2, Trash2, Edit2, Columns, Copy } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { useBranch } from "@/context/BranchContext";
import { useBrand } from "@/context/BrandContext";
import { useDiningAreas, useCreateDiningArea, useDeleteDiningArea } from "@/hooks/useLayouts";
import { FLOOR_OPTIONS } from "@/lib/tableConstants";

export default function LayoutManagementPage() {
  const navigate = useNavigate();
  const { activeBrandSlug } = useBrand();
  const { activeBranchId, activeBranchSlug } = useBranch();
  const restaurantId = activeBranchId;

  const { data: diningAreas = [], isLoading } = useDiningAreas(restaurantId);
  const { mutate: createDiningArea, isPending: isCreating } = useCreateDiningArea(restaurantId);
  const { mutate: deleteDiningArea, isPending: isDeleting } = useDeleteDiningArea(restaurantId);

  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "indoor_dining",
    floor: "",
    customFloor: "",
    description: "",
    includeFamilyArea: false,
    includeCoupleArea: false
  });

  const TYPE_LABELS = {
    indoor_dining: "Indoor Dining",
    outdoor_dining: "Outdoor Dining",
    rooftop_dining: "Rooftop Dining",
    private_room: "Private Room"
  };

  const filteredAreas = diningAreas.filter(da => {
    const label = TYPE_LABELS[da.type] || "Indoor Dining";
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const openNew = () => {
    setForm({
      name: "",
      type: "indoor_dining",
      floor: "",
      customFloor: "",
      description: "",
      includeFamilyArea: false,
      includeCoupleArea: false
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast.error("Dining Area name is required");
      return;
    }
    const defaultSections = [];
    if (form.includeFamilyArea) {
      defaultSections.push({
        _id: `temp_${Date.now()}_family`,
        tableCode: "Family Area",
        type: "section",
        metadata: { isLayoutElement: true, isSection: true, entityLevel: 'SECTION', preset: "family_zone", width: 350, height: 250 },
        position: { x: 50, y: 50, rotation: 0 }
      });
    }
    if (form.includeCoupleArea) {
      defaultSections.push({
        _id: `temp_${Date.now()}_couple`,
        tableCode: "Couple Area",
        type: "section",
        metadata: { isLayoutElement: true, isSection: true, entityLevel: 'SECTION', preset: "couple_zone", width: 250, height: 150 },
        position: { x: 420, y: 50, rotation: 0 }
      });
    }

    const newDiningArea = {
      name: form.name,
      type: form.type,
      floor: form.floor === 'custom' ? form.customFloor : form.floor,
      description: form.description,
      defaultSections
    };

    createDiningArea(newDiningArea, {
      onSuccess: () => {
        setDialogOpen(false);
      }
    });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will remove all layouts inside it.`)) {
      deleteDiningArea(id);
    }
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Layout Management</h1>
              <p className="text-muted-foreground mt-1">Manage restaurant dining areas and professional layouts</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={openNew}
                className="gap-2 rounded-xl shadow-sm h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Create Dining Area
              </Button>
            </div>
          </div>

          <div className="mb-8 bg-card p-4 rounded-2xl border border-border/40 shadow-sm flex items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search dining areas..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 rounded-xl bg-background border-border/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredAreas.map((da) => {
                return (
                  <motion.div
                    key={da._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-card rounded-2xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                          {TYPE_LABELS[da.type] || "Indoor Dining"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 capitalize">
                          {da.floor || 'No Floor Assigned'}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(da._id, TYPE_LABELS[da.type] || "Indoor Dining")}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-6 mt-auto">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {da.description || "No description provided."}
                      </p>
                    </div>

                    <Button 
                      className="w-full rounded-xl h-11 border-primary/20 hover:bg-primary/5" 
                      variant="outline"
                      onClick={() => navigate(`/brand/${activeBrandSlug}/branch/${activeBranchSlug}/operations/layout/${da._id}`)}
                    >
                      Open Editor
                    </Button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filteredAreas.length === 0 && !isLoading && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-border/50 rounded-3xl bg-card/50">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <LayoutDashboard className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">No Dining Areas Found</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Create a professional dining area layout to start organizing your tables and sections.
                </p>
                <Button onClick={openNew} className="h-11 px-6 rounded-xl">
                  <Plus className="h-4 w-4 mr-2" /> Create First Dining Area
                </Button>
              </div>
            )}
          </div>

        </motion.div>
      </div>

      {/* Create Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-3xl border-border/40 sm:max-w-lg p-0 overflow-hidden">
          <div className="p-6 border-b border-border/40 bg-muted/10">
            <DialogTitle className="text-2xl font-bold">Create Dining Area</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Configure your new dining space and its initial layout structure.</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Dining Area Name</Label>
                <Input 
                  placeholder="e.g., Main Dining Room, Sunset Rooftop" 
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Dining Area Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="indoor_dining">Indoor Dining</SelectItem>
                      <SelectItem value="outdoor_dining">Outdoor Dining</SelectItem>
                      <SelectItem value="rooftop_dining">Rooftop Dining</SelectItem>
                      <SelectItem value="private_room">Private Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Floor / Level</Label>
                  <Select value={form.floor} onValueChange={(v) => setForm(f => ({ ...f, floor: v }))}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select Floor" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {FLOOR_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.floor === 'custom' && (
                    <Input 
                      placeholder="Enter custom floor name" 
                      value={form.customFloor}
                      onChange={(e) => setForm(f => ({ ...f, customFloor: e.target.value }))}
                      className="mt-2 h-11 rounded-xl"
                    />
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 block">Description (Optional)</Label>
                <Input 
                  placeholder="Brief description of the space..." 
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
              <Label className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Columns className="h-4 w-4" /> Default Sections
              </Label>
              <p className="text-xs text-muted-foreground mb-4">Automatically generate structural sections inside this dining area.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/40">
                  <div>
                    <p className="font-medium text-sm">Family Area</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Large section designed for group seating</p>
                  </div>
                  <Switch 
                    checked={form.includeFamilyArea} 
                    onCheckedChange={(c) => setForm(f => ({ ...f, includeFamilyArea: c }))} 
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/40">
                  <div>
                    <p className="font-medium text-sm">Couple Area</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Intimate section optimized for 2-seaters</p>
                  </div>
                  <Switch 
                    checked={form.includeCoupleArea} 
                    onCheckedChange={(c) => setForm(f => ({ ...f, includeCoupleArea: c }))} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border/40 bg-muted/10 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl h-11 px-6">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating} className="rounded-xl h-11 px-8">
              {isCreating ? "Creating..." : "Create Area"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
