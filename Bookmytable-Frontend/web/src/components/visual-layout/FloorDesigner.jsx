import { useState, useCallback, useEffect, useRef } from "react";
import { DesignerSidebar } from "./DesignerSidebar";
import { DesignerCanvas } from "./DesignerCanvas";
import { DesignerProperties } from "./DesignerProperties";
import { useFloorDesigner } from "@/hooks/useFloorDesigner";
import { useUpdateTable, useDeleteTable } from "@/hooks/useTables";
import { useUpdateLayoutProject } from "@/hooks/useLayouts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save, AlertTriangle, Monitor, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

export function FloorDesigner({ tables: allTables, restaurantId, diningArea, layoutProject }) {
  // Combine business tables and layout elements into a flat array for the designer
  const initialTables = [];
  
  if (layoutProject?.canvasState) {
    const { diningAreas = [], sections = [], arrangementZones = [], presets = [], tables: canvasTables = [] } = layoutProject.canvasState;
    initialTables.push(...diningAreas, ...sections, ...arrangementZones, ...presets);
    
    // For business tables, override their position with the canvas position
    canvasTables.forEach(ct => {
      const businessTable = allTables.find(bt => bt._id === ct.tableId);
      if (businessTable) {
        initialTables.push({ 
           ...businessTable, 
           position: ct.position, 
           rotation: ct.rotation, 
           ...ct,
           metadata: {
              ...(businessTable.metadata || {}),
              sectionId: ct.sectionId,
              zoneId: ct.zoneId,
              diningAreaId: ct.diningAreaId,
              resolvedPrice: ct.resolvedPrice,
              priceSource: ct.priceSource
           }
        });
      }
    });
  }

  const designer = useFloorDesigner(initialTables);
  const { mutateAsync: updateTable } = useUpdateTable(restaurantId);
  const { mutateAsync: deleteTable } = useDeleteTable(restaurantId);
  const { mutateAsync: updateLayoutProject } = useUpdateLayoutProject();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Default to View Mode
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile

  // Professional Resizable Sidebar State
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem("designer_left_width");
    return saved ? parseInt(saved, 10) : 320;
  });
  const [rightWidth, setRightWidth] = useState(() => {
    const saved = localStorage.getItem("designer_right_width");
    return saved ? parseInt(saved, 10) : 320;
  });
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  
  const resizeRef = useRef({ type: null, startX: 0, startWidth: 0 });

  useEffect(() => {
    localStorage.setItem("designer_left_width", leftWidth);
    localStorage.setItem("designer_right_width", rightWidth);
  }, [leftWidth, rightWidth]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizeRef.current.type) return;
      
      e.preventDefault();
      const dx = e.clientX - resizeRef.current.startX;
      
      if (resizeRef.current.type === 'left') {
        const newWidth = Math.max(260, Math.min(500, resizeRef.current.startWidth + dx));
        setLeftWidth(newWidth);
      } else if (resizeRef.current.type === 'right') {
        const newWidth = Math.max(300, Math.min(550, resizeRef.current.startWidth - dx));
        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (resizeRef.current.type) {
        document.body.style.cursor = 'default';
        resizeRef.current.type = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResize = (e, type) => {
    e.preventDefault();
    resizeRef.current = {
      type,
      startX: e.clientX,
      startWidth: type === 'left' ? leftWidth : rightWidth
    };
    document.body.style.cursor = 'col-resize';
  };

  const handleSaveLayout = async () => {
    if (!designer.hasUnsavedChanges) return;
    
    setIsSaving(true);
    let successCount = 0;
    
    try {
      // 1. Save Business Tables
      const businessTablesToUpdate = Array.from(designer.dirtyTables)
        .map(id => designer.tables.find(t => t._id === id))
        .filter(t => t && !t.metadata?.isLayoutElement);

      const tablePromises = businessTablesToUpdate.map(async (tableData) => {
        const { isNew, _id, ...payload } = tableData;
        if (!isNew) {
          await updateTable({ tableId: _id, data: payload });
          successCount++;
        }
      });
      await Promise.all(tablePromises);

      // 2. Save LayoutProject Canvas State
      if (layoutProject) {
        const canvasState = {
          diningAreas: designer.tables.filter(t => t.metadata?.isDiningArea),
          sections: designer.tables.filter(t => t.metadata?.isSection),
          arrangementZones: designer.tables.filter(t => t.metadata?.isArrangementZone),
          presets: designer.tables.filter(t => t.metadata?.isStructuralElement && !t.metadata?.isSection && !t.metadata?.isArrangementZone),
          tables: designer.tables.filter(t => !t.metadata?.isLayoutElement).map(t => ({
            tableId: t._id,
            position: t.position,
            rotation: t.rotation,
            sectionId: t.metadata?.sectionId || null,
            zoneId: t.metadata?.zoneId || null,
            diningAreaId: t.metadata?.diningAreaId || null,
            resolvedPrice: t.metadata?.resolvedPrice ?? 0,
            priceSource: t.metadata?.priceSource ?? 'none',
          })),
          connections: [],
          viewport: { x: 0, y: 0 },
          zoom: 1,
        };

        await updateLayoutProject({ layoutId: layoutProject._id, data: { canvasState } });
        successCount++;
      }

      toast.success(`Successfully saved layout changes`);
      designer.clearDirtyState();
    } catch (error) {
      toast.error("Failed to save layout changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTable = async (tableId) => {
    const table = designer.tables.find(t => t._id === tableId);
    if (!table) return;

    let confirmMsg = "Are you sure you want to permanently delete this object?";
    
    if (table.metadata?.isDiningArea) {
      confirmMsg = "Are you sure you want to permanently delete this dining area? All contained sections, zones and tables will also be removed.";
    } else if (table.metadata?.isSection) {
      confirmMsg = "Are you sure you want to permanently delete this section? All contained zones and tables will also be removed.";
    } else if (table.metadata?.isArrangementZone) {
      confirmMsg = "Are you sure you want to permanently delete this arrangement zone? All contained tables will also be removed.";
    } else if (table.metadata?.isStructuralElement) {
      confirmMsg = `Delete this ${table.metadata.elementType || 'element'}?`;
    } else if (table.metadata?.isLayoutElement) {
      confirmMsg = `Delete this layout element?`;
    } else {
      confirmMsg = "Are you sure you want to permanently delete this table?";
    }

    if (table.isNew) {
      // If it's a new unsaved table, we don't need a heavy permanent deletion warning, 
      // but we should still ask for confirmation if it's a large area or zone
      if (!table.metadata?.isStructuralElement && !table.metadata?.isLayoutElement) {
         if (!window.confirm(`Remove this unsaved ${table.metadata?.isDiningArea ? 'dining area' : table.metadata?.isArrangementZone ? 'zone' : 'table'}?`)) {
           return;
         }
      }
      designer.removeTableLocally(tableId);
    } else {
      if (window.confirm(confirmMsg)) {
        try {
          const toDelete = new Set([tableId]);
          let added;
          do {
            added = false;
            designer.tables.forEach(t => {
              if (t.metadata?.diningAreaId && toDelete.has(t.metadata.diningAreaId) && !toDelete.has(t._id)) {
                toDelete.add(t._id);
                added = true;
              }
              if (t.metadata?.sectionId && toDelete.has(t.metadata.sectionId) && !toDelete.has(t._id)) {
                toDelete.add(t._id);
                added = true;
              }
              if (t.metadata?.zoneId && toDelete.has(t.metadata.zoneId) && !toDelete.has(t._id)) {
                toDelete.add(t._id);
                added = true;
              }
            });
          } while (added);

          const deletePromises = Array.from(toDelete).map(id => {
            const t = designer.tables.find(tbl => tbl._id === id);
            if (t && !t.isNew) {
              return deleteTable(id);
            }
            return Promise.resolve();
          });

          await Promise.all(deletePromises);
          designer.removeTableLocally(tableId); // Local cascading deletion handles the rest
        } catch (error) {
          toast.error("Failed to delete objects");
        }
      }
    }
  };

  return (
    <div className="relative isolate z-0 flex flex-col h-[800px] border border-border/50 rounded-2xl overflow-hidden bg-background shadow-sm">
      
      {/* Top Save Bar (appears when dirty) */}
      {designer.hasUnsavedChanges && (
        <div className="bg-accent/10 border-b border-accent/20 px-4 py-3 flex items-center justify-between shadow-sm z-50">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Unsaved changes
          </div>
          <Button 
            size="sm" 
            onClick={handleSaveLayout} 
            disabled={isSaving}
            className="rounded-full shadow-sm"
          >
            {isSaving ? "Saving..." : <><Save className="h-3 w-3 mr-2" /> Save Layout</>}
          </Button>
        </div>
      )}



      <div className="flex flex-1 h-full overflow-hidden relative">
        {/* Left Sidebar */}
        <div 
          className={`absolute lg:relative z-40 h-full bg-card flex flex-col transition-all duration-300 ${isEditMode && (sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) ? 'translate-x-0' : '-translate-x-full opacity-0 lg:w-0'}`}
          style={{ 
            width: isLeftCollapsed ? 0 : leftWidth,
            minWidth: isLeftCollapsed ? 0 : undefined,
            borderRightWidth: isLeftCollapsed ? 0 : '1px',
            borderColor: 'hsl(var(--border) / 0.5)'
          }}
        >
          {/* Collapse Button */}
          {isEditMode && (
            <Button
              variant="secondary"
              size="icon"
              className={`absolute top-4 -right-3 h-6 w-6 rounded-full border border-border shadow-md z-[60] bg-background hover:bg-muted ${isLeftCollapsed ? '-right-10' : ''}`}
              onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
            >
              {isLeftCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>
          )}

          <div className={`flex-1 h-full overflow-hidden ${isLeftCollapsed ? 'hidden' : 'block'}`}>
            <DesignerSidebar 
              designer={{
                ...designer,
                allTables
              }}
              onTableAdded={() => setSidebarOpen(false)}
              onClose={() => setSidebarOpen(false)}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              activeDiningAreaId={diningArea?._id}
              diningArea={diningArea}
            />
          </div>

          {/* Resize Handle */}
          {!isLeftCollapsed && isEditMode && (
            <div 
              className="absolute top-0 -right-1 w-2 h-full cursor-col-resize z-[55] hover:bg-primary/20 transition-colors"
              onMouseDown={(e) => startResize(e, 'left')}
            />
          )}
        </div>

        {/* Center Canvas */}
        <div className="flex-1 relative isolate bg-muted/5 overflow-hidden min-w-0 z-0">
          {/* Mode Toggle Header */}
          <div className="absolute top-4 right-4 z-50 flex items-center bg-card border border-border/50 rounded-lg shadow-sm p-1">
            {isEditMode && (
              <Button 
                variant={sidebarOpen ? "secondary" : "ghost"} 
                size="sm" 
                className="rounded-md h-8 text-xs px-3 mr-2 lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? 'Hide Menu' : 'Show Menu'}
              </Button>
            )}
            <Button 
              variant={!isEditMode ? "secondary" : "ghost"} 
              size="sm" 
              className="rounded-md h-8 text-xs px-4"
              onClick={() => {
                setIsEditMode(false);
                designer.setSelectedTableId(null);
              }}
            >
              Preview Mode
            </Button>
            <Button 
              variant={isEditMode ? "default" : "ghost"} 
              size="sm" 
              className="rounded-md h-8 text-xs px-4"
              onClick={() => setIsEditMode(true)}
            >
              Edit Mode
            </Button>
          </div>
          <DesignerCanvas 
            designer={designer} 
            isEditMode={isEditMode} 
            onTableSelect={(id) => designer.setSelectedTableId(id)}
            onTableDeselect={() => designer.setSelectedTableId(null)}
            activeDiningAreaId={diningArea?._id}
          />
        </div>

        {/* Right Properties Panel */}
        {designer.selectedTableId && isEditMode && (
          <div 
            className="absolute lg:relative right-0 z-40 h-full shrink-0 bg-card flex flex-col transition-all duration-300"
            style={{ 
              width: isRightCollapsed ? 0 : rightWidth,
              borderLeftWidth: isRightCollapsed ? 0 : '1px',
              borderColor: 'hsl(var(--border) / 0.5)'
            }}
          >
            {/* Collapse Button */}
            <Button
              variant="secondary"
              size="icon"
              className={`absolute top-4 -left-3 h-6 w-6 rounded-full border border-border shadow-md z-[60] bg-background hover:bg-muted ${isRightCollapsed ? '-left-10' : ''}`}
              onClick={() => setIsRightCollapsed(!isRightCollapsed)}
            >
              {isRightCollapsed ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>

            {/* Resize Handle */}
            {!isRightCollapsed && (
              <div 
                className="absolute top-0 -left-1 w-2 h-full cursor-col-resize z-[55] hover:bg-primary/20 transition-colors"
                onMouseDown={(e) => startResize(e, 'right')}
              />
            )}

            <div className={`flex-1 h-full overflow-hidden ${isRightCollapsed ? 'hidden' : 'block animate-in slide-in-from-right-8'}`}>
              <DesignerProperties 
                designer={designer} 
                onDelete={handleDeleteTable}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
