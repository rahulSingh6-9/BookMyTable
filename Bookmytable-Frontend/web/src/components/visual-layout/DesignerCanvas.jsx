import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { TableItem } from "./TableItem";
import { DesignerMinimap } from "./DesignerMinimap";
import { Maximize, ZoomIn, ZoomOut, Expand, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { resolveTablePrice } from "@/lib/priceUtils";
import { useBranch } from "@/context/BranchContext";
import { usePricingConfig } from "@/hooks/usePricing";

export function DesignerCanvas({ designer, isEditMode, onTableSelect, onTableDeselect, activeDiningAreaId }) {
  const { activeBranchId } = useBranch();
  const { data: pricingConfigs = [] } = usePricingConfig(activeBranchId);
  const getParentSafeBounds = (table, tablesList) => {
    const parentId = table.metadata?.zoneId || table.metadata?.sectionId || table.metadata?.diningAreaId;
    if (!parentId) return null;
    const parent = tablesList.find(t => t._id === parentId);
    if (!parent) return null;

    const pW = parent.metadata?.width || (parent.metadata?.isDiningArea ? 400 : parent.metadata?.isSection ? 350 : 100);
    const pH = parent.metadata?.height || (parent.metadata?.isDiningArea ? 300 : parent.metadata?.isSection ? 250 : 100);
    
    // STRICT FIXED PADDING
    // Dining Areas and Zones share a professional standard safe border.
    const SAFE_BORDER = parent.metadata?.isDiningArea ? 16 : 12;

    return {
      minX: SAFE_BORDER,
      minY: SAFE_BORDER,
      maxX: pW - SAFE_BORDER,
      maxY: pH - SAFE_BORDER,
      parent
    };
  };

  const getTableDimensions = (table) => {
    if (!table) return { width: 100, height: 100 };
    const isLayoutElement = table.metadata?.isLayoutElement === true;
    const isDiningArea = table.metadata?.isDiningArea === true;
    const width = isLayoutElement ? (table.metadata?.width || (isDiningArea ? 400 : 150)) : (table.capacity <= 2 ? 60 : table.capacity <= 4 ? 80 : 100);
    const height = isLayoutElement ? (table.metadata?.height || (isDiningArea ? 300 : 20)) : (table.capacity <= 2 ? 60 : table.capacity <= 4 ? 60 : 70);
    return { width, height };
  };

  const clampToBounds = (x, y, w, h, bounds) => {
    if (!bounds) return { x, y };
    return {
      x: Math.max(bounds.minX, Math.min(x, bounds.maxX - w)),
      y: Math.max(bounds.minY, Math.min(y, bounds.maxY - h))
    };
  };

  const checkSectionCollision = (currentId, x, y, w, h, parentId, tablesList) => {
    return tablesList.some(t => {
      if (t._id === currentId) return false;
      if (!t.metadata?.isSection) return false;
      if (t.metadata?.diningAreaId !== parentId) return false;
      
      const tW = t.metadata?.width || 350;
      const tH = t.metadata?.height || 250;
      const tX = t.position?.x || 0;
      const tY = t.position?.y || 0;

      const overlapX = Math.max(0, Math.min(x + w, tX + tW) - Math.max(x, tX));
      const overlapY = Math.max(0, Math.min(y + h, tY + tH) - Math.max(y, tY));

      // Allow 0px overlap or floating precision (up to 2px tolerance)
      // They must penetrate by > 2px on BOTH axes to be a true collision
      return overlapX > 2 && overlapY > 2;
    });
  };

  const SECTION_GAP = 0;

  const findFreeSectionSpace = (startX, startY, w, h, parentId, tablesList) => {
    const parentArea = tablesList.find(t => t._id === parentId);
    if (!parentArea) return { x: startX, y: startY };
    const parentW = parentArea.metadata?.width || 400;
    const parentH = parentArea.metadata?.height || 300;
    
    const siblings = tablesList.filter(t => t.metadata?.isSection && t.metadata?.diningAreaId === parentId);
    if (siblings.length === 0) return { x: startX, y: startY };

    const checkOverlap = (rx, ry) => {
      return siblings.find(t => {
        const tx = t.position?.x || 0;
        const ty = t.position?.y || 0;
        const tw = t.metadata?.width || 350;
        const th = t.metadata?.height || 250;
        return rx < tx + tw + SECTION_GAP &&
               rx + w + SECTION_GAP > tx &&
               ry < ty + th + SECTION_GAP &&
               ry + h + SECTION_GAP > ty;
      });
    };

    let collision = checkOverlap(startX, startY);
    if (!collision) return { x: startX, y: startY };

    let candidates = [{x: startX, y: startY}];
    siblings.forEach(s => {
       const sx = s.position?.x || 0;
       const sy = s.position?.y || 0;
       const sw = s.metadata?.width || 350;
       const sh = s.metadata?.height || 250;
       
       candidates.push({ x: sx + sw + SECTION_GAP, y: sy }); // Right
       candidates.push({ x: sx, y: sy + sh + SECTION_GAP }); // Bottom
       candidates.push({ x: sx - w - SECTION_GAP, y: sy }); // Left
       candidates.push({ x: sx, y: sy - h - SECTION_GAP }); // Top
    });

    let validCandidates = candidates.filter(c => {
       if (c.x < 0 || c.y < 0) return false;
       if (c.x + w > parentW || c.y + h > parentH) return false;
       return !checkOverlap(c.x, c.y);
    });

    if (validCandidates.length > 0) {
       validCandidates.sort((a, b) => {
          return (Math.pow(a.x - startX, 2) + Math.pow(a.y - startY, 2)) - 
                 (Math.pow(b.x - startX, 2) + Math.pow(b.y - startY, 2));
       });
       return validCandidates[0];
    }
    return { x: startX, y: startY };
  };

  const calculateEdgeSnapping = (draggedId, currentX, currentY, width, height, parentId, tablesList, threshold = 25) => {
     let newX = currentX;
     let newY = currentY;
     let snapResult = null;

     const siblings = tablesList.filter(t => 
        t._id !== draggedId && 
        (t.metadata?.sectionId === parentId || t.metadata?.diningAreaId === parentId) && 
        (t.metadata?.isSection || t.metadata?.isStructuralElement)
     );

     let minDx = Infinity;
     let minDy = Infinity;

     const dLeft = currentX;
     const dRight = currentX + width;
     const dTop = currentY;
     const dBottom = currentY + height;

     siblings.forEach(sib => {
        const sW = sib.metadata?.width || 80;
        const sH = sib.metadata?.height || 60;
        const sX = sib.position?.x || 0;
        const sY = sib.position?.y || 0;
        
        const sLeft = sX;
        const sRight = sX + sW;
        const sTop = sY;
        const sBottom = sY + sH;

        const horizOverlap = (dRight > sLeft) && (dLeft < sRight);
        const vertOverlap = (dBottom > sTop) && (dTop < sBottom);

        if (vertOverlap) {
            if (Math.abs(dRight - sLeft) < threshold && Math.abs(dRight - sLeft) < minDx) {
                minDx = Math.abs(dRight - sLeft);
                newX = sLeft - width;
                snapResult = { targetId: sib._id, type: 'right-to-left', edgeRect: { x: sLeft, y: Math.max(dTop, sTop), w: 0, h: Math.min(dBottom, sBottom) - Math.max(dTop, sTop) } };
            }
            if (Math.abs(dLeft - sRight) < threshold && Math.abs(dLeft - sRight) < minDx) {
                minDx = Math.abs(dLeft - sRight);
                newX = sRight;
                snapResult = { targetId: sib._id, type: 'left-to-right', edgeRect: { x: sRight, y: Math.max(dTop, sTop), w: 0, h: Math.min(dBottom, sBottom) - Math.max(dTop, sTop) } };
            }
        }

        if (horizOverlap) {
            if (Math.abs(dBottom - sTop) < threshold && Math.abs(dBottom - sTop) < minDy) {
                minDy = Math.abs(dBottom - sTop);
                newY = sTop - height;
                snapResult = { targetId: sib._id, type: 'bottom-to-top', edgeRect: { x: Math.max(dLeft, sLeft), y: sTop, w: Math.min(dRight, sRight) - Math.max(dLeft, sLeft), h: 0 } };
            }
            if (Math.abs(dTop - sBottom) < threshold && Math.abs(dTop - sBottom) < minDy) {
                minDy = Math.abs(dTop - sBottom);
                newY = sBottom;
                snapResult = { targetId: sib._id, type: 'top-to-bottom', edgeRect: { x: Math.max(dLeft, sLeft), y: sBottom, w: Math.min(dRight, sRight) - Math.max(dLeft, sLeft), h: 0 } };
            }
        }
     });

     return { x: newX, y: newY, snapResult };
  };

  const calculateSectionPush = (resizingTableId, newX, newY, newW, newH, direction, tablesList) => {
     let updates = {};
     let isValid = true;
     
     const sourceTable = tablesList.find(x => x._id === resizingTableId);
     const parentBounds = getParentSafeBounds(sourceTable, tablesList);
     const siblings = tablesList.filter(t => t.metadata?.isSection && t.metadata?.diningAreaId === sourceTable.metadata?.diningAreaId);

     const getRect = (id) => {
        if (id === resizingTableId) return { x: newX, y: newY, w: newW, h: newH };
        if (updates[id]) return updates[id];
        const t = tablesList.find(x => x._id === id);
        return { 
          x: t.position?.x||0, 
          y: t.position?.y||0, 
          w: t.metadata?.width||350, 
          h: t.metadata?.height||250 
        };
     };

     const push = (id, pushDX, pushDY) => {
        const rect = getRect(id);
        const nextX = rect.x + pushDX;
        const nextY = rect.y + pushDY;
        
        if (nextX < parentBounds.minX || nextX + rect.w > parentBounds.maxX ||
            nextY < parentBounds.minY || nextY + rect.h > parentBounds.maxY) {
            isValid = false;
            return;
        }

        updates[id] = { x: nextX, y: nextY, w: rect.w, h: rect.h };

        siblings.forEach(s => {
           if (s._id === id || s._id === resizingTableId) return;
           const sRect = getRect(s._id);
           const isOverlap = nextX < sRect.x + sRect.w + SECTION_GAP &&
                             nextX + rect.w + SECTION_GAP > sRect.x &&
                             nextY < sRect.y + sRect.h + SECTION_GAP &&
                             nextY + rect.h + SECTION_GAP > sRect.y;
           
           if (isOverlap) {
              let reqDx = 0, reqDy = 0;
              if (pushDX > 0) reqDx = (nextX + rect.w + SECTION_GAP) - sRect.x;
              if (pushDX < 0) reqDx = (nextX - SECTION_GAP) - (sRect.x + sRect.w);
              if (pushDY > 0) reqDy = (nextY + rect.h + SECTION_GAP) - sRect.y;
              if (pushDY < 0) reqDy = (nextY - SECTION_GAP) - (sRect.y + sRect.h);
              
              if (pushDX !== 0 && reqDx !== 0) push(s._id, reqDx, 0);
              if (pushDY !== 0 && reqDy !== 0) push(s._id, 0, reqDy);
           }
        });
     };

     const sourceRect = getRect(resizingTableId);
     siblings.forEach(s => {
         if (s._id === resizingTableId) return;
         const sRect = getRect(s._id);
         const isOverlap = sourceRect.x < sRect.x + sRect.w + SECTION_GAP &&
                           sourceRect.x + sourceRect.w + SECTION_GAP > sRect.x &&
                           sourceRect.y < sRect.y + sRect.h + SECTION_GAP &&
                           sourceRect.y + sourceRect.h + SECTION_GAP > sRect.y;
         
         if (isOverlap) {
              let reqDx = 0, reqDy = 0;
              if (direction.includes('right') && sRect.x >= sourceRect.x) reqDx = (sourceRect.x + sourceRect.w + SECTION_GAP) - sRect.x;
              if (direction.includes('left') && sRect.x <= sourceRect.x) reqDx = (sourceRect.x - SECTION_GAP) - (sRect.x + sRect.w);
              if (direction.includes('bottom') && sRect.y >= sourceRect.y) reqDy = (sourceRect.y + sourceRect.h + SECTION_GAP) - sRect.y;
              if (direction.includes('top') && sRect.y <= sourceRect.y) reqDy = (sourceRect.y - SECTION_GAP) - (sRect.y + sRect.h);
              
              if (reqDx !== 0 || reqDy !== 0) {
                 push(s._id, reqDx, reqDy);
              } else {
                 isValid = false; // Block if overlapping on a non-pushed axis
              }
         }
     });

     return { isValid, updates };
  };

  const getGlobalPosition = useCallback((table, tablesList) => {
    let x = table.position?.x || 0;
    let y = table.position?.y || 0;
    let parentId = table.metadata?.zoneId || table.metadata?.sectionId || table.metadata?.diningAreaId;
    
    while (parentId) {
      const parent = tablesList.find(t => t._id === parentId);
      if (parent) {
        x += parent.position?.x || 0;
        y += parent.position?.y || 0;
        parentId = parent.metadata?.zoneId || parent.metadata?.sectionId || parent.metadata?.diningAreaId;
      } else {
        break;
      }
    }
    return { x, y };
  }, []);

  const { activeTables, updateTablePosition, selectedTableId, setSelectedTableId } = designer;
  const containerRef = useRef(null);
  
  // Advanced Camera state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const [isPanning, setIsPanning] = useState(false);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [potentialDragId, setPotentialDragId] = useState(null);
  const [draggingTableId, setDraggingTableId] = useState(null);
  const [dragHoverTargetId, setDragHoverTargetId] = useState(null);
  
  const [resizingTableId, setResizingTableId] = useState(null);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [dragDropPreview, setDragDropPreview] = useState(null);
  const [snapGuides, setSnapGuides] = useState(null);

  const { 
    updateTableProperties,
    externalDragItem,
    setExternalDragItem,
    addUnsavedTable,
    spawnPresetElements
  } = designer;
  
  const [activePointerId, setActivePointerId] = useState(null);
  
  const panStartRef = useRef({ x: 0, y: 0, startPanX: 0, startPanY: 0 });
  const dragStartRef = useRef({ x: 0, y: 0, tableStartX: 0, tableStartY: 0 });
  const currentDragPosRef = useRef(null);
  const resizeStartRef = useRef({ x: 0, y: 0, startW: 0, startH: 0, startX: 0, startY: 0 });
  const enforceZoneBounds = useCallback((table, tablesList) => {
    const parentId = table.metadata?.zoneId || table.metadata?.sectionId || table.metadata?.diningAreaId;
    if (!parentId) return table;
    const parent = tablesList.find(t => t._id === parentId);
    if (!parent) return table;

    const bounds = getParentSafeBounds(table, tablesList);
    if (!bounds) return table;

    const { width, height } = getTableDimensions(table);
    
    // Hard clamp position
    const curX = table.position?.x || 0;
    const curY = table.position?.y || 0;
    
    const maxAllowedX = Math.max(bounds.minX, bounds.maxX - width);
    const maxAllowedY = Math.max(bounds.minY, bounds.maxY - height);

    const clampedX = Math.max(bounds.minX, Math.min(curX, maxAllowedX));
    const clampedY = Math.max(bounds.minY, Math.min(curY, maxAllowedY));
    
    // Hard clamp width/height
    const clampedW = Math.min(width, Math.max(0, bounds.maxX - bounds.minX));
    const clampedH = Math.min(height, Math.max(0, bounds.maxY - bounds.minY));

    if (clampedX !== curX || 
        clampedY !== curY || 
        (table.metadata?.isLayoutElement && table.metadata?.width && clampedW !== table.metadata.width) || 
        (table.metadata?.isLayoutElement && table.metadata?.height && clampedH !== table.metadata.height)) {
        
        return {
          ...table,
          position: { ...table.position, x: clampedX, y: clampedY },
          metadata: { 
            ...table.metadata, 
            width: table.metadata?.width ? clampedW : undefined, 
            height: table.metadata?.height ? clampedH : undefined 
          }
        };
    }
    
    return table;
  }, []);

  // ZERO-FRAME VISUAL SAFETY: Never render out of bounds
  const validatedTables = React.useMemo(() => {
    return activeTables.map(t => {
      // During active drag/resize, let the user's cursor lead visually without pre-enforcing,
      // EXCEPT the constraints are already applied to the cursor state!
      // But if parent shrinks, we DO want to clamp visually immediately.
      return enforceZoneBounds(t, activeTables);
    });
  }, [activeTables, enforceZoneBounds]);

  // AUTO-CORRECTION WATCHER: Permanently rewrite invalid data
  useEffect(() => {
    let corrections = [];
    activeTables.forEach(t => {
      // Don't fight the user's active drag/resize for THIS specific table.
      if (t._id === draggingTableId || t._id === resizingTableId) return;

      const enforced = enforceZoneBounds(t, activeTables);
      if (enforced !== t) {
         corrections.push({
           id: t._id,
           updates: {
             position: enforced.position,
             metadata: enforced.metadata
           }
         });
      }
    });

    if (corrections.length > 0) {
      corrections.forEach(c => {
        designer.updateTableProperties(c.id, c.updates);
      });
    }
  }, [activeTables, draggingTableId, resizingTableId, designer, enforceZoneBounds]);

  // Spacebar listener for Figma-style panning
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !isSpaceDown && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        setIsSpaceDown(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpaceDown(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpaceDown]);

  // Wheel listener for Zoom & Trackpad Pan
  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault(); // Stop page scrolling
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom (Pinch or Ctrl+Wheel)
        const zoomSensitivity = 0.005;
        const delta = -e.deltaY * zoomSensitivity;
        const newScale = Math.min(Math.max(0.2, scale * (1 + delta)), 3);
        
        // Cursor-centered zoom math
        const rect = container.getBoundingClientRect();
        const pointerX = e.clientX - rect.left;
        const pointerY = e.clientY - rect.top;
        
        // Target canvas coordinate under pointer
        const targetX = (pointerX - pan.x) / scale;
        const targetY = (pointerY - pan.y) / scale;
        
        // Adjust pan so target coordinate remains under pointer
        setPan({
          x: pointerX - targetX * newScale,
          y: pointerY - targetY * newScale
        });
        setScale(newScale);
      } else {
        // Pan (Trackpad two-finger scroll or regular mouse wheel)
        setPan(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }));
      }
    };

    // passive: false is required to preventDefault on wheel events
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [scale, pan]);

  // Pointer interactions
  const handlePointerDown = (e, tableId = null) => {
    // Prevent multi-touch interference
    if (activePointerId !== null) return;
    
    // Explicitly lock pointer to target to prevent event bleeding
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch(err) {}
    setActivePointerId(e.pointerId);

    // If middle click or spacebar is down, initiate panning
    if (e.button === 1 || isSpaceDown || !tableId) {
      if (!tableId) {
        setSelectedTableId(null);
        if (onTableDeselect) onTableDeselect();
      }
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y
      };
      return;
    }

    // If a table was clicked in edit mode, initiate dragging
    if (isEditMode && tableId) {
      const table = activeTables.find(t => t._id === tableId);
      if (table) {
        setSelectedTableId(tableId);
        if (onTableSelect) onTableSelect(tableId);
        if (!table.metadata?.isLocked) {
          setPotentialDragId(tableId);
          
          // If selecting the active dining area, do not allow dragging it.
          if (tableId === activeDiningAreaId) {
            setDraggingTableId(null);
            return;
          }

          let startX = table.position?.x || 0;
          let startY = table.position?.y || 0;
          
          if (table.metadata?.isStructuralElement && table.metadata.edge) {
            const parent = activeTables.find(t => t._id === table.metadata.diningAreaId);
            if (parent) {
                const pw = parent.metadata?.width || 400;
                const ph = parent.metadata?.height || 300;
                const ew = table.metadata?.width || (table.type === 'entrance' || table.type === 'door' ? 60 : 80);
                const eh = table.metadata?.height || 10;
                const edge = table.metadata.edge;
                let offset = table.metadata.offset || 0;
                
                if (edge === 'top') { startX = offset - ew/2; startY = -eh/2; }
                else if (edge === 'bottom') { startX = offset - ew/2; startY = ph - eh/2; }
                else if (edge === 'left') { startX = -ew/2; startY = offset - eh/2; }
                else if (edge === 'right') { startX = pw - ew/2; startY = offset - eh/2; }
            }
          }

          dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            tableStartX: startX,
            tableStartY: startY,
            isStructuralElement: table.metadata?.isStructuralElement === true,
            parentId: table.metadata?.diningAreaId || null,
            zoneChildren: activeTables.filter(t => t.metadata?.zoneId === tableId).map(c => ({ id: c._id, startX: c.position?.x || 0, startY: c.position?.y || 0 })),
            diningAreaChildren: activeTables.filter(t => t.metadata?.diningAreaId === tableId && t._id !== tableId).map(c => ({
              id: c._id, startX: c.position?.x || 0, startY: c.position?.y || 0,
              zoneChildren: c.metadata?.isArrangementZone ? activeTables.filter(t2 => t2.metadata?.zoneId === c._id).map(c2 => ({
                id: c2._id, startX: c2.position?.x || 0, startY: c2.position?.y || 0
              })) : []
            }))
          };
        }
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!externalDragItem || !isEditMode) return;

    const canvasRect = containerRef.current.getBoundingClientRect();
    const localX = (e.clientX - canvasRect.left) / scale;
    const localY = (e.clientY - canvasRect.top) / scale;

    const { width: tW, height: tH } = getTableDimensions(externalDragItem);

    setDragDropPreview({
      ...externalDragItem,
      _id: "drag_preview",
      position: { x: localX, y: localY, rotation: 0 }
    });

    const cx = localX + tW / 2;
    const cy = localY + tH / 2;

    if (!externalDragItem.metadata?.isLayoutElement) {
      // Table must go into a Zone OR a Section
      const validContainers = activeTables.filter(c => {
        if (!c.metadata?.isArrangementZone && !c.metadata?.isSection) return false;
        const gPos = getGlobalPosition(c, activeTables);
        return cx >= gPos.x && cx <= gPos.x + (c.metadata?.width||100) && cy >= gPos.y && cy <= gPos.y + (c.metadata?.height||100);
      });
      // Prioritize Arrangement Zone (-1) over Section (1)
      validContainers.sort((a, b) => (a.metadata?.isArrangementZone ? -1 : 1));
      const targetContainer = validContainers[0];
      setDragHoverTargetId(targetContainer ? targetContainer._id : null);
    } else if (externalDragItem.metadata?.isArrangementZone) {
      // Zone must go into a Section OR Dining Area
      const validContainers = activeTables.filter(c => {
        if (!c.metadata?.isSection && !c.metadata?.isDiningArea) return false;
        const gPos = getGlobalPosition(c, activeTables);
        return cx >= gPos.x && cx <= gPos.x + (c.metadata?.width||400) && cy >= gPos.y && cy <= gPos.y + (c.metadata?.height||300);
      });
      validContainers.sort((a, b) => (a.metadata?.isSection ? -1 : 1));
      const targetContainer = validContainers[0];
      setDragHoverTargetId(targetContainer ? targetContainer._id : null);
    } else if (externalDragItem.metadata?.isSection) {
      // Section must go into a Dining Area
      const targetArea = activeTables.find(a => {
        if (!a.metadata?.isDiningArea) return false;
        const gPos = getGlobalPosition(a, activeTables);
        return cx >= gPos.x && cx <= gPos.x + (a.metadata?.width||400) && cy >= gPos.y && cy <= gPos.y + (a.metadata?.height||300);
      });
      setDragHoverTargetId(targetArea ? targetArea._id : null);
    } else if (externalDragItem.metadata?.isDiningArea) {
      // Dining Area is top level, doesn't go into anything
      setDragHoverTargetId(null);
    } else if (externalDragItem.metadata?.isStructuralElement) {
      const targetArea = activeTables.find(a => {
        if (!a.metadata?.isDiningArea) return false;
        const gPos = getGlobalPosition(a, activeTables);
        return cx >= gPos.x && cx <= gPos.x + (a.metadata?.width||400) && cy >= gPos.y && cy <= gPos.y + (a.metadata?.height||300);
      });
      setDragHoverTargetId(targetArea ? targetArea._id : null);
    }
  };

  const handleExternalDrop = (e) => {
    e.preventDefault();
    if (!externalDragItem || !isEditMode) return;

    const canvasRect = containerRef.current.getBoundingClientRect();
    let localX = (e.clientX - canvasRect.left) / scale;
    let localY = (e.clientY - canvasRect.top) / scale;

    const { width: tW, height: tH } = getTableDimensions(externalDragItem);
    const cx = localX + tW / 2;
    const cy = localY + tH / 2;

    let parentId = null;

    if (!externalDragItem.metadata?.isLayoutElement) {
      console.log(`\n--- DROP EVENT (EXTERNAL) ---`);
      console.log(`Cursor Global X,Y: ${cx}, ${cy}`);
      
      const validContainers = activeTables.filter(c => {
        if (!c.metadata?.isArrangementZone && !c.metadata?.isSection && !c.metadata?.isDiningArea) return false;
        const gPos = getGlobalPosition(c, activeTables);
        const cW = c.metadata?.width || (c.metadata?.isDiningArea ? 400 : c.metadata?.isSection ? 350 : c.metadata?.isArrangementZone ? 300 : 100);
        const cH = c.metadata?.height || (c.metadata?.isDiningArea ? 300 : c.metadata?.isSection ? 250 : c.metadata?.isArrangementZone ? 200 : 100);
        return cx >= gPos.x && cx <= gPos.x + cW && cy >= gPos.y && cy <= gPos.y + cH;
      });

      const detectedDiningArea = validContainers.find(c => c.metadata?.isDiningArea);
      const detectedSection = validContainers.find(c => c.metadata?.isSection);
      const detectedZone = validContainers.find(c => c.metadata?.isArrangementZone);

      console.log(`Detected Dining Area: ${detectedDiningArea ? detectedDiningArea.metadata?.preset || detectedDiningArea._id : 'null'}`);
      console.log(`Detected Section: ${detectedSection ? detectedSection.metadata?.preset || detectedSection._id : 'null'}`);
      console.log(`Detected Arrangement Zone: ${detectedZone ? detectedZone._id : 'null'}`);

      validContainers.sort((a, b) => {
          const getZ = (t) => t.metadata?.isArrangementZone ? 1 : t.metadata?.isSection ? 2 : 3;
          return getZ(a) - getZ(b);
      });
      const targetContainer = validContainers[0];

      if (targetContainer) {
          console.log(`Parent Type: ${targetContainer.metadata?.isArrangementZone ? 'arrangement_zone' : targetContainer.metadata?.isSection ? 'section' : 'dining_area'}`);
          console.log(`Parent Name: ${targetContainer.metadata?.preset || targetContainer._id}`);
          console.log(`Parent Id: ${targetContainer._id}`);
          console.log(`------------------\n`);
      }

      if (targetContainer) {
        parentId = targetContainer._id;
        const gPos = getGlobalPosition(targetContainer, activeTables);
        localX -= gPos.x;
        localY -= gPos.y;
      } else {
        toast.error("Tables must be placed inside a Section or an Arrangement Zone");
        setDragDropPreview(null);
        setExternalDragItem(null);
        setDragHoverTargetId(null);
        return;
      }
    } else if (externalDragItem.metadata?.isArrangementZone) {
      const validContainers = activeTables.filter(c => {
        if (!c.metadata?.isSection && !c.metadata?.isDiningArea) return false;
        const gPos = getGlobalPosition(c, activeTables);
        return cx >= gPos.x && cx <= gPos.x + (c.metadata?.width||400) && cy >= gPos.y && cy <= gPos.y + (c.metadata?.height||300);
      });
      validContainers.sort((a, b) => (a.metadata?.isSection ? -1 : 1));
      const targetContainer = validContainers[0];

      if (targetContainer) {
        parentId = targetContainer._id;
        const gPos = getGlobalPosition(targetContainer, activeTables);
        localX -= gPos.x;
        localY -= gPos.y;
      } else {
        toast.error("Arrangement Zones must be placed inside a Section or Dining Area");
        setDragDropPreview(null);
        setExternalDragItem(null);
        setDragHoverTargetId(null);
        return;
      }
    } else if (externalDragItem.metadata?.isSection) {
      const targetArea = activeTables.find(a => {
        if (!a.metadata?.isDiningArea) return false;
        const gPos = getGlobalPosition(a, activeTables);
        return cx >= gPos.x && cx <= gPos.x + (a.metadata?.width||400) && cy >= gPos.y && cy <= gPos.y + (a.metadata?.height||300);
      });
      
      if (targetArea) {
        parentId = targetArea._id;
        const gPos = getGlobalPosition(targetArea, activeTables);
        localX -= gPos.x;
        localY -= gPos.y;
      } else {
        toast.error("Sections must be placed inside a Dining Area container");
        setDragDropPreview(null);
        setExternalDragItem(null);
        setDragHoverTargetId(null);
        return;
      }
    } else if (externalDragItem.metadata?.isDiningArea) {
      parentId = null; // Top-level
    } else if (externalDragItem.metadata?.isStructuralElement) {
      const targetArea = activeTables.find(a => {
        if (!a.metadata?.isDiningArea) return false;
        const gPos = getGlobalPosition(a, activeTables);
        return cx >= gPos.x && cx <= gPos.x + (a.metadata?.width||400) && cy >= gPos.y && cy <= gPos.y + (a.metadata?.height||300);
      });

      if (targetArea) {
        parentId = targetArea._id;
        const gPos = getGlobalPosition(targetArea, activeTables);
        localX -= gPos.x;
        localY -= gPos.y;
      } else {
        toast.error("Presets must be placed onto a Dining Area container");
        setDragDropPreview(null);
        setExternalDragItem(null);
        setDragHoverTargetId(null);
        return;
      }
    }

    const targetParent = parentId ? activeTables.find(t => t._id === parentId) : null;

    let finalMetadata = { ...externalDragItem.metadata };

    if (targetParent) {
       if (!externalDragItem.metadata?.isLayoutElement) {
           // We are dropping a Table
           let targetSection = null;
           if (targetParent.metadata?.isArrangementZone) {
               targetSection = activeTables.find(t => t._id === targetParent.metadata.sectionId);
               finalMetadata.zoneId = targetParent._id;
               finalMetadata.sectionId = targetParent.metadata.sectionId;
               finalMetadata.diningAreaId = targetParent.metadata.diningAreaId;
           } else if (targetParent.metadata?.isSection) {
               targetSection = targetParent;
               finalMetadata.zoneId = null;
               finalMetadata.sectionId = targetParent._id;
               finalMetadata.diningAreaId = targetParent.metadata.diningAreaId;
           }

           if (targetSection) {
               const targetSectionType = targetSection.metadata?.value || targetSection.metadata?.preset;
               if (targetSectionType) {
                   // Instead of bouncing, adopt the Section's type. This ensures pricing will be recalculated correctly below.
                   externalDragItem.section = targetSectionType;
               }
           }
       } else if (externalDragItem.metadata?.isArrangementZone) {
           // Dropping a Zone
           if (targetParent.metadata?.isSection) {
               finalMetadata.sectionId = targetParent._id;
               finalMetadata.diningAreaId = targetParent.metadata.diningAreaId;
           } else if (targetParent.metadata?.isDiningArea) {
               finalMetadata.sectionId = null;
               finalMetadata.diningAreaId = targetParent._id;
           }
       } else if (externalDragItem.metadata?.isSection) {
           // Dropping a Section into a Dining Area
           finalMetadata.diningAreaId = targetParent._id;
       } else if (externalDragItem.metadata?.isStructuralElement) {
           // Dropping Structural Element into Dining Area
           if (targetParent.metadata?.isDiningArea) {
               finalMetadata.diningAreaId = targetParent._id;
           }
       }
    }

    if (externalDragItem.metadata?.isStructuralElement && parentId) {
      const parentArea = targetParent;
      if (parentArea) {
        const pW = parentArea.metadata?.width || (parentArea.metadata?.isSection ? 350 : 400);
        const pH = parentArea.metadata?.height || (parentArea.metadata?.isSection ? 250 : 300);
        
        const distTop = Math.abs(localY);
        const distBottom = Math.abs(localY - pH);
        const distLeft = Math.abs(localX);
        const distRight = Math.abs(localX - pW);
        
        const minDist = Math.min(distTop, distBottom, distLeft, distRight);
        
        if (minDist <= 20) {
          let edge = 'top';
          let offset = 0;
          if (minDist === distTop) { edge = 'top'; offset = localX + tW/2; }
          else if (minDist === distBottom) { edge = 'bottom'; offset = localX + tW/2; }
          else if (minDist === distLeft) { edge = 'left'; offset = localY + tH/2; }
          else { edge = 'right'; offset = localY + tH/2; }
          
          const maxOffset = (edge === 'top' || edge === 'bottom') ? pW : pH;
          finalMetadata.edge = edge;
          finalMetadata.offset = Math.max(0, Math.min(offset, maxOffset));
        } else {
          finalMetadata.edge = null;
          finalMetadata.offset = null;
        }
      }
    }

    let dropX = Math.max(0, localX);
    let dropY = Math.max(0, localY);

    if (externalDragItem.metadata?.isSection && parentId) {
       const bestSpace = findFreeSectionSpace(dropX, dropY, tW, tH, parentId, activeTables);
       dropX = bestSpace.x;
       dropY = bestSpace.y;
    }

    // For non-layout-element tables (real tables), resolve and inject price hierarchy
    if (!externalDragItem.metadata?.isLayoutElement) {
      let currentSectionType = externalDragItem.section;
      if (finalMetadata.sectionId) {
        const parentSection = activeTables.find(t => t._id === finalMetadata.sectionId);
        currentSectionType = parentSection?.metadata?.value || parentSection?.metadata?.preset || currentSectionType;
      }
      
      const { price, source } = resolveTablePrice(
        { ...externalDragItem, section: currentSectionType },
        pricingConfigs
      );
      finalMetadata.resolvedPrice = price;
      finalMetadata.priceSource   = source;
    }

    let dropBounds = null;
    if (targetParent) {
       const pW = targetParent.metadata?.width || (targetParent.metadata?.isDiningArea ? 400 : targetParent.metadata?.isSection ? 350 : 100);
       const pH = targetParent.metadata?.height || (targetParent.metadata?.isDiningArea ? 300 : targetParent.metadata?.isSection ? 250 : 100);
       const SAFE_BORDER = targetParent.metadata?.isDiningArea ? 16 : 12;
       dropBounds = { minX: SAFE_BORDER, minY: SAFE_BORDER, maxX: pW - SAFE_BORDER, maxY: pH - SAFE_BORDER };
    }

    const payload = {
      ...externalDragItem,
      position: { ...clampToBounds(dropX, dropY, tW, tH, dropBounds), rotation: 0 },
      metadata: finalMetadata
    };

    let newId;
    if (externalDragItem.isRealTable) {
      newId = designer.addPlacedTable(payload);
    } else {
      newId = designer.addUnsavedTable(payload);
    }
    
    designer.setSelectedTableId(newId);

    if (externalDragItem.metadata?.isDiningArea && externalDragItem.metadata?.preset) {
      designer.spawnPresetElements(newId, externalDragItem.metadata.preset);
    }
    
    setDragDropPreview(null);
    setExternalDragItem(null);
    setDragHoverTargetId(null);
  };

  const handleResizeStart = (e, tableId, direction) => {
    e.stopPropagation();
    if (!isEditMode) return;
    
    // Prevent multi-touch
    if (activePointerId !== null) return;
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch(err) {}
    setActivePointerId(e.pointerId);
    
    const table = activeTables.find(t => t._id === tableId);
    if (!table) return;

    setSelectedTableId(tableId);
    setResizingTableId(tableId);
    setResizeDirection(direction);
    
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startW: table.metadata?.width || (table.metadata?.isLayoutElement ? 150 : 80),
      startH: table.metadata?.height || (table.metadata?.isLayoutElement ? 20 : 60),
      startX: table.position?.x || 0,
      startY: table.position?.y || 0
    };
  };

  const handlePointerMove = (e) => {
    if (activePointerId !== null && e.pointerId !== activePointerId) return; // ignore ghost touches

    if (isPanning) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({
        x: panStartRef.current.startPanX + dx,
        y: panStartRef.current.startPanY + dy
      });
      return;
    }

    if (resizingTableId && resizeDirection) {
      const dx = (e.clientX - resizeStartRef.current.x) / scale;
      const dy = (e.clientY - resizeStartRef.current.y) / scale;
      
      let newW = resizeStartRef.current.startW;
      let newH = resizeStartRef.current.startH;
      let newX = resizeStartRef.current.startX;
      let newY = resizeStartRef.current.startY;
      
      const MIN_SIZE = 10;

      const table = activeTables.find(t => t._id === resizingTableId);
      const bounds = table ? getParentSafeBounds(table, activeTables) : null;

      if (resizeDirection.includes('right')) {
        newW = Math.max(MIN_SIZE, resizeStartRef.current.startW + dx);
        if (bounds && newX + newW > bounds.maxX) newW = bounds.maxX - newX;
      }
      if (resizeDirection.includes('bottom')) {
        newH = Math.max(MIN_SIZE, resizeStartRef.current.startH + dy);
        if (bounds && newY + newH > bounds.maxY) newH = bounds.maxY - newY;
      }
      if (resizeDirection.includes('left')) {
        const proposedW = resizeStartRef.current.startW - dx;
        const proposedX = resizeStartRef.current.startX + dx;
        if (proposedW >= MIN_SIZE) {
          if (bounds && proposedX < bounds.minX) {
            newX = bounds.minX;
            newW = resizeStartRef.current.startX + resizeStartRef.current.startW - bounds.minX;
          } else {
            newW = proposedW;
            newX = proposedX;
          }
        }
      }
      if (resizeDirection.includes('top')) {
        const proposedH = resizeStartRef.current.startH - dy;
        const proposedY = resizeStartRef.current.startY + dy;
        if (proposedH >= MIN_SIZE) {
          if (bounds && proposedY < bounds.minY) {
            newY = bounds.minY;
            newH = resizeStartRef.current.startY + resizeStartRef.current.startH - bounds.minY;
          } else {
            newH = proposedH;
            newY = proposedY;
          }
        }
      }

      if (table && table.metadata?.isSection) {
         const pushResult = calculateSectionPush(resizingTableId, newX, newY, newW, newH, resizeDirection, activeTables);
         if (pushResult.isValid) {
             Object.entries(pushResult.updates).forEach(([id, u]) => {
                 designer.updateTableProperties(id, {
                    position: { ...activeTables.find(t=>t._id===id)?.position, x: u.x, y: u.y }
                 });
             });
             designer.updateTableProperties(resizingTableId, {
                position: { ...table.position, x: newX, y: newY },
                metadata: { ...table.metadata, width: newW, height: newH, isColliding: false }
             });
         } else {
             designer.updateTableProperties(resizingTableId, {
                position: { ...table.position, x: newX, y: newY },
                metadata: { ...table.metadata, width: newW, height: newH, isColliding: true }
             });
         }
         return;
      }

      // We need to update both position and metadata properties
      designer.updateTableProperties(resizingTableId, {
        position: { ...activeTables.find(t=>t._id===resizingTableId)?.position, x: newX, y: newY },
        metadata: { ...activeTables.find(t=>t._id===resizingTableId)?.metadata, width: newW, height: newH }
      });
      return;
    }

    if (potentialDragId && !draggingTableId) {
      const dx = Math.abs(e.clientX - dragStartRef.current.x);
      const dy = Math.abs(e.clientY - dragStartRef.current.y);
      if (dx > 5 || dy > 5) {
        setDraggingTableId(potentialDragId);
        setPotentialDragId(null);
        currentDragPosRef.current = null;
      } else {
        return;
      }
    }

    if (draggingTableId) {
      // Since coordinates are local, a simple drag scale matches the screen scale!
      const table = activeTables.find(t => t._id === draggingTableId);
      const isStructuralElement = dragStartRef.current.isStructuralElement;
      const parentId = dragStartRef.current.parentId;
      
      // Calculate rotation delta if parent is rotated? 
      // Simplified: we assume the user drags within an unrotated canvas or we accept the math approximation for now.
      // Ideally, we'd multiply by the inverse rotation matrix. Let's keep it simple.
      const dx = (e.clientX - dragStartRef.current.x) / scale;
      const dy = (e.clientY - dragStartRef.current.y) / scale;
      
      let newX = dragStartRef.current.tableStartX + dx;
      let newY = dragStartRef.current.tableStartY + dy;
      
      const { width: tW, height: tH } = getTableDimensions(table);

      // Edge Snapping Engine
      let snapResult = null;
      if (parentId && (table.metadata?.isSection || table.metadata?.isStructuralElement)) {
         const snapData = calculateEdgeSnapping(draggingTableId, newX, newY, tW, tH, parentId, activeTables);
         newX = snapData.x;
         newY = snapData.y;
         snapResult = snapData.snapResult;
         
         // Clear attachment if dragged far away
         if (!snapResult && table.metadata?.attachments?.length > 0) {
            updateTableProperties(draggingTableId, { metadata: { ...table.metadata, attachments: [] } });
         }
      }
      setSnapGuides(snapResult);

      if (parentId) {
        const parent = activeTables.find(t => t._id === parentId);
        if (parent) {
          const pW = parent.metadata?.width || (parent.metadata?.isDiningArea ? 400 : parent.metadata?.isSection ? 350 : 100);
          const pH = parent.metadata?.height || (parent.metadata?.isDiningArea ? 300 : parent.metadata?.isSection ? 250 : 100);

          if (isStructuralElement) {
            const SNAP_THRESHOLD = 20; // Magnetic pull radius
            const distTop = Math.abs(newY);
            const distBottom = Math.abs(newY - pH);
            const distLeft = Math.abs(newX);
            const distRight = Math.abs(newX - pW);
            
            const minDist = Math.min(distTop, distBottom, distLeft, distRight);
            
            if (minDist <= SNAP_THRESHOLD || ['open_side', 'view_marker', 'entrance'].includes(table.type)) {
              // MAGNETIC SNAP OR FORCED EDGE
              let edge = 'top';
              let offset = 0;
              if (minDist === distTop) { edge = 'top'; offset = newX + tW/2; }
              else if (minDist === distBottom) { edge = 'bottom'; offset = newX + tW/2; }
              else if (minDist === distLeft) { edge = 'left'; offset = newY + tH/2; }
              else { edge = 'right'; offset = newY + tH/2; }
              
              const maxOffset = (edge === 'top' || edge === 'bottom') ? pW : pH;
              offset = Math.max(0, Math.min(offset, maxOffset));
              
              updateTableProperties(draggingTableId, { metadata: { ...table.metadata, edge, offset } });
              return; // Do not update raw position, let edge override handle it
            } else {
              // DETACH & FREE MOVE
              newX = Math.max(0, Math.min(newX, pW - tW));
              newY = Math.max(0, Math.min(newY, pH - tH));
              
              if (table.metadata.edge) {
                updateTableProperties(draggingTableId, { metadata: { ...table.metadata, edge: null, offset: null } });
              }
              // Allow execution to fall through and update actual X/Y
            }
          } else if (table.metadata?.isSection) {
            // STRICT CLAMPING
            const bounds = getParentSafeBounds(table, activeTables);
            const clamped = clampToBounds(newX, newY, tW, tH, bounds);
            newX = clamped.x;
            newY = clamped.y;

            // SECTION COLLISION PREVIEW
            const isColliding = checkSectionCollision(table._id, newX, newY, tW, tH, parentId, activeTables);
            if (table.metadata.isColliding !== isColliding) {
               updateTableProperties(draggingTableId, { metadata: { ...table.metadata, isColliding } });
            }
          } else if (table.metadata?.isArrangementZone) {
            // STRICT CLAMPING for nested zones (cannot escape parent bounds)
            const bounds = getParentSafeBounds(table, activeTables);
            const clamped = clampToBounds(newX, newY, tW, tH, bounds);
            newX = clamped.x;
            newY = clamped.y;
          } else {
            // SOFT CONTAINMENT for tables. Allow visual bleeding during drag.
          }
        }
      }

      // Universal Global Coordinate Hover Engine
      if (table && (!table.metadata?.isLayoutElement || table.metadata?.isStructuralElement)) {
        // Compute the absolute global position of the table's current center
        let currentGlobalX = newX;
        let currentGlobalY = newY;
        if (parentId) {
            const parentTable = activeTables.find(t => t._id === parentId);
            if (parentTable) {
                const pGlobal = getGlobalPosition(parentTable, activeTables);
                currentGlobalX = pGlobal.x + newX;
                currentGlobalY = pGlobal.y + newY;
            }
        }
        const cx = currentGlobalX + tW / 2;
        const cy = currentGlobalY + tH / 2;

        const validContainers = activeTables.filter(z => {
           if (z._id === table._id) return false;
           if (!z.metadata?.isArrangementZone && !z.metadata?.isSection && !z.metadata?.isDiningArea) return false;
           if (table.metadata?.isStructuralElement && z.metadata?.isArrangementZone) return false;
           const gPos = getGlobalPosition(z, activeTables);
           const zW = z.metadata?.width || (z.metadata?.isArrangementZone ? 300 : 100);
           const zH = z.metadata?.height || (z.metadata?.isArrangementZone ? 200 : 100);
           return cx >= gPos.x && cx <= gPos.x + zW && cy >= gPos.y && cy <= gPos.y + zH;
        });
        validContainers.sort((a, b) => {
           const getZ = (t) => t.metadata?.isArrangementZone ? 1 : t.metadata?.isSection ? 2 : 3;
           return getZ(a) - getZ(b);
        });
        setDragHoverTargetId(validContainers[0] ? validContainers[0]._id : null);
      } else if (table && table.metadata?.isArrangementZone && !parentId) {
        const cx = newX + tW / 2;
        const cy = newY + tH / 2;
        const targetArea = activeTables.find(da => {
           if (!da.metadata?.isDiningArea) return false;
           const gPos = getGlobalPosition(da, activeTables);
           return cx >= gPos.x && cx <= gPos.x+(da.metadata?.width||400) && cy >= gPos.y && cy <= gPos.y+(da.metadata?.height||300);
        });
        setDragHoverTargetId(targetArea ? targetArea._id : null);
      }
      
      const finalX = isStructuralElement ? newX : Math.max(0, newX);
      const finalY = isStructuralElement ? newY : Math.max(0, newY);
      currentDragPosRef.current = { x: finalX, y: finalY };
      updateTablePosition(draggingTableId, { x: finalX, y: finalY });
    }
  };

  const handlePointerUp = (e) => {
    if (activePointerId !== null && e.pointerId !== activePointerId) return;

    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch(err) {}
    setActivePointerId(null);

    setDragHoverTargetId(null);
    setPotentialDragId(null);
    setSnapGuides(null);

    if (draggingTableId) {
      const table = activeTables.find(t => t._id === draggingTableId);
      
      // Save snap guide connection
      if (table && snapGuides) {
         updateTableProperties(draggingTableId, { 
            metadata: { 
               ...table.metadata, 
               attachments: [{ targetId: snapGuides.targetId, type: snapGuides.type }] 
            } 
         });
      }

      if (table && table.metadata?.isColliding) {
         updateTablePosition(draggingTableId, { x: dragStartRef.current.tableStartX, y: dragStartRef.current.tableStartY });
         updateTableProperties(draggingTableId, { metadata: { ...table.metadata, isColliding: false } });
         toast.error("Sections cannot overlap.");
         setDraggingTableId(null);
         return;
      }

      // Snap to 10px grid on drop
      if (table) {
        const dragPos = currentDragPosRef.current || { x: table.position?.x || 0, y: table.position?.y || 0 };
        const { width: tW, height: tH } = getTableDimensions(table);
        let snappedX = Math.round(dragPos.x / 10) * 10;
        let snappedY = Math.round(dragPos.y / 10) * 10;
        
        if (!table.metadata?.isArrangementZone && (!table.metadata?.isLayoutElement || table.metadata?.isStructuralElement)) {
          // SOFT CONTAINMENT: Reparenting on drop
          const parentId = table.metadata?.zoneId || table.metadata?.sectionId || table.metadata?.diningAreaId;
          
          let currentGlobalX = dragPos.x;
          let currentGlobalY = dragPos.y;
          if (parentId) {
              const parentTable = activeTables.find(t => t._id === parentId);
              if (parentTable) {
                  const pGlobal = getGlobalPosition(parentTable, activeTables);
                  currentGlobalX = pGlobal.x + currentGlobalX;
                  currentGlobalY = pGlobal.y + currentGlobalY;
              }
          }
          const cx = currentGlobalX + tW / 2;
          const cy = currentGlobalY + tH / 2;

          console.log(`\n--- DROP EVENT (INTERNAL DRAG) ---`);
          console.log(`Cursor Global X,Y: ${cx}, ${cy}`);

          const validContainers = activeTables.filter(c => {
             if (c._id === table._id) return false;
             if (!c.metadata?.isArrangementZone && !c.metadata?.isSection && !c.metadata?.isDiningArea) return false;
             if (table.metadata?.isStructuralElement && c.metadata?.isArrangementZone) return false;
             const gPos = getGlobalPosition(c, activeTables);
             const cW = c.metadata?.width || (c.metadata?.isDiningArea ? 400 : c.metadata?.isSection ? 350 : c.metadata?.isArrangementZone ? 300 : 100);
             const cH = c.metadata?.height || (c.metadata?.isDiningArea ? 300 : c.metadata?.isSection ? 250 : c.metadata?.isArrangementZone ? 200 : 100);
             return cx >= gPos.x && cx <= gPos.x + cW && cy >= gPos.y && cy <= gPos.y + cH;
          });

          const detectedDiningArea = validContainers.find(c => c.metadata?.isDiningArea);
          const detectedSection = validContainers.find(c => c.metadata?.isSection);
          const detectedZone = validContainers.find(c => c.metadata?.isArrangementZone);

          console.log(`Detected Dining Area: ${detectedDiningArea ? detectedDiningArea.metadata?.preset || detectedDiningArea._id : 'null'}`);
          console.log(`Detected Section: ${detectedSection ? detectedSection.metadata?.preset || detectedSection._id : 'null'}`);
          console.log(`Detected Arrangement Zone: ${detectedZone ? detectedZone._id : 'null'}`);

          validContainers.sort((a, b) => {
             const getZ = (t) => t.metadata?.isArrangementZone ? 1 : t.metadata?.isSection ? 2 : 3;
             return getZ(a) - getZ(b);
          });
          let newParent = validContainers[0];

          if (newParent) {
            console.log(`Parent Type: ${newParent.metadata?.isArrangementZone ? 'arrangement_zone' : newParent.metadata?.isSection ? 'section' : 'dining_area'}`);
            console.log(`Parent Name: ${newParent.metadata?.preset || newParent._id}`);
            console.log(`Parent Id: ${newParent._id}`);
            console.log(`------------------\n`);

             const isZone = !!newParent.metadata?.isArrangementZone;
             const isSection = !!newParent.metadata?.isSection;
             const isDiningArea = !!newParent.metadata?.isDiningArea;

             let targetSection = null;
             if (isZone) {
               targetSection = activeTables.find(t => t._id === newParent.metadata.sectionId);
             } else if (isSection) {
               targetSection = newParent;
             }

             let newSectionType = table.section;
             if (targetSection) {
               const targetSectionType = targetSection.metadata?.value || targetSection.metadata?.preset;
               if (targetSectionType) {
                   newSectionType = targetSectionType;
               }
             }

             const gParentPos = getGlobalPosition(newParent, activeTables);
             const localX = currentGlobalX - gParentPos.x;
             const localY = currentGlobalY - gParentPos.y;
             
             let newSnappedX = Math.round(localX / 10) * 10;
             let newSnappedY = Math.round(localY / 10) * 10;
             
             // Extract target bounds explicitly (bypassing getParentSafeBounds which returns grandparent bounds)
             const pW = newParent.metadata?.width || (newParent.metadata?.isDiningArea ? 400 : newParent.metadata?.isSection ? 350 : 100);
             const pH = newParent.metadata?.height || (newParent.metadata?.isDiningArea ? 300 : newParent.metadata?.isSection ? 250 : 100);
             const SAFE_BORDER = newParent.metadata?.isDiningArea ? 16 : 12;
             const bounds = { minX: SAFE_BORDER, minY: SAFE_BORDER, maxX: pW - SAFE_BORDER, maxY: pH - SAFE_BORDER };
             
             const clamped = clampToBounds(newSnappedX, newSnappedY, tW, tH, bounds);

             const previousZoneId = table.metadata?.zoneId;
             const newParentId = newParent._id;

             // Resolve new price dynamically based on new container logic
             let newPrice = table.metadata?.resolvedPrice;
             let newSource = table.metadata?.priceSource;

             if (!table.metadata?.isLayoutElement) {
                const { price, source } = resolveTablePrice(
                   { ...table, section: newSectionType },
                   pricingConfigs
                );
                newPrice = price;
                newSource = source;
             }

             designer.updateTableProperties(table._id, {
                section: newSectionType,
                position: { ...table.position, x: clamped.x, y: clamped.y },
                metadata: { 
                   ...table.metadata, 
                   zoneId: isZone ? newParentId : null, 
                   sectionId: isSection ? newParentId : (isZone ? newParent.metadata?.sectionId : null),
                   diningAreaId: isDiningArea ? newParentId : (newParent.metadata?.diningAreaId || null),
                   resolvedPrice: newPrice,
                   priceSource: newSource
                }
             });

             if (isZone) setTimeout(() => designer.autoArrangeZone(newParentId), 50);
             if (previousZoneId && previousZoneId !== newParentId) setTimeout(() => designer.autoArrangeZone(previousZoneId), 50);
          } else {
             // Invalid drop outside everything. Revert to current parent's safe bounds.
             const bounds = getParentSafeBounds(table, activeTables);
             if (bounds) {
                const clamped = clampToBounds(snappedX, snappedY, tW, tH, bounds);
                updateTablePosition(draggingTableId, { x: clamped.x, y: clamped.y });
                if (table.metadata?.zoneId) setTimeout(() => designer.autoArrangeZone(table.metadata.zoneId), 50);
             } else {
                updateTablePosition(draggingTableId, { x: snappedX, y: snappedY });
             }
          }
        } else if (table.metadata?.isArrangementZone) {
          // Zone dropped. Strict clamping ensures it cannot leave its Dining Area.
          const bounds = getParentSafeBounds(table, activeTables);
          if (bounds) {
             const clamped = clampToBounds(snappedX, snappedY, tW, tH, bounds);
             snappedX = clamped.x;
             snappedY = clamped.y;
          }
          updateTablePosition(draggingTableId, { x: snappedX, y: snappedY });
        } else {
          updateTablePosition(draggingTableId, { x: snappedX, y: snappedY });
        }
      }
    }
    if (resizingTableId) {
      const table = activeTables.find(t => t._id === resizingTableId);
      if (table) {
        let snappedW = Math.round((table.metadata?.width || 80) / 10) * 10;
        let snappedH = Math.round((table.metadata?.height || 60) / 10) * 10;
        let snappedX = Math.round((table.position?.x || 0) / 10) * 10;
        let snappedY = Math.round((table.position?.y || 0) / 10) * 10;
        
        const bounds = getParentSafeBounds(table, activeTables);
        if (bounds) {
          if (snappedX + snappedW > bounds.maxX) snappedW = bounds.maxX - snappedX;
          if (snappedY + snappedH > bounds.maxY) snappedH = bounds.maxY - snappedY;
          const clamped = clampToBounds(snappedX, snappedY, snappedW, snappedH, bounds);
          snappedX = clamped.x;
          snappedY = clamped.y;
        }

        if (table && table.metadata?.isColliding) {
           // Revert resize
           designer.updateTableProperties(resizingTableId, {
              position: { ...table.position, x: resizeStartRef.current.startX, y: resizeStartRef.current.startY },
              metadata: { ...table.metadata, width: resizeStartRef.current.startW, height: resizeStartRef.current.startH, isColliding: false }
           });
           toast.error("Sections cannot overlap.");
        } else {
           designer.updateTableProperties(resizingTableId, {
             position: { ...table.position, x: snappedX, y: snappedY },
             metadata: { ...table.metadata, width: Math.max(10, snappedW), height: Math.max(10, snappedH) }
           });

           if (table.metadata?.isArrangementZone) {
             setTimeout(() => designer.autoArrangeZone(table._id), 50);
           }
        }
      }
    }

    setIsPanning(false);
    setDraggingTableId(null);
    setResizingTableId(null);
    setResizeDirection(null);
  };

  // Auto-fit on load or when clicking Fit Layout
  const fitLayout = useCallback(() => {
    if (!activeTables || activeTables.length === 0) {
      setPan({ x: 0, y: 0 });
      setScale(1);
      return;
    }
    
    // Find bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    activeTables.forEach(t => {
      const w = t.metadata?.width || 80;
      const h = t.metadata?.height || 60;
      const x = t.position?.x || 0;
      const y = t.position?.y || 0;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    });

    const padding = 100;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    
    // Get viewport size roughly
    const vWidth = containerRef.current?.parentElement?.clientWidth || window.innerWidth - 320;
    const vHeight = containerRef.current?.parentElement?.clientHeight || window.innerHeight;
    
    const scaleX = vWidth / width;
    const scaleY = vHeight / height;
    const newScale = Math.min(scaleX, scaleY, 1); // Max scale 1
    
    setScale(newScale);
    
    // Center it
    const centerX = minX + (maxX - minX) / 2;
    const centerY = minY + (maxY - minY) / 2;
    
    setPan({
      x: (vWidth / 2) - (centerX * newScale),
      y: (vHeight / 2) - (centerY * newScale)
    });
  }, [activeTables]);

  // Fit layout on first render when tables load
  useEffect(() => {
    const timer = setTimeout(() => fitLayout(), 100);
    return () => clearTimeout(timer);
  }, [activeTables.length]); // Re-run if length goes from 0 to N. Might want a dedicated 'hasFitted' ref in production.



  const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.5));
  const handleReset = () => { setScale(1); setPan({ x: 0, y: 0 }); };

  return (
    <div 
      className={`w-full h-full relative overflow-hidden ${isPanning || isSpaceDown ? 'cursor-grabbing' : draggingTableId ? 'cursor-grabbing' : isSpaceDown ? 'cursor-grab' : 'cursor-default'}`}
      style={{
        // Immersive restaurant floor background
        backgroundColor: '#e6e3dd',
        backgroundImage: `
          linear-gradient(45deg, #dfdbd3 25%, transparent 25%, transparent 75%, #dfdbd3 75%, #dfdbd3), 
          linear-gradient(45deg, #dfdbd3 25%, transparent 25%, transparent 75%, #dfdbd3 75%, #dfdbd3)`,
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 20px 20px'
      }}
      onPointerDown={(e) => handlePointerDown(e)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedTableId(null);
      }}
    >
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 z-[60] flex items-center bg-card/90 backdrop-blur border border-border/50 rounded-lg shadow-sm p-1 transition-all">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleZoomOut} title="Zoom Out"><ZoomOut className="h-4 w-4" /></Button>
        <span className="text-xs font-bold w-12 text-center text-foreground">{Math.round(scale * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleZoomIn} title="Zoom In"><ZoomIn className="h-4 w-4" /></Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={fitLayout} title="Fit Layout"><Expand className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleReset} title="Reset View"><Maximize className="h-4 w-4" /></Button>
      </div>

      <DesignerMinimap 
        activeTables={validatedTables} 
        pan={pan} 
        setPan={setPan} 
        scale={scale} 
        containerRef={containerRef} 
      />

      <div 
        ref={containerRef}
        className="absolute top-0 left-0 origin-top-left min-w-[3000px] min-h-[3000px] pointer-events-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDragOver={handleDragOver}
        onDrop={handleExternalDrop}
        style={{ 
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          // Only show grid in Edit mode
          backgroundImage: isEditMode ? "radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)" : "none", 
          backgroundSize: '20px 20px' 
        }}
      >
        <div className="absolute inset-0 pointer-events-auto">
          {(() => {
            const renderTableTree = (table, visited = new Set()) => {
              if (visited.has(table._id)) return null;
              visited.add(table._id);

              // Z-Index ordering inside parent: Sections (1) -> Zones (2) -> Tables/Structural (3)
              const children = validatedTables
                .filter(t => {
                   if (t._id === table._id) return false;
                   if (table.metadata?.isArrangementZone) {
                      return t.metadata?.zoneId === table._id;
                   } else if (table.metadata?.isSection) {
                      return t.metadata?.sectionId === table._id && !t.metadata?.zoneId;
                   } else if (table.metadata?.isDiningArea) {
                      return t.metadata?.diningAreaId === table._id && !t.metadata?.sectionId && !t.metadata?.zoneId;
                   }
                   return false;
                })
                .sort((a, b) => {
                  const getZ = (t) => t.metadata?.isSection ? 1 : t.metadata?.isArrangementZone ? 2 : 3;
                  return getZ(a) - getZ(b);
                });

              let renderTable = table;
              if (table.metadata?.isStructuralElement && table.metadata.edge) {
                const parent = validatedTables.find(t => t._id === (table.metadata.sectionId || table.metadata.diningAreaId));
                if (parent) {
                  const pw = parent.metadata?.width || (parent.metadata?.isSection ? 350 : 400);
                  const ph = parent.metadata?.height || (parent.metadata?.isSection ? 250 : 300);
                  const ew = table.metadata?.width || (table.type === 'entrance' || table.type === 'door' ? 60 : 80);
                  const eh = table.metadata?.height || 10;
                  const edge = table.metadata.edge;
                  let offset = table.metadata.offset || 0;
                  
                  // Clamp offset in case parent resized smaller
                  const maxOffset = (edge === 'top' || edge === 'bottom') ? pw : ph;
                  offset = Math.max(0, Math.min(offset, maxOffset));
                  
                  let x = 0, y = 0, rotation = 0;
                  if (edge === 'top') { x = offset - ew/2; y = -eh/2; rotation = 0; }
                  else if (edge === 'bottom') { x = offset - ew/2; y = ph - eh/2; rotation = 0; }
                  else if (edge === 'left') { x = -ew/2; y = offset - eh/2; rotation = 90; }
                  else if (edge === 'right') { x = pw - ew/2; y = offset - eh/2; rotation = 90; }
                  
                  const angleOffset = table.metadata.angleOffset || 0;
                  rotation = (rotation + angleOffset) % 360;

                  renderTable = {
                    ...table,
                    position: { ...table.position, x, y, rotation }
                  };
                }
              }

              return (
                <TableItem
                  key={table._id}
                  table={renderTable}
                  isSelected={selectedTableId === table._id}
                  isDragHoverTarget={dragHoverTargetId === table._id}
                  isDragging={draggingTableId === table._id}
                  isEditor={isEditMode}
                  onClick={(e, t) => {
                    e.stopPropagation();
                    if (isEditMode) setSelectedTableId(t._id);
                  }}
                  onPointerDown={(e, id) => {
                    e.stopPropagation();
                    handlePointerDown(e, id);
                  }}
                  onResizeStart={(e, id, dir) => handleResizeStart(e, id, dir)}
                >
                  {children.map(c => renderTableTree(c, new Set(visited)))}
                </TableItem>
              );
            };

            const rootTables = validatedTables
              .filter(t => t.metadata?.isDiningArea || (!t.metadata?.diningAreaId && !t.metadata?.sectionId && !t.metadata?.zoneId))
              .sort((a, b) => {
                const getZ = (t) => t.metadata?.isDiningArea ? 1 : t.metadata?.isSection ? 2 : t.metadata?.isArrangementZone ? 3 : 4;
                return getZ(a) - getZ(b);
              });

            return (
              <>
                {rootTables.map(t => renderTableTree(t))}
                {dragDropPreview && (
                  <TableItem
                    key="drag_preview"
                    table={dragDropPreview}
                    isSelected={false}
                    isDragging={true}
                    isEditor={true}
                  />
                )}
              </>
            );
          })()}
          
          {/* Render Snap Guides */}
          {(() => {
             if (snapGuides && snapGuides.edgeRect && draggingTableId) {
                const draggingTable = activeTables.find(t => t._id === draggingTableId);
                const parentId = draggingTable?.metadata?.sectionId || draggingTable?.metadata?.diningAreaId;
                const parent = activeTables.find(t => t._id === parentId);
                let gx = snapGuides.edgeRect.x;
                let gy = snapGuides.edgeRect.y;
                if (parent) {
                    const gPos = getGlobalPosition(parent, activeTables);
                    gx += gPos.x;
                    gy += gPos.y;
                }
                
                const isVertical = snapGuides.edgeRect.w === 0;
                
                return (
                   <div 
                     className="absolute z-[100] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] pointer-events-none"
                     style={{
                        left: isVertical ? gx - 2 : gx,
                        top: !isVertical ? gy - 2 : gy,
                        width: isVertical ? 4 : Math.max(4, snapGuides.edgeRect.w),
                        height: !isVertical ? 4 : Math.max(4, snapGuides.edgeRect.h),
                        borderRadius: 2
                     }}
                   />
                );
             }
             return null;
          })()}
        </div>
        
        {activeTables.length === 0 && isEditMode && (
          <div className="absolute top-[200px] left-[400px] bg-card/90 backdrop-blur px-8 py-6 rounded-2xl border border-border shadow-xl pointer-events-none max-w-sm">
            <div className="flex justify-center mb-4"><Move className="h-10 w-10 text-primary opacity-50" /></div>
            <h3 className="font-bold text-foreground text-center text-lg">Empty Canvas</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Start by creating tables from the Layout Manager on the left.
            </p>
            <div className="mt-6 space-y-2 text-xs text-muted-foreground font-medium">
              <p>1. Select Floor & Section</p>
              <p>2. Configure Table Shape & Size</p>
              <p>3. Click "Place on Canvas"</p>
              <p>4. Drag to arrange</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
