import { useState, useRef } from "react";
import { TableItem } from "./TableItem";
import { ZoomIn, ZoomOut, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LayoutEditor({ room, updateTablePosition, saveLayout }) {
  const containerRef = useRef(null);

  if (!room) return <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">No layout available.</div>;

  const { layout } = room;

  const handleDragEnd = (id, info) => {
    // Snap to grid of 10px
    const x = Math.round(info.x / 10) * 10;
    const y = Math.round(info.y / 10) * 10;
    updateTablePosition(id, { x, y });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Editor Header / Controls */}
      <div className="flex justify-between items-center bg-card px-4 py-3 rounded-xl border border-border/50 shadow-sm">
         <span className="text-sm font-semibold text-foreground">Layout Editor: {room.name}</span>
         <div className="flex items-center gap-3">
           <span className="text-xs text-muted-foreground mr-2">Drag tables to reposition</span>
           <Button size="sm" onClick={saveLayout} className="gap-2 rounded-lg"><Save className="w-4 h-4" /> Save Layout</Button>
         </div>
      </div>

      <div className="relative w-full h-[600px] border border-border/50 rounded-2xl overflow-hidden bg-muted/20 shadow-inner">
        <div
          ref={containerRef}
          className="w-full h-full relative"
        >
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
            style={{ backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)", backgroundSize: '20px 20px' }}
          />

        {/* Render Editable Elements */}
        {layout.elements?.map(el => (
          <div
            key={el.id}
            className="absolute pointer-events-none bg-border/50 rounded-sm flex items-center justify-center border border-border"
            style={{
              left: el.position.x,
              top: el.position.y,
              width: el.size?.width || 100,
              height: el.size?.height || 20,
            }}
          >
            <span className="text-[10px] uppercase text-card-foreground font-semibold">{el.type}</span>
          </div>
        ))}

        {/* Render Editable Tables */}
        {layout.tables?.map(table => (
          <TableItem
            key={table._id}
            table={table}
            isEditor={true}
            onDragEnd={handleDragEnd}
          />
        ))}
        </div>
      </div>
    </div>
  );
}
