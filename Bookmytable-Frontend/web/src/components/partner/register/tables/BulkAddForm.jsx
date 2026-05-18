import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function BulkAddForm({ onAdd, existingCodes }) {
  const [form, setForm] = useState({ prefix: "T", capacity: "2", quantity: "1", type: "indoor" });

  const handleAdd = () => {
    const qty = parseInt(form.quantity);
    const cap = parseInt(form.capacity);
    
    if (qty < 1 || qty > 50) return toast.error("Quantity must be between 1 and 50");
    if (cap < 1 || cap > 50) return toast.error("Capacity must be between 1 and 50");
    if (!form.prefix) return toast.error("Prefix is required");

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
          type: form.type
        });
        addedCount++;
      }
      nextNum++;
    }

    onAdd(newTables);
    toast.success(`Generated ${qty} table(s) successfully`);
    setForm({ prefix: "T", capacity: "2", quantity: "1", type: "indoor" });
  };

  return (
    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 mb-8">
      <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-6">Bulk Generate Tables</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-end">
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
          <Label className="text-xs">Quantity</Label>
          <Input 
            type="number" 
            min="1"
            max="50"
            value={form.quantity} 
            onChange={(e) => setForm({...form, quantity: e.target.value})}
            className="h-10 bg-white"
          />
        </div>
        <Button onClick={handleAdd} className="rounded-xl h-10 w-full sm:col-span-1 col-span-2">
          <Plus className="h-4 w-4 mr-2" /> Generate
        </Button>
      </div>
    </div>
  );
}
