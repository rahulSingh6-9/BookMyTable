import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FLOOR_OPTIONS, SECTION_OPTIONS } from "@/lib/tableConstants";
import { TABLE_TYPES } from "@/lib/mockData";
import { useDiningAreas } from "@/hooks/useLayouts";
import { getPriceSourceBadgeClass, getPriceSourceLabel } from "@/lib/priceUtils";
import { usePricingConfig } from "@/hooks/usePricing";
import { PricingConfigurationModal } from "@/components/pricing/PricingConfigurationModal";



export function CreateTableModal({
  open,
  onOpenChange,
  restaurantId,
  isCreating,
  isUpdating,
  onSave,
  editingTable = null,
  defaultDiningAreaId = null,
  defaultFloor = null,
  defaultType = null
}) {
  const { data: diningAreas = [] } = useDiningAreas(restaurantId);

  const [form, setForm] = useState({
    tableCode: "",
    capacity: 2,
    type: "indoor_dining",
    floor: "",
    floorLabel: "",
    section: "",
    sectionLabel: "",
    diningArea: ""
  });

  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [customPrice, setCustomPrice] = useState("");

  // Use new pricing configuration from backend
  const { data: pricingConfigs = [] } = usePricingConfig(restaurantId);

  const matchedPricing = pricingConfigs.find(p => {
    const typeMatches = p.diningAreaType === form.type || 
      (p.diningAreaType === 'indoor' && form.type === 'indoor_dining') ||
      (p.diningAreaType === 'indoor_dining' && form.type === 'indoor') ||
      (p.diningAreaType === 'outdoor' && form.type === 'outdoor_dining') ||
      (p.diningAreaType === 'outdoor_dining' && form.type === 'outdoor') ||
      (p.diningAreaType === 'rooftop' && form.type === 'rooftop_dining') ||
      (p.diningAreaType === 'rooftop_dining' && form.type === 'rooftop') ||
      (p.diningAreaType === 'private' && form.type === 'private_room') ||
      (p.diningAreaType === 'private_room' && form.type === 'private');

    return p.floor === form.floor && typeMatches && p.sectionType === form.section;
  });

  const effectivePrice = customPrice !== "" ? Number(customPrice) : (matchedPricing?.price || 0);
  const priceSource = customPrice !== "" ? 'override' : (matchedPricing ? 'dining_area_pricing' : 'none');

  useEffect(() => {
    if (open) {
      if (editingTable) {
        setForm({
          tableCode: editingTable.tableCode || "",
          capacity: editingTable.capacity || 2,
          type: editingTable.type || "indoor_dining",
          floor: editingTable.floor || "",
          floorLabel: editingTable.floorLabel || "",
          section: editingTable.section || "",
          sectionLabel: editingTable.sectionLabel || "",
          diningArea: editingTable.diningArea || ""
        });
        setCustomPrice(
          editingTable.tablePriceOverride !== undefined && editingTable.tablePriceOverride !== null
            ? String(editingTable.tablePriceOverride)
            : (editingTable.resolvedPrice !== undefined && editingTable.resolvedPrice !== null ? String(editingTable.resolvedPrice) : "")
        );
      } else {
        // Initialize form with defaults when opening for create
        let initialType = defaultType || "indoor_dining";
        let initialFloor = defaultFloor || "";
        
        if (defaultDiningAreaId) {
          const da = diningAreas.find(d => d._id === defaultDiningAreaId);
          if (da) {
            initialType = da.type || "indoor_dining";
            initialFloor = da.floor || "";
          }
        }

        setForm({
          tableCode: "",
          capacity: 2,
          type: initialType,
          floor: initialFloor,
          floorLabel: "",
          section: "",
          sectionLabel: "",
          diningArea: defaultDiningAreaId || ""
        });
        setCustomPrice("");
      }
    }
  }, [open, editingTable, defaultDiningAreaId, defaultFloor, defaultType, diningAreas]);

  const handleSaveClick = () => {
    let resolvedDiningArea = form.diningArea;
    if (!resolvedDiningArea || resolvedDiningArea === 'none') {
      const match = diningAreas.find(d => d.floor === form.floor && d.type === form.type);
      if (match) {
        resolvedDiningArea = match._id;
      } else {
        resolvedDiningArea = undefined;
      }
    }

    if (form.section === 'family_zone' && form.capacity <= 2) {
      import("sonner").then(({ toast }) => toast.error("Family Area requires a capacity greater than 2."));
      return;
    }

    onSave({
      ...form,
      price: customPrice !== "" ? Number(customPrice) : (matchedPricing?.price !== undefined ? matchedPricing.price : 0),
      tablePriceOverride: customPrice !== "" ? Number(customPrice) : undefined,
      diningArea: resolvedDiningArea,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border/40 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTable ? "Edit Table" : "Create Table"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-2 block text-sm font-medium">Table Code</Label>
            <Input
              placeholder="e.g., T-07"
              value={form.tableCode}
              onChange={(e) => setForm((f) => ({ ...f, tableCode: e.target.value }))}
              className="rounded-lg"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-sm font-medium">Capacity (seats)</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={form.capacity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  let newSection = form.section;
                  if (val === 2) {
                    newSection = "couple_zone";
                  }
                  setForm((f) => ({ ...f, capacity: val, section: newSection }));
                }}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium">Dining Area Type</Label>
              {/* If a Dining Area is selected from Visual Editor context, type is auto-derived and read-only */}
              {form.diningArea && form.diningArea !== 'none' ? (
                <div className="flex items-center h-10 px-3 rounded-lg border border-border/60 bg-muted/40 text-sm text-muted-foreground capitalize">
                  {TABLE_TYPES.find(t => t.value === form.type)?.label || form.type || 'Indoor'}
                </div>
              ) : (
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger className="rounded-lg bg-white"><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {TABLE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-sm font-medium">Floor</Label>
              {/* If a Dining Area is selected from Visual Editor context, floor is auto-derived and read-only */}
              {form.diningArea && form.diningArea !== 'none' ? (
                <div className="flex items-center h-10 px-3 rounded-lg border border-border/60 bg-muted/40 text-sm text-muted-foreground capitalize">
                  {FLOOR_OPTIONS.find(o => o.value === form.floor)?.label || form.floor || 'Ground Floor'}
                </div>
              ) : (
                <>
                  <Select value={form.floor} onValueChange={(v) => setForm(f => ({ ...f, floor: v, floorLabel: v !== 'custom' ? FLOOR_OPTIONS.find(o => o.value === v)?.label : "" }))}>
                    <SelectTrigger className="rounded-lg bg-white"><SelectValue placeholder="Select Floor" /></SelectTrigger>
                    <SelectContent>
                      {FLOOR_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.floor === 'custom' && (
                    <Input 
                      placeholder="Enter custom floor name" 
                      value={form.floorLabel}
                      onChange={(e) => setForm(f => ({ ...f, floorLabel: e.target.value }))}
                      className="mt-2 rounded-lg"
                    />
                  )}
                </>
              )}
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium">Section</Label>
              <Select 
                value={form.section} 
                onValueChange={(v) => setForm(f => ({ ...f, section: v, sectionLabel: v !== 'custom' ? SECTION_OPTIONS.find(o => o.value === v)?.label : "" }))}
                disabled={form.capacity === 2}
              >
                <SelectTrigger className="rounded-lg bg-white"><SelectValue placeholder="Select Section" /></SelectTrigger>
                <SelectContent>
                  {SECTION_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.section === 'custom' && (
                <Input 
                  placeholder="Enter custom section name" 
                  value={form.sectionLabel}
                  onChange={(e) => setForm(f => ({ ...f, sectionLabel: e.target.value }))}
                  className="mt-2 rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Remaining grid is Floor and Section */}

          <div className="h-px bg-border/50 my-2" />

          {/* Pricing Details */}
          <div className="bg-muted/30 border border-border/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Table Pricing (₹)</Label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriceSourceBadgeClass(priceSource)}`}>
                {customPrice !== "" ? "Custom Price" : getPriceSourceLabel(priceSource)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">₹</span>
                <Input
                  type="number"
                  min="0"
                  placeholder={matchedPricing ? String(matchedPricing.price) : "0"}
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="pl-7 rounded-lg bg-background"
                />
              </div>
              {matchedPricing && (
                <div className="text-right text-xs">
                  <div className="text-muted-foreground">Default Rate</div>
                  <div className="font-bold text-foreground">₹{matchedPricing.price}</div>
                </div>
              )}
            </div>
            {!matchedPricing && (
              <p className="text-[11px] text-muted-foreground mt-2">
                Tip: Enter a price above to apply directly to this table, or configure default section pricing below.
              </p>
            )}
            <div className="mt-3 flex justify-end">
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="text-xs text-primary hover:text-primary/80 h-7 px-2"
                onClick={() => setIsPricingModalOpen(true)}
              >
                Configure Default Section Pricing
              </Button>
            </div>
          </div>
         
        </div>
        <DialogFooter className="gap-2 sm:gap-0 mt-6 mb-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Cancel</Button>
          <Button 
            type="button"
            onClick={handleSaveClick} 
            className="rounded-lg" 
            disabled={isCreating || isUpdating}
          >
            {isCreating ? "Creating..." : isUpdating ? "Saving..." : (editingTable ? "Save Changes" : "Create Table")}
          </Button>
        </DialogFooter>
      </DialogContent>

      <PricingConfigurationModal
        open={isPricingModalOpen}
        onOpenChange={setIsPricingModalOpen}
        restaurantId={restaurantId}
        floor={form.floor}
        diningAreaType={form.type}
        sectionType={form.section}
      />
    </Dialog>
  );
}
