import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { FLOOR_OPTIONS, SECTION_OPTIONS, DINING_AREA_PRESETS } from "@/lib/tableConstants";

export function useFloorDesigner(initialTables = []) {
  const [tables, setTables] = useState([]);
  const [dirtyTables, setDirtyTables] = useState(new Set());
  
  const [activeFloor, setActiveFloor] = useState("ground");
  
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [externalDragItem, setExternalDragItem] = useState(null);

  // Sync with external tables
  useEffect(() => {
    // Only sync if we don't have unsaved changes
    if (dirtyTables.size === 0) {
      setTables(initialTables);
    }
  }, [initialTables]);

  // Derived unique floors based on actual data
  const availableFloors = useMemo(() => {
    const floors = new Set(tables.map(t => t.floor).filter(Boolean));
    floors.add("ground"); // default
    return Array.from(floors).map(val => {
      const option = FLOOR_OPTIONS.find(o => o.value === val);
      return { value: val, label: option?.label || val };
    });
  }, [tables]);

  // Make sure active floor is valid on load
  useEffect(() => {
    if (availableFloors.length > 0 && !availableFloors.find(f => f.value === activeFloor)) {
      setActiveFloor(availableFloors[0].value);
    }
  }, [availableFloors, activeFloor]);

  const activeTables = useMemo(() => {
    return tables.filter(t => t.floor === activeFloor);
  }, [tables, activeFloor]);

  const updateTablePosition = useCallback((tableId, { x, y, rotation }) => {
    setTables(prev => prev.map(t => {
      if (t._id === tableId) {
        return { 
          ...t, 
          position: { 
            ...t.position, 
            x: x !== undefined ? x : t.position?.x, 
            y: y !== undefined ? y : t.position?.y,
            rotation: rotation !== undefined ? rotation : t.position?.rotation
          } 
        };
      }
      return t;
    }));
    
    setDirtyTables(prev => {
      const next = new Set(prev);
      next.add(tableId);
      return next;
    });
  }, []);

  const updateTableProperties = useCallback((tableId, properties) => {
    setTables(prev => prev.map(t => {
      if (t._id === tableId) {
        return { ...t, ...properties };
      }
      return t;
    }));
    
    setDirtyTables(prev => {
      const next = new Set(prev);
      next.add(tableId);
      return next;
    });
  }, []);

  const addUnsavedTable = useCallback((tableData) => {
    const newId = `unsaved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTable = {
      ...tableData,
      _id: newId,
      floor: tableData.floor || activeFloor,
      section: tableData.section || "main_hall",
      position: tableData.position || { x: 50, y: 50, rotation: 0 },
      isNew: true
    };
    
    setTables(prev => [...prev, newTable]);
    setDirtyTables(prev => new Set(prev).add(newId));
    
    return newId;
  }, [activeFloor]);

  const addPlacedTable = useCallback((tableData) => {
    const newTable = {
      ...tableData,
      // Default to canvas active floor if not specified, though usually we inherit from diningArea
      floor: tableData.floor || activeFloor,
      position: tableData.position || { x: 50, y: 50, rotation: 0 },
      isNew: false // Important: it already exists in the backend
    };
    
    setTables(prev => [...prev, newTable]);
    setDirtyTables(prev => new Set(prev).add(tableData._id)); // Mark as dirty so position gets saved
    
    return tableData._id;
  }, [activeFloor]);

  const spawnPresetElements = useCallback((diningAreaId, presetName) => {
    const presetData = DINING_AREA_PRESETS.find(p => p.value === presetName);
    if (!presetData || !presetData.elements) return;
    
    setTables(current => {
      let newTables = [...current];
      let newDirty = new Set(dirtyTables);
      
      const parent = newTables.find(t => t._id === diningAreaId);
      const pw = parent?.metadata?.width || 400;
      const ph = parent?.metadata?.height || 300;

      presetData.elements.forEach(element => {
        const edges = element.pos.split(',').map(e => e.trim());
        
        const edgeCounts = {};
        for (let i = 0; i < element.count; i++) {
          const edge = edges[i % edges.length];
          edgeCounts[edge] = (edgeCounts[edge] || 0) + 1;
        }

        let idIndex = 0;
        Object.entries(edgeCounts).forEach(([edge, count]) => {
          const edgeLength = (edge === 'top' || edge === 'bottom') ? pw : ph;
          const spacing = edgeLength / (count + 1);
          
          for (let i = 0; i < count; i++) {
            const newId = `unsaved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${idIndex++}`;
            
            newTables.push({
              _id: newId,
              tableCode: element.type.charAt(0).toUpperCase() + element.type.slice(1),
              capacity: 0,
              type: element.type,
              floor: activeFloor,
              section: "main_hall",
              position: { x: 0, y: 0, rotation: 0 }, 
              isActive: false,
              status: 'inactive',
              metadata: {
                isLayoutElement: true,
                isStructuralElement: true,
                diningAreaId,
                elementType: element.type,
                shape: 'rectangle',
                width: element.type === 'entrance' || element.type === 'door' ? 60 : 80,
                height: 10,
                edge,
                offset: spacing * (i + 1),
                angleOffset: 0
              },
              isNew: true
            });
            newDirty.add(newId);
          }
        });
      });
      
      setDirtyTables(newDirty);
      return newTables;
    });
  }, [activeFloor, dirtyTables]);

  const removeTableLocally = useCallback((tableId) => {
    let toDeleteIds = [];
    
    setTables(prev => {
      const toDelete = new Set([tableId]);
      
      // Cascading Deletion
      let added;
      do {
        added = false;
        prev.forEach(t => {
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
      
      toDeleteIds = Array.from(toDelete);
      return prev.filter(t => !toDelete.has(t._id));
    });

    setDirtyTables(prev => {
      const next = new Set(prev);
      toDeleteIds.forEach(id => {
        // If the table was new, deleting it means it never existed on the server, so we can remove it from dirty
        // If it was an existing table, we actually need to mark it as deleted or let the diff handle it.
        // Currently, `removeTableLocally` deletes it from dirtyTables. We'll preserve this logic for all deleted children.
        next.delete(id);
      });
      return next;
    });

    if (selectedTableId === tableId) {
      setSelectedTableId(null);
    }
  }, [selectedTableId]);

  const clearDirtyState = useCallback(() => {
    setDirtyTables(new Set());
  }, []);

  const getOriginalTableData = useCallback((tableId) => {
    return initialTables.find(t => t._id === tableId);
  }, [initialTables]);

  const getTableDimensions = (table) => {
    const isLayoutElement = table.metadata?.isLayoutElement === true;
    const width = isLayoutElement ? (table.metadata?.width || 150) : (table.capacity <= 2 ? 60 : table.capacity <= 4 ? 80 : 100);
    const height = isLayoutElement ? (table.metadata?.height || 20) : (table.capacity <= 2 ? 60 : table.capacity <= 4 ? 60 : 70);
    return { width, height };
  };

  const autoArrangeZone = useCallback((zoneId) => {
    setTables(prev => {
      const zone = prev.find(t => t._id === zoneId);
      if (!zone || !zone.metadata?.isArrangementZone) return prev;

      const padding = zone.metadata.arrangementPadding || 20;
      const spacing = zone.metadata.arrangementSpacing || 20;
      const arrType = zone.metadata.arrangementType || 'grid';
      
      const zoneW = zone.metadata?.width || 400;

      const children = prev.filter(t => t.metadata?.zoneId === zoneId);
      if (children.length === 0) return prev;

      // Sort children strictly by code or ID so arrangement is stable
      const sortedChildren = [...children].sort((a, b) => (a.tableCode || '').localeCompare(b.tableCode || ''));

      // STRICT LOCAL COORDINATE ARCHITECTURE
      // Tables calculate their position purely relative to the Zone's top-left corner (0,0)
      let currentX = padding;
      let currentY = padding;
      let maxRowHeight = 0;

      const newPositions = {};

      sortedChildren.forEach(child => {
        const { width, height } = getTableDimensions(child);
        
        if (arrType === 'grid') {
          // Wrap to next row if it overflows the Zone's width
          if (currentX + width + padding > zoneW && currentX > padding) {
            currentX = padding;
            currentY += maxRowHeight + spacing;
            maxRowHeight = 0;
          }
          newPositions[child._id] = { x: currentX, y: currentY };
          currentX += width + spacing;
          maxRowHeight = Math.max(maxRowHeight, height);
        } else if (arrType === 'rows') {
          // 1 column basically
          newPositions[child._id] = { x: currentX, y: currentY };
          currentY += height + spacing;
        } else if (arrType === 'columns') {
          // 1 row basically
          newPositions[child._id] = { x: currentX, y: currentY };
          currentX += width + spacing;
        }
      });

      const nextTables = prev.map(t => {
        if (newPositions[t._id]) {
          return { ...t, position: { ...t.position, ...newPositions[t._id] } };
        }
        return t;
      });

      return nextTables;
    });

    setDirtyTables(prev => {
      const next = new Set(prev);
      next.add(zoneId);
      // We assume the children are dirty too, but saving the layout will save all tables.
      // Let's add children to dirty just in case.
      setTables(current => {
        current.filter(t => t.metadata?.zoneId === zoneId).forEach(c => next.add(c._id));
        return current; // no-op state read
      });
      return next;
    });
  }, []);

    const bringToCanvas = useCallback((tableIds) => {
      let targetX = 300;
      let targetY = 300;
      
      if (typeof document !== 'undefined') {
         const el = document.querySelector('.origin-top-left');
         if (el) {
             const transform = el.style.transform;
             const matchTranslate = transform.match(/translate\(([^p]+)px,\s*([^p]+)px\)/);
             const matchScale = transform.match(/scale\(([^)]+)\)/);
             if (matchTranslate && matchScale) {
                 const px = parseFloat(matchTranslate[1]);
                 const py = parseFloat(matchTranslate[2]);
                 const s = parseFloat(matchScale[1]);
                 
                 // Canvas container offset in screen (rough estimate if sidebar is open, let's assume sidebar width is 320px)
                 const containerRect = el.parentElement.getBoundingClientRect();
                 
                 targetX = (-px + containerRect.width / 2) / s;
                 targetY = (-py + containerRect.height / 2) / s;
             }
         }
      }

      setTables(prev => {
        let currentX = Math.max(0, targetX - 40); // Offset by half of standard table width
        let currentY = Math.max(0, targetY - 40);
        
        return prev.map(t => {
          if (tableIds.includes(t._id)) {
            const tableWidth = t.metadata?.width || 80;
            const res = {
              ...t,
              position: {
                ...t.position,
                x: currentX,
                y: currentY
              },
              metadata: {
                ...t.metadata,
                zoneId: null,
                sectionId: null,
                diningAreaId: null,
                edge: null,
                offset: null
              }
            };
            
            // Preserve spacing for multiple tables
            currentX += tableWidth + 20; 
            return res;
          }
          return t;
        });
      });

      setDirtyTables(prev => {
        const next = new Set(prev);
        tableIds.forEach(id => next.add(id));
        return next;
      });
      
      // Auto-select the first moved table if none selected or if we want to ensure focus
      if (tableIds.length > 0) {
         setSelectedTableId(tableIds[0]);
      }
    }, [setSelectedTableId]);

    // Computed state: what tables are placed?
    const placedTableIds = useMemo(() => {
      const ids = new Set();
      tables.forEach(t => {
        if (!t.metadata?.isLayoutElement && t._id) {
          ids.add(t._id);
        }
      });
      return ids;
    }, [tables]);

    return {
      tables,
      availableFloors,
      activeFloor,
      setActiveFloor,
      activeTables,
      updateTablePosition,
      updateTableProperties,
      addUnsavedTable,
      spawnPresetElements,
      removeTableLocally,
      selectedTableId,
      setSelectedTableId,
      externalDragItem,
      setExternalDragItem,
      hasUnsavedChanges: dirtyTables.size > 0,
      dirtyTables: Array.from(dirtyTables),
      placedTableIds,
      clearDirtyState,
      getOriginalTableData,
      autoArrangeZone,
      bringToCanvas
    };
}
