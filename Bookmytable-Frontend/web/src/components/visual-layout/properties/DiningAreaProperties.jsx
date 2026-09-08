import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { DINING_AREA_PRESETS } from "@/lib/tableConstants";

export function DiningAreaProperties({ table, handleChange, handleMetadataChange, designer }) {
  const originalData = designer.getOriginalTableData(table._id);
  const canResetWidth = originalData?.metadata?.width !== undefined && originalData.metadata.width !== table.metadata?.width;
  const canResetHeight = originalData?.metadata?.height !== undefined && originalData.metadata.height !== table.metadata?.height;

  // Calculate statistics
  const zonesInArea = designer.tables.filter(t => t.metadata?.diningAreaId === table._id);
  const tablesInArea = designer.tables.filter(t => {
    // If table is inside a zone that belongs to this area, or directly in this area
    if (t.metadata?.isLayoutElement || t.type === 'zone') return false;
    
    if (t.metadata?.zoneId) {
      const parentZone = designer.tables.find(z => z._id === t.metadata.zoneId);
      if (parentZone && parentZone.metadata?.diningAreaId === table._id) return true;
    }
    
    // Direct child of dining area (implicitly by intersection or explicitly?)
    // For now, let's just count zones.
    return false;
  });

  const totalCapacity = tablesInArea.reduce((acc, t) => acc + (t.capacity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dining Area Info</h4>
        
        <div>
          <Label className="text-xs mb-1.5 block">Area Name</Label>
          <Input 
            value={table.tableCode || ""} 
            onChange={e => handleChange("tableCode", e.target.value)}
            className="bg-background"
            placeholder="e.g. Main Indoor Room"
          />
        </div>

        <div>
          <Label className="text-xs mb-1.5 block">Preset Style</Label>
          <Select 
            value={table.metadata?.preset || "indoor"} 
            onValueChange={v => handleMetadataChange("preset", v)}
          >
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DINING_AREA_PRESETS.map(preset => (
                <SelectItem key={preset.value} value={preset.value}>{preset.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Pricing */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pricing</h4>
        <p className="text-[10px] text-muted-foreground -mt-2">
          Sets the default price for all tables in this area. Sections and tables can override it.
        </p>

        <div>
          <Label className="text-xs mb-1.5 block">Base Price (per booking)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">₹</span>
            <Input
              type="number"
              min={0}
              value={table.metadata?.basePrice ?? 0}
              onChange={e => handleMetadataChange("basePrice", Number(e.target.value))}
              className="bg-background h-8 text-sm pl-6"
              placeholder="0"
            />
          </div>
        </div>
      </div>

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
              value={table.metadata?.width || 400} 
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
              value={table.metadata?.height || 300} 
              onChange={e => handleMetadataChange("height", Number(e.target.value))}
              className="bg-background h-8 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Statistics */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Statistics</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted/30 p-2 rounded-md">
            <span className="text-muted-foreground block text-xs">Zones</span>
            <span className="font-medium">{zonesInArea.length}</span>
          </div>
          <div className="bg-muted/30 p-2 rounded-md">
            <span className="text-muted-foreground block text-xs">Capacity</span>
            <span className="font-medium">{totalCapacity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
