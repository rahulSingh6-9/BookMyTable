import { TableItem } from "@/components/visual-layout/TableItem";

export function LayoutViewer({ room, getTableStatus, selectedId, onSelect }) {
  if (!room) {
    return (
      <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
        No layout available.
      </div>
    );
  }

  const { layout } = room;

  return (
    <div className="relative w-full h-[600px] border border-border/50 rounded-2xl overflow-hidden bg-muted/20 shadow-inner">
      <div className="w-full h-full relative">
        <div
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Static Elements */}
        {layout.elements?.map((el) => (
          <div
            key={el.id}
            className="absolute bg-border/50 rounded-sm flex items-center justify-center border border-border pointer-events-none"
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

        {/* Tables */}
        {layout.tables?.map((table) => (
          <div key={table._id} onClick={() => onSelect?.(table)} className="absolute inset-0">
            <TableItem
              table={table}
              isEditor={false}
              status={getTableStatus?.(table) || "available"}
              isSelected={selectedId === table._id}
              onClick={() => onSelect?.(table)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

