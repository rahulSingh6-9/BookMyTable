import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { FLOOR_OPTIONS, SECTION_OPTIONS } from "@/lib/tableConstants";

export function BulkAddForm({ onAdd, onGenerate, existingCodes, disabled }) {
  const [form, setForm] = useState({ prefix: "T", capacity: "2", quantity: "1", type: "indoor", floor: "", floorLabel: "", section: "", sectionLabel: "" });

  const handleAdd = () => {
    const qty = parseInt(form.quantity);
    const cap = parseInt(form.capacity);
    
    if (qty < 1 || qty > 100) return toast.error("Quantity must be between 1 and 100");
    if (cap < 1 || cap > 100) return toast.error("Capacity must be between 1 and 100");
    if (!form.prefix) return toast.error("Prefix is required");
    if (!form.floor.trim()) return toast.error("Floor is required");
    if (!form.section.trim()) return toast.error("Section is required");

    // If onGenerate is provided, pass the raw form straight to the parent (Backend Flow)
    if (onGenerate) {
      onGenerate(form);
      setForm({ prefix: "T", capacity: "2", quantity: "1", type: "indoor", floor: "", floorLabel: "", section: "", sectionLabel: "" });
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
    setForm({ prefix: "T", capacity: "2", quantity: "1", type: "indoor", floor: "", floorLabel: "", section: "", sectionLabel: "" });
  };

  return (
    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 mb-8">
      <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-6">Bulk Generate Tables</h3>
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
            onChange={(e) => setForm({...form, capacity: e.target.value})}
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
              <SelectItem value="indoor">Indoor</SelectItem>
              <SelectItem value="outdoor">Outdoor</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="rooftop">Rooftop</SelectItem>
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
        <Button onClick={handleAdd} className="rounded-xl h-10 w-full sm:col-span-1 col-span-2" disabled={disabled}>
          <Plus className="h-4 w-4 mr-2" /> Generate
        </Button>
      </div>
    </div>
  );
}
