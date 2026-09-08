import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { resolveTablePrice, getPriceSourceLabel, getPriceSourceBadgeClass } from "@/lib/priceUtils";

export function TableProperties({ table, handleChange, handleMetadataChange, allTables }) {
  // Resolve current effective price live from the hierarchy
  const { price: resolvedPrice, source: priceSource } = resolveTablePrice(table, allTables);
  const hasOverride = table.metadata?.tablePriceOverride != null;

  const handleOverrideChange = (val) => {
    if (val === '' || val === null || val === undefined) {
      // Clear the override — system will recalculate from hierarchy
      const newMeta = { ...table.metadata };
      delete newMeta.tablePriceOverride;
      handleMetadataChange('tablePriceOverride', undefined);
    } else {
      handleMetadataChange('tablePriceOverride', Number(val));
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Table Configuration</h4>
        
        <div>
          <Label className="text-xs mb-1.5 block">Table Name / Code</Label>
          <Input 
            value={table.tableCode || ""} 
            onChange={e => handleChange("tableCode", e.target.value)}
            className="bg-background"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block">Capacity</Label>
            <Input 
              type="number" 
              min={1} 
              value={table.capacity || 2} 
              onChange={e => handleChange("capacity", Number(e.target.value))}
              className="bg-background"
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Type</Label>
            <div className="mt-0 h-9 flex items-center px-3 rounded-md border border-border/60 bg-muted/40 text-xs text-muted-foreground capitalize">
              {table.type || 'indoor_dining'}
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Visual Settings */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Physical Shape</h4>
        
        <div>
          <Label className="text-xs mb-1.5 block">Shape</Label>
          <Select 
            value={table.metadata?.shape || (table.capacity <= 2 ? 'square' : 'rectangle')} 
            onValueChange={v => handleMetadataChange("shape", v)}
          >
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rectangle">Rectangle</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="long">Long Table</SelectItem>
              <SelectItem value="booth">Booth</SelectItem>
              <SelectItem value="couple">Couple Table</SelectItem>
              <SelectItem value="sofa">Sofa</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground mt-2">
            Table dimensions are automatically calculated based on capacity and shape.
          </p>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Pricing */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pricing</h4>

        {/* Resolved Price Display */}
        <div className="bg-muted/30 border border-border/50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Resolved Price</span>
            <span className="text-base font-bold text-foreground">
              {resolvedPrice > 0 ? `₹${resolvedPrice}` : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Price Source</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriceSourceBadgeClass(priceSource)}`}>
              {getPriceSourceLabel(priceSource)}
            </span>
          </div>
        </div>

        {/* Custom Price Override */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs">Custom Price Override</Label>
            {hasOverride && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-destructive"
                title="Clear override — revert to inherited price"
                onClick={() => handleOverrideChange(undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">₹</span>
            <Input
              type="number"
              min={0}
              value={table.metadata?.tablePriceOverride ?? ''}
              onChange={e => handleOverrideChange(e.target.value === '' ? undefined : e.target.value)}
              className="bg-background h-8 text-sm pl-6"
              placeholder="Leave blank to inherit"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {hasOverride
              ? 'Custom price active. Clear ✕ to revert to section/area price.'
              : 'Optional. Overrides section and dining area price.'}
          </p>
        </div>
      </div>
    </div>
  );
}
