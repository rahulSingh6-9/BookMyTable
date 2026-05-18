import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, MousePointer2 } from "lucide-react";
import { TableSummaryPanel } from "./tables/TableSummaryPanel";
import { TablePresets } from "./tables/TablePresets";
import { BulkAddForm } from "./tables/BulkAddForm";
import { TableList } from "./tables/TableList";
import { toast } from "sonner";

export function Step6TableSetup({ setValue, watch }) {
  const tables = watch("tables") || [];
  
  const existingCodes = new Set(tables.map(t => t.tableCode));

  const handleBulkAdd = (newTables) => {
    setValue("tables", [...tables, ...newTables], { shouldValidate: true, shouldDirty: true });
  };

  const handleApplyPreset = (presetTables) => {
    // Generate new unique ids and resolve code conflicts
    const updated = [...tables];
    let added = 0;
    
    presetTables.forEach(pt => {
      let code = pt.tableCode;
      let counter = 1;
      // Auto-resolve conflicts
      while (existingCodes.has(code) || updated.find(t => t.tableCode === code)) {
        code = `${pt.tableCode}-${counter}`;
        counter++;
      }
      updated.push({ ...pt, tableCode: code, id: Math.random().toString(36).substring(7) });
      added++;
    });

    setValue("tables", updated, { shouldValidate: true, shouldDirty: true });
    toast.success(`Applied preset: ${added} tables added`);
  };

  const removeTable = (id) => {
    setValue("tables", tables.filter(t => t.id !== id), { shouldValidate: true, shouldDirty: true });
  };

  const duplicateTable = (table) => {
    let baseCode = table.tableCode.replace(/-\d+$/, ""); // remove existing suffix
    let code = `${baseCode}-copy`;
    let counter = 1;
    while (existingCodes.has(code) || tables.find(t => t.tableCode === code)) {
      code = `${baseCode}-copy${counter}`;
      counter++;
    }
    
    const newTable = { ...table, id: Math.random().toString(36).substring(7), tableCode: code };
    setValue("tables", [...tables, newTable], { shouldValidate: true, shouldDirty: true });
    toast.success(`Duplicated table to ${code}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-6">
        
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
          <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
            Configure Your Seating Layout
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Set up tables and seating capacity for reservations and operations. This is critical for our smart reservation engine to maximize your occupancy.
          </p>
        </div>

        <Tabs defaultValue="simple" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl h-12 p-1 bg-secondary/50">
            <TabsTrigger value="simple" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <LayoutDashboard className="h-4 w-4 mr-2" /> List Mode
            </TabsTrigger>
            <TabsTrigger value="advanced" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <MousePointer2 className="h-4 w-4 mr-2" /> Advanced (Zones)
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="simple" className="mt-6 space-y-8">
            <div>
              <h4 className="text-sm font-bold text-foreground mb-4">Quick Presets</h4>
              <TablePresets onApply={handleApplyPreset} />
            </div>

            <BulkAddForm onAdd={handleBulkAdd} existingCodes={existingCodes} />

            <TableList 
              tables={tables} 
              onRemove={removeTable} 
              onDuplicate={duplicateTable} 
            />
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-8">
             <div className="aspect-[4/3] rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30 text-center p-8">
                <div className="h-20 w-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 border border-primary/20">
                  <MousePointer2 className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Visual Floorplan Editor</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
                  Draw zones, add multiple floors, and drag-and-drop tables visually to match your exact physical restaurant layout.
                </p>
                <div className="bg-primary/5 border border-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold">
                  Coming soon in Dashboard
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:col-span-2 hidden lg:block">
        <TableSummaryPanel tables={tables} />
      </div>
    </div>
  );
}
