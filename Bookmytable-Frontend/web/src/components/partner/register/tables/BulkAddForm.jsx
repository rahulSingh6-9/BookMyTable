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
  const { data: pricingConfigs = [] } = usePricingConfig(restaurantId || "");
  const { data: diningAreas = [] } = useDiningAreas(restaurantId || "");

  const matchedPricing = pricingConfigs.find(p => 
    p.floor === form.floor && 
    p.diningAreaType === form.type && 
    p.sectionType === form.section
  );

  const resolvedPrice = matchedPricing?.price || 0;
  const priceSource = matchedPricing ? 'dining_area_pricing' : 'none';

  const isFormComplete = form.prefix.trim() !== "" && form.floor && form.type && form.section;
  const isPricingMissing = isBackendFlow && isFormComplete && !matchedPricing;

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
          return toast.error("Please configure/select a valid Dining Area for this Floor and Type before generating tables.");
        }
      }
    }

    if (form.section === 'family_zone' && cap <= 2) {
      return toast.error("Family Area requires a capacity greater than 2.");
    }

    // If onGenerate is provided, pass the raw form straight to the parent (Backend Flow)
    if (onGenerate) {
      onGenerate({ ...form, diningArea: resolvedDiningArea });
      setForm({ prefix: "T", capacity: "2", quantity: "1", type: "indoor_dining", floor: "", floorLabel: "", section: "couple_zone", sectionLabel: "Couple Zone", diningArea: "" });
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
          sectionLabel: form.sectionLabel
        });
        addedCount++;
      }
      nextNum++;
    }

    onAdd(newTables);
    toast.success(`Generated ${qty} table(s) successfully`);
    setForm({ prefix: "T", capacity: "2", quantity: "1", type: "indoor_dining", floor: "", floorLabel: "", section: "couple_zone", sectionLabel: "Couple Zone", diningArea: "" });
  };

  return (
    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 mb-8 space-y-6">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Bulk Generate Tables</h3>
        
        {/* Read Only Estimated Pricing View for Backend Flow */}
        {isBackendFlow && (
          <div className="bg-background border border-border p-3 rounded-xl min-w-[200px] shadow-sm">
            <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Estimated Pricing</Label>
            {!isFormComplete ? (
              <p className="text-xs text-muted-foreground italic">Select Floor, Type, and Section</p>
            ) : isPricingMissing ? (
              <div>
                <h4 className="text-sm font-bold text-red-600">Pricing Not Configured</h4>
                <p className="text-xs text-red-500/80 mt-1">Pricing is missing for this area. Configure it to continue.</p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-foreground">₹{resolvedPrice}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${getPriceSourceBadgeClass(priceSource)}`}>
                  {getPriceSourceLabel(priceSource)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 items-end">
        <div className="space-y-2">
          <Label className="text-xs">Prefix</Label>
          <Input 
            placeholder="e.g. T" 
            value={form.prefix} 
            onChange={(e) => setForm({...form, prefix: e.target.value})}
            className="h-10 bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Capacity</Label>
          <Input 
            type="number" 
            min="1"
            value={form.capacity} 
            onChange={handleCapacityChange}
            className="h-10 bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Type</Label>
          <Select value={form.type} onValueChange={(val) => setForm({...form, type: val})}>
            <SelectTrigger className="h-10 bg-white">
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
        <div className="space-y-2">
          <Label className="text-xs">Floor</Label>
          <Select value={form.floor} onValueChange={(val) => setForm({...form, floor: val, floorLabel: val !== 'custom' ? FLOOR_OPTIONS.find(o => o.value === val)?.label : ""})}>
            <SelectTrigger className="h-10 bg-white"><SelectValue placeholder="Floor" /></SelectTrigger>
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
              className="h-10 bg-white"
            />
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Section</Label>
          <Select value={form.section} onValueChange={(val) => setForm({...form, section: val, sectionLabel: val !== 'custom' ? SECTION_OPTIONS.find(o => o.value === val)?.label : ""})}>
            <SelectTrigger className="h-10 bg-white"><SelectValue placeholder="Section" /></SelectTrigger>
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
              className="h-10 bg-white"
            />
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Quantity</Label>
          <Input 
            type="number" 
            min="1"
            max="100"
            value={form.quantity} 
            onChange={(e) => setForm({...form, quantity: e.target.value})}
            className="h-10 bg-white"
          />
        </div>
        <Button onClick={handleAdd} className="rounded-xl h-10 w-full sm:col-span-1 col-span-2" disabled={disabled || isPricingMissing}>
          <Plus className="h-4 w-4 mr-2" /> Generate
        </Button>
      </div>
    </div>
  );
}
