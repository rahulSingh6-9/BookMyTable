import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export function WallProperties({ table, handleChange, handleMetadataChange, designer }) {
  const originalData = designer.getOriginalTableData(table._id);
  const canResetWidth = originalData?.metadata?.width !== undefined && originalData.metadata.width !== table.metadata?.width;
  const canResetHeight = originalData?.metadata?.height !== undefined && originalData.metadata.height !== table.metadata?.height;

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Element Info</h4>
        
        <div>
          <Label className="text-xs mb-1.5 block">Label</Label>
          <Input 
            value={table.tableCode || ""} 
            onChange={e => handleChange("tableCode", e.target.value)}
            className="bg-background"
            placeholder={table.type === 'wall' ? "e.g. Brick Wall" : "e.g. Main Window"}
          />
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Dimensions */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dimensions</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs block">Width (px)</Label>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-5 w-5 ${!canResetWidth && 'opacity-0 pointer-events-none'}`} 
                title="Reset Width"
                onClick={() => handleMetadataChange("width", originalData.metadata.width)}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
            <Input 
              type="number" 
              value={table.metadata?.width || 150} 
              onChange={e => handleMetadataChange("width", Number(e.target.value))}
              className="bg-background h-8 text-sm"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs block">Height (px)</Label>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-5 w-5 ${!canResetHeight && 'opacity-0 pointer-events-none'}`} 
                title="Reset Height"
                onClick={() => handleMetadataChange("height", originalData.metadata.height)}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
            <Input 
              type="number" 
              value={table.metadata?.height || 20} 
              onChange={e => handleMetadataChange("height", Number(e.target.value))}
              className="bg-background h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Rotation Controls - Only shown when free-floating */}
      {!table.metadata?.edge && (
        <>
          <div className="h-px bg-border/50" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rotation</h4>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                {table.position?.rotation || 0}°
              </span>
            </div>
            
            <div className="space-y-4">
              <input 
                type="range" 
                min="0" 
                max="359" 
                step="1"
                value={table.position?.rotation || 0}
                onChange={e => designer.updateTablePosition(table._id, { rotation: Number(e.target.value) })}
                className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => designer.updateTablePosition(table._id, { rotation: ((table.position?.rotation || 0) - 45 + 360) % 360 })}
                >
                  <RotateCcw className="w-3 h-3 mr-1" /> -45°
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => designer.updateTablePosition(table._id, { rotation: 0 })}
                >
                  Reset
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => designer.updateTablePosition(table._id, { rotation: ((table.position?.rotation || 0) + 45) % 360 })}
                >
                  +45° <RotateCcw className="w-3 h-3 ml-1 scale-x-[-1]" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Section Pricing — only visible for Section objects */}
      {table.metadata?.isSection && (
        <>
          <div className="h-px bg-border/50" />
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Section Pricing</h4>
            <p className="text-[10px] text-muted-foreground -mt-2">
              Overrides the Dining Area base price for tables in this section.
            </p>
            <div>
              <Label className="text-xs mb-1.5 block">Section Price (per booking)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">₹</span>
                <Input
                  type="number"
                  min={0}
                  value={table.metadata?.sectionPrice ?? ''}
                  onChange={e => {
                    const val = e.target.value === '' ? undefined : Number(e.target.value);
                    handleMetadataChange("sectionPrice", val);
                  }}
                  className="bg-background h-8 text-sm pl-6"
                  placeholder="Leave blank to inherit area price"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
