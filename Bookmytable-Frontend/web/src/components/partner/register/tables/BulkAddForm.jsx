import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { FLOOR_OPTIONS, SECTION_OPTIONS } from "@/lib/tableConstants";
import { usePricingConfig } from "@/hooks/usePricing";
import { useDiningAreas } from "@/hooks/useLayouts";
import { getPriceSourceBadgeClass, getPriceSourceLabel } from "@/lib/priceUtils";

export function BulkAddForm({ onAdd, onGenerate, existingCodes, disabled, restaurantId }) {
  const [form, setForm] = useState({ prefix: "T", capacity: "2", quantity: "1", type: "indoor_dining", floor: "", floorLabel: "", section: "couple_zone", sectionLabel: "Couple Zone", diningArea: "" });

  const isBackendFlow = !!onGenerate;
  const [customPrice, setCustomPrice] = useState("");
  const { data: pricingConfigs = [] } = usePricingConfig(restaurantId || "");
  const { data: diningAreas = [] } = useDiningAreas(restaurantId || "");

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

  const isFormComplete = form.prefix.trim() !== "" && form.floor && form.type && form.section;

  const handleCapacityChange = (e) => {
    const val = Number(e.target.value);
    let newSection = form.section;
    if (val === 2) {
      newSection = "couple_zone";
    } else if (val > 2 && newSection === "couple_zone") {
      newSection = "family_zone";
    }
    const newSectionLabel = newSection !== 'custom' ? SECTION_OPTIONS.find(o => o.value === newSection)?.label : form.sectionLabel;
    setForm({...form, capacity: val, section: newSection, sectionLabel: newSectionLabel || ""});
  };

  const handleAdd = () => {
    const qty = parseInt(form.quantity);
    const cap = parseInt(form.capacity);
    
    if (qty < 1 || qty > 100) return toast.error("Quantity must be between 1 and 100");
    if (cap < 1 || cap > 100) return toast.error("Capacity must be between 1 and 100");
    if (!form.prefix) return toast.error("Prefix is required");
    if (!form.floor.trim()) return toast.error("Floor is required");
    if (!form.section.trim()) return toast.error("Section is required");

    let resolvedDiningArea = form.diningArea;
    if (isBackendFlow) {
      if (!resolvedDiningArea || resolvedDiningArea === 'none') {
        const match = diningAreas.find(d => d.floor === form.floor && d.type === form.type);
        if (match) {
          resolvedDiningArea = match._id;
        } else {
          resolvedDiningArea = undefined;
        }
      }
    }

    if (form.section === 'family_zone' && cap <= 2) {
      return toast.error("Family Area requires a capacity greater than 2.");
    }

    // If onGenerate is provided, pass the raw form straight to the parent (Backend Flow)
    if (onGenerate) {
      onGenerate({ 
        ...form, 
        diningArea: resolvedDiningArea,
        price: effectivePrice,
        tablePriceOverride: customPrice !== "" ? Number(customPrice) : undefined
      });
      setForm({ prefix: "T", capacity: "2", quantity: "1", type: "indoor_dining", floor: "", floorLabel: "", section: "couple_zone", sectionLabel: "Couple Zone", diningArea: "" });
      setCustomPrice("");
      return;
    }

    // Otherwise, execute legacy logic (Frontend Flow)
    let addedCount = 0;
    let nextNum = 1;
    const newTables = [];

    // Find starting number that doesn't conflict
    while (addedCount < qty) {
      const code = `${form.prefix}${nextNum}`;
      if (!existingCodes.has(code) && !newTables.find(t => t.tableCode === code)) {
        newTables.push({
          id: Math.random().toString(36).substring(7),
          tableCode: code,
          capacity: cap,
          type: form.type,
          floor: form.floor,
          floorLabel: form.floorLabel,
          section: form.section,
          sectionLabel: form.sectionLabel,
          price: effectivePrice,
          resolvedPrice: effectivePrice,
          priceSource
        });
        addedCount++;
      }
      nextNum++;
    }

    onAdd(newTables);
    toast.success(`Generated ${qty} table(s) successfully`);
    setForm({ prefix: "T", capacity: "2", quantity: "1", type: "indoor_dining", floor: "", floorLabel: "", section: "couple_zone", sectionLabel: "Couple Zone", diningArea: "" });
    setCustomPrice("");
  };

  return (
    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 mb-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Bulk Generate Tables</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Quickly create multiple tables with matching floor, section, and pricing.</p>
        </div>
        
        {/* Estimated Pricing View for Backend Flow */}
        {isBackendFlow && (
          <div className="bg-background border border-border px-3.5 py-2 rounded-xl min-w-[180px] shadow-sm flex items-center justify-between gap-3">
            <div>
              <Label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estimated Rate</Label>
              <span className="text-lg font-black text-foreground">₹{effectivePrice}</span>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getPriceSourceBadgeClass(priceSource)}`}>
              {customPrice !== "" ? "Custom" : getPriceSourceLabel(priceSource)}
            </span>
          </div>
        )}
      </div>

      {/* Table Specifications Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground/80">Prefix</Label>
          <Input 
            placeholder="e.g. T" 
            value={form.prefix} 
            onChange={(e) => setForm({...form, prefix: e.target.value})}
            className="h-10 bg-white rounded-xl text-sm font-medium"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground/80">Capacity</Label>
          <Input 
            type="number" 
            min="1"
            value={form.capacity} 
            onChange={handleCapacityChange}
            className="h-10 bg-white rounded-xl text-sm font-medium"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground/80">Type</Label>
          <Select value={form.type} onValueChange={(val) => setForm({...form, type: val})}>
            <SelectTrigger className="h-10 bg-white rounded-xl text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indoor_dining">Indoor</SelectItem>
              <SelectItem value="outdoor_dining">Outdoor</SelectItem>
              <SelectItem value="rooftop_dining">Rooftop</SelectItem>
              <SelectItem value="private_room">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground/80">Floor</Label>
          <Select value={form.floor} onValueChange={(val) => setForm({...form, floor: val, floorLabel: val !== 'custom' ? FLOOR_OPTIONS.find(o => o.value === val)?.label : ""})}>
            <SelectTrigger className="h-10 bg-white rounded-xl text-sm font-medium">
              <SelectValue placeholder="Floor" />
            </SelectTrigger>
            <SelectContent>
              {FLOOR_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.floor === 'custom' && (
            <Input 
              placeholder="Custom Floor" 
              value={form.floorLabel} 
              onChange={(e) => setForm({...form, floorLabel: e.target.value})}
              className="h-10 bg-white rounded-xl mt-1.5 text-sm"
            />
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground/80">Section</Label>
          <Select value={form.section} onValueChange={(val) => setForm({...form, section: val, sectionLabel: val !== 'custom' ? SECTION_OPTIONS.find(o => o.value === val)?.label : ""})}>
            <SelectTrigger className="h-10 bg-white rounded-xl text-sm font-medium">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              {SECTION_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.section === 'custom' && (
            <Input 
              placeholder="Custom Section" 
              value={form.sectionLabel} 
              onChange={(e) => setForm({...form, sectionLabel: e.target.value})}
              className="h-10 bg-white rounded-xl mt-1.5 text-sm"
            />
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground/80">Price (₹)</Label>
          <Input 
            type="number" 
            min="0"
            placeholder={matchedPricing ? String(matchedPricing.price) : "0"} 
            value={customPrice} 
            onChange={(e) => setCustomPrice(e.target.value)}
            className="h-10 bg-white rounded-xl text-sm font-medium"
          />
        </div>
      </div>

      {/* Action Row: Quantity & Dedicated Generate Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4 pt-3 border-t border-primary/10">
        <div className="w-full sm:w-44 space-y-1.5">
          <Label className="text-xs font-semibold text-foreground/80">Quantity</Label>
          <Input 
            type="number" 
            min="1"
            max="100"
            placeholder="1-100"
            value={form.quantity} 
            onChange={(e) => setForm({...form, quantity: e.target.value})}
            className="h-10 bg-white rounded-xl text-sm font-medium"
          />
        </div>

        <Button 
          type="button" 
          onClick={handleAdd} 
          className="rounded-xl h-10 px-6 font-bold shadow-sm sm:w-auto w-full min-w-[160px] gap-2 shrink-0" 
          disabled={disabled}
        >
          <Plus className="h-4 w-4" /> Generate Tables
        </Button>
      </div>
    </div>
  );
}
