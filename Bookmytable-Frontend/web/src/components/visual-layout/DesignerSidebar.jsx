import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, Layers, Info } from "lucide-react";
import { DINING_AREA_PRESETS } from "@/lib/tableConstants";
import { useBranch } from "@/context/BranchContext";
import { useDiningAreas } from "@/hooks/useLayouts";
import { CreateTableModal } from "@/components/tables/CreateTableModal";
import { useCreateTable } from "@/hooks/useTables";

// Human labels for the context badge
const DINING_AREA_TYPE_LABELS = {
  indoor_dining:  'Indoor',
  outdoor_dining: 'Outdoor',
  rooftop_dining: 'Rooftop',
  private_room:   'Private Room',
};

export function DesignerSidebar({ designer, onTableAdded, onClose, isEditMode, setIsEditMode, activeDiningAreaId, diningArea }) {
  const { 
    availableFloors, 
    activeFloor, setActiveFloor, 
    addUnsavedTable,
    tables = []
  } = designer;

  const { activeBranchId } = useBranch();
  const { data: diningAreas = [] } = useDiningAreas(activeBranchId);
  const { mutate: createTable, isPending: isCreating } = useCreateTable(activeBranchId);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Auto-derive type and floor from the parent Dining Area
  const autoType  = diningArea?.type || 'indoor_dining';
  const autoFloor = diningArea?.floor || 'ground';
  const autoTypeLabel  = DINING_AREA_TYPE_LABELS[diningArea?.type] || 'Indoor';

  // Compute unplaced tables
  const allBusinessTables = designer.allTables || [];
  const placedTableIds = designer.placedTableIds || new Set();
  
  // Filter unplaced tables strictly based on current Dining Area context (type and floor)
  const unplacedTables = allBusinessTables.filter(t => {
    const matchesType = t.type === autoType;
    const matchesFloor = t.floor === autoFloor;
    const isUnplaced = !placedTableIds.has(t._id);
    
    return matchesType && matchesFloor && isUnplaced;
  });

  const handleCreateNewTable = (formData) => {
    createTable(formData, {
      onSuccess: () => {
        setCreateModalOpen(false);
        if (onTableAdded) onTableAdded();
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50 bg-muted/20">
        <h3 className="font-bold text-foreground flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Layout Manager</h3>
        <p className="text-xs text-muted-foreground mt-1">Select a floor and section to edit.</p>
      </div>

      <div className="p-4 space-y-4 border-b border-border/50">
        <div>
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Current Floor</Label>
          <Select value={activeFloor} onValueChange={setActiveFloor}>
            <SelectTrigger className="w-full bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {availableFloors.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        <Tabs defaultValue="areas" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4 bg-muted/50 rounded-xl p-1 h-11">
            <TabsTrigger value="areas" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-bold">Areas</TabsTrigger>
            <TabsTrigger value="sections" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-bold">Sections</TabsTrigger>
            <TabsTrigger value="tables" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-bold">Tables</TabsTrigger>
          </TabsList>
          
          <TabsContent value="areas" className="space-y-4 focus-visible:outline-none">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">1. Add Dining Areas</h4>
              <p className="text-xs text-muted-foreground mb-3">Place a top-level Dining Area on the canvas.</p>
              
              <div className="grid grid-cols-1 gap-2">
                {diningAreas.filter(da => da._id === activeDiningAreaId).map(da => {
                  const TYPE_LABELS = {
                    indoor_dining: "Indoor Dining",
                    outdoor_dining: "Outdoor Dining",
                    rooftop_dining: "Rooftop Dining",
                    private_room: "Private Room"
                  };
                  const label = TYPE_LABELS[da.type] || "Indoor Dining";
                  const isPlaced = tables.some(t => t.metadata?.entityLevel === 'DINING_AREA' && t.tableCode === label);
                  return (
                    <Button 
                      key={da._id}
                      variant="outline" 
                      className={`w-full justify-start text-xs bg-background border-border/50 shadow-sm ${isPlaced ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
                      disabled={isPlaced}
                      draggable={!isPlaced}
                      onDragStart={(e) => {
                        if (isPlaced) {
                          e.preventDefault();
                          return;
                        }
                        const config = {
                          tableCode: label,
                          capacity: 0,
                          type: da.type || 'indoor_dining',
                          isActive: false,
                          status: 'inactive',
                          metadata: { 
                            isLayoutElement: true,
                            isDiningArea: true,
                            entityLevel: 'DINING_AREA',
                            diningAreaId: da._id,
                            preset: da.type,
                            shape: 'rectangle',
                            width: 500,
                            height: 400
                          }
                        };
                        designer.setExternalDragItem(config);
                        e.dataTransfer.setData("text/plain", "dining_area");
                      }}
                      onDragEnd={() => designer.setExternalDragItem(null)}
                      onClick={() => {
                        if (isPlaced) return;
                        const newId = designer.addUnsavedTable({
                          tableCode: label,
                          capacity: 0,
                          type: da.type || 'indoor_dining',
                          isActive: false,
                          status: 'inactive',
                          metadata: { 
                            isLayoutElement: true,
                            isDiningArea: true,
                            entityLevel: 'DINING_AREA',
                            diningAreaId: da._id,
                            preset: da.type,
                            shape: 'rectangle',
                            width: 500,
                            height: 400
                          }
                        });
                        designer.setSelectedTableId(newId);
                        if (onTableAdded) onTableAdded();
                      }}
                    >
                      <Layers className="h-3 w-3 mr-2 text-primary" /> 
                      <span className="flex-1 text-left">{label}</span>
                      {isPlaced && <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">Added</span>}
                    </Button>
                  );
                })}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tables" className="space-y-4 focus-visible:outline-none">
            {/* Context Badge — shows inherited type and floor */}
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
              <Info className="h-3 w-3 text-primary shrink-0" />
              <p className="text-xs text-primary/80">
                Tables inherit <span className="font-bold">{autoTypeLabel}</span> type
                {autoFloor && autoFloor !== 'ground' ? <> · <span className="font-bold capitalize">{autoFloor.replace('_', ' ')}</span></> : ' · Ground Floor'}
              </p>
            </div>

            <Button 
              className="w-full gap-2 shadow-sm rounded-xl" 
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4" /> Create New Table
            </Button>
            
            <div className="h-px bg-border/50 my-2" />

            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Unplaced Tables ({unplacedTables.length})</h4>
              
              {unplacedTables.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border/50 rounded-xl bg-muted/20">
                  <p className="text-xs text-muted-foreground">No unplaced tables available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {unplacedTables.map(t => (
                    <div 
                      key={t._id}
                      className="flex flex-col p-2 bg-card border border-border/60 rounded-lg cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm"
                      draggable
                      onDragStart={(e) => {
                        designer.setExternalDragItem({ ...t, isRealTable: true });
                        e.dataTransfer.setData("text/plain", "table");
                      }}
                      onDragEnd={() => designer.setExternalDragItem(null)}
                      onClick={() => {
                        // Click to place at default position
                        designer.addPlacedTable({
                          ...t,
                          position: { x: 50, y: 50, rotation: 0 },
                          isNew: false
                        });
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{t.tableCode}</span>
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{t.capacity} seats</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 truncate">
                        {t.sectionLabel || t.section || "No Section"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="sections" className="space-y-4 focus-visible:outline-none">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">1. Add Sections</h4>
              <p className="text-xs text-muted-foreground mb-3">Drop sections into the layout.</p>
              
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: "Family Area", preset: "family_zone" },
                  { label: "Couple Area", preset: "couple_zone" },
                ].map(section => {
                  return (
                    <Button 
                      key={section.preset}
                      variant="outline" 
                      className="w-full justify-start text-xs bg-background border-border/50 shadow-sm cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => {
                      const config = {
                        tableCode: section.label,
                        capacity: 0,
                        type: 'section',
                        isActive: false,
                        status: 'inactive',
                        metadata: { 
                          isLayoutElement: true,
                          isSection: true,
                          entityLevel: 'SECTION',
                          preset: section.preset,
                          shape: 'rectangle',
                          width: 350,
                          height: 250
                        }
                      };
                      designer.setExternalDragItem(config);
                      e.dataTransfer.setData("text/plain", "section");
                    }}
                    onDragEnd={() => designer.setExternalDragItem(null)}
                    onClick={() => {
                      const newId = designer.addUnsavedTable({
                        tableCode: section.label,
                        capacity: 0,
                        type: 'section',
                        isActive: false,
                        status: 'inactive',
                        metadata: { 
                          isLayoutElement: true,
                          isSection: true,
                          entityLevel: 'SECTION',
                          preset: section.preset,
                          shape: 'rectangle',
                          width: 350,
                          height: 250
                        }
                      });
                      designer.setSelectedTableId(newId);
                      if (onTableAdded) onTableAdded();
                    }}
                  >
                    <Layers className="h-3 w-3 mr-2 text-primary" />
                    <span className="flex-1 text-left">{section.label}</span>
                  </Button>
                )})}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">3. Organize Tables</h4>
              <p className="text-xs text-muted-foreground mb-3">Place zones inside Sections to auto-arrange tables.</p>
              
              <Button 
                variant="default" 
                className="w-full justify-start text-sm bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-sm cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => {
                  const config = {
                    tableCode: "Arrangement Zone",
                    capacity: 0,
                    type: 'zone',
                    isActive: false,
                    status: 'inactive',
                    metadata: { 
                      isLayoutElement: true,
                      isArrangementZone: true,
                      entityLevel: 'ZONE',
                      arrangementType: 'grid',
                      arrangementSpacing: 20,
                      arrangementPadding: 20,
                      shape: 'rectangle',
                      width: 300,
                      height: 200
                    }
                  };
                  designer.setExternalDragItem(config);
                  e.dataTransfer.setData("text/plain", "zone");
                }}
                onDragEnd={() => designer.setExternalDragItem(null)}
                onClick={() => {
                  const newId = designer.addUnsavedTable({
                    tableCode: "Arrangement Zone",
                    capacity: 0,
                    type: 'zone',
                    isActive: false,
                    status: 'inactive',
                    metadata: { 
                      isLayoutElement: true,
                      isArrangementZone: true,
                      entityLevel: 'ZONE',
                      arrangementType: 'grid',
                      arrangementSpacing: 20,
                      arrangementPadding: 20,
                      shape: 'rectangle',
                      width: 300,
                      height: 200
                    }
                  });
                  designer.setSelectedTableId(newId);
                  if (onTableAdded) onTableAdded();
                }}
              >
                <LayoutDashboard className="h-4 w-4 mr-3" /> Add Arrangement Zone
              </Button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">3. Add Structural Elements</h4>
              <p className="text-xs text-muted-foreground mb-3">Drag onto wall edges.</p>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Window", type: "window", w: 80, h: 10 },
                  { label: "Door", type: "door", w: 60, h: 10 },
                  { label: "Entrance", type: "entrance", w: 80, h: 30 },
                  ...(diningArea?.type === 'rooftop_dining' ? [{ label: "Stairs", type: "stairs", w: 40, h: 100 }] : []),
                  { label: "View Marker", type: "view_marker", w: 80, h: 30 },
                  { label: "Open Side", type: "open_side", w: 80, h: 20 },
                  { label: "Washroom", type: "washroom", w: 80, h: 80 },
                  { label: "Custom Preset", type: "custom_preset", w: 100, h: 100 }
                ].map(el => (
                  <Button 
                    key={el.type}
                    variant="outline" 
                    className="w-full justify-start text-xs bg-background border-border/50 shadow-sm cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={(e) => {
                      const config = {
                        tableCode: el.label,
                        capacity: 0,
                        type: el.type,
                        isActive: false,
                        status: 'inactive',
                        metadata: { 
                          isLayoutElement: true,
                          isStructuralElement: true,
                          elementType: el.type,
                          shape: 'rectangle',
                          width: el.w,
                          height: el.h
                        }
                      };
                      designer.setExternalDragItem(config);
                      e.dataTransfer.setData("text/plain", "structural");
                    }}
                    onDragEnd={() => designer.setExternalDragItem(null)}
                    onClick={() => toast.info("Drag this element onto a Dining Area wall.")}
                  >
                    {el.label}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Shared Create Table Modal */}
      <CreateTableModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        restaurantId={activeBranchId}
        isCreating={isCreating}
        onSave={handleCreateNewTable}
        defaultDiningAreaId={activeDiningAreaId}
        defaultFloor={autoFloor}
        defaultType={autoType}
      />
    </div>
  );
}
