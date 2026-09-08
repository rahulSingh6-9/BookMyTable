import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, LayoutGrid, Rows, Columns, BoxSelect } from "lucide-react";

export function ZoneProperties({ designer, table }) {
  const handleChange = (field, value, isMetadata = false) => {
    if (isMetadata) {
      designer.updateTableProperties(table._id, {
        metadata: { ...table.metadata, [field]: value }
      });
    } else {
      designer.updateTableProperties(table._id, { [field]: value });
    }
    // Instantly apply layout math on any change
    setTimeout(() => {
      designer.autoArrangeZone(table._id);
    }, 50);
  };

  const childrenCount = designer.activeTables.filter(t => t.metadata?.zoneId === table._id).length;

  return (
    <div className="space-y-6">
      {/* Element Info */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <BoxSelect className="w-4 h-4" /> Zone Info
        </h4>
        
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Zone Name</Label>
          <Input 
            value={table.tableCode || ""} 
            onChange={e => handleChange('tableCode', e.target.value)}
            className="h-9 bg-background/50 border-border/50 text-sm focus-visible:ring-1"
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <Table className="w-4 h-4 text-primary" />
          <div className="text-sm">
            <span className="font-bold text-primary">{childrenCount}</span> 
            <span className="text-muted-foreground"> tables auto-arranged</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-border/40 w-full" />

      {/* Auto Arrange Settings */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Arrangement Engine</h4>
        
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Layout Type</Label>
          <Select 
            value={table.metadata?.arrangementType || 'grid'} 
            onValueChange={v => handleChange('arrangementType', v, true)}
          >
            <SelectTrigger className="h-9 bg-background/50 border-border/50 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid"><div className="flex items-center"><LayoutGrid className="w-3 h-3 mr-2"/> Smart Grid</div></SelectItem>
              <SelectItem value="rows"><div className="flex items-center"><Rows className="w-3 h-3 mr-2"/> Stack Rows</div></SelectItem>
              <SelectItem value="columns"><div className="flex items-center"><Columns className="w-3 h-3 mr-2"/> Stack Columns</div></SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Spacing (px)</Label>
            <Input 
              type="number" 
              min={0}
              value={table.metadata?.arrangementSpacing ?? 20} 
              onChange={e => handleChange('arrangementSpacing', parseInt(e.target.value) || 0, true)}
              className="h-9 bg-background/50 border-border/50 text-sm focus-visible:ring-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Padding (px)</Label>
            <Input 
              type="number" 
              min={0}
              value={table.metadata?.arrangementPadding ?? 20} 
              onChange={e => handleChange('arrangementPadding', parseInt(e.target.value) || 0, true)}
              className="h-9 bg-background/50 border-border/50 text-sm focus-visible:ring-1"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-border/40 w-full" />

      {/* Dimensions */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dimensions</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Width (px)</Label>
            <Input 
              type="number" 
              value={table.metadata?.width || 100} 
              onChange={e => handleChange('width', Number(e.target.value), true)}
              className="h-9 bg-background/50 border-border/50 text-sm focus-visible:ring-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Height (px)</Label>
            <Input 
              type="number" 
              value={table.metadata?.height || 100} 
              onChange={e => handleChange('height', Number(e.target.value), true)}
              className="h-9 bg-background/50 border-border/50 text-sm focus-visible:ring-1"
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground italic">
          Tip: You can also drag the edges of the zone directly on the canvas to resize and auto-arrange.
        </p>
      </div>
    </div>
  );
}
