import { useState, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import { TableItem } from "./TableItem";
import { ZoomIn, ZoomOut, Move } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TableLayoutViewer({ 
  room, 
  selectedTable, 
  onSelectTable,
  guestsCount
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  if (!room) return <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">No layout available.</div>;

  const { layout } = room;

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  return (
    <div className="relative w-full h-[500px] sm:h-[600px] border border-border/50 rounded-2xl overflow-hidden bg-muted/20 shadow-inner">
      
      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 bg-background/80 backdrop-blur-md p-1.5 rounded-xl border border-border/50 shadow-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={handleZoomIn}>
          <ZoomIn className="w-4 h-4 text-foreground" />
        </Button>
        <div className="h-px bg-border/50 w-full" />
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={handleZoomOut}>
          <ZoomOut className="w-4 h-4 text-foreground" />
        </Button>
      </div>

      {/* Drag Indicator */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50 shadow-sm pointer-events-none">
        <Move className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">Drag to pan</span>
      </div>

      <motion.div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <motion.div
          drag
          dragConstraints={containerRef}
          style={{ x, y, scale }}
          className="w-full h-full origin-center relative flex items-center justify-center p-20"
        >
          <div className="relative w-[800px] h-[600px] border-2 border-dashed border-border/20 rounded-3xl bg-background/50 pointer-events-none" />
          
          {/* Render Elements (Walls, Windows) */}
          {layout.elements?.map(el => (
            <div
              key={el.id}
              className="absolute pointer-events-none bg-muted-foreground/20 rounded-sm flex items-center justify-center"
              style={{
                left: el.position.x,
                top: el.position.y,
                width: el.size?.width || 100,
                height: el.size?.height || 20,
              }}
            >
              <span className="text-[10px] uppercase text-muted-foreground font-semibold">{el.type}</span>
            </div>
          ))}

          {/* Render Tables */}
          {layout.tables?.map(table => {
            const isSelected = selectedTable?._id === table._id;
            const isAvailable = table.capacity >= guestsCount && table.isActive;

            return (
              <TableItem
                key={table._id}
                table={table}
                isSelected={isSelected}
                isAvailable={isAvailable}
                onClick={onSelectTable}
                isEditor={false}
              />
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
