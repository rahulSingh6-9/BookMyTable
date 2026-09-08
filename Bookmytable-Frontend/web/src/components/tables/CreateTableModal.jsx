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

  // Use new pricing configuration from backend
  const { data: pricingConfigs = [] } = usePricingConfig(restaurantId);

  const matchedPricing = pricingConfigs.find(p => 
    p.floor === form.floor && 
    p.diningAreaType === form.type && 
    p.sectionType === form.section
  );

  const resolvedPrice = matchedPricing?.price || 0;
  const priceSource = matchedPricing ? 'dining_area_pricing' : 'none';

  const isFormComplete = form.tableCode.trim() !== "" && form.floor && form.type && form.section;
  const isPricingMissing = isFormComplete && !matchedPricing;

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
        import("sonner").then(({ toast }) => toast.error("Please configure/select a valid Dining Area for this Floor and Type before adding tables."));
        return;
      }
    }

    if (form.section === 'family_zone' && form.capacity <= 2) {
      import("sonner").then(({ toast }) => toast.error("Family Area requires a capacity greater than 2."));
      return;
    }

    onSave({
      ...form,
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

          {/* Pricing Details (Read Only) */}
          <div className="bg-muted/30 border border-border/50 rounded-xl p-3">
            <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Estimated Pricing</Label>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="text-base font-bold text-foreground">
                {resolvedPrice > 0 ? `₹${resolvedPrice}` : 'Not Set'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Source</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriceSourceBadgeClass(priceSource)}`}>
                {getPriceSourceLabel(priceSource)}
              </span>
            </div>
            {isPricingMissing && (
              <div className="mt-4 p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-600">Pricing Not Configured</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      You must configure pricing for this section before creating tables.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold"
                  onClick={() => setIsPricingModalOpen(true)}
                >
                  Configure Pricing
                </Button>
              </div>
            )}
          </div>
         
        </div>
        <DialogFooter className="gap-2 sm:gap-0 mt-6 mb-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Cancel</Button>
          <Button 
            onClick={handleSaveClick} 
            className="rounded-lg" 
            disabled={isCreating || isUpdating || isPricingMissing}
          >
            {isCreating ? "Creating..." : isUpdating ? "Saving..." : (editingTable ? "Save Changes" : "Create Table")}
          </Button>
        </DialogFooter>
      </DialogContent>

      <PricingConfigurationModal
        open={isPricingModalOpen}
        onOpenChange={setIsPricingModalOpen}
        floor={form.floor}
        diningAreaType={form.type}
        sectionType={form.section}
      />
    </Dialog>
  );
}
