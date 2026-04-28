import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users, LayoutDashboard, MousePointer2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Step6TableSetup({ setValue, watch }) {
  const tables = watch("tables") || [];
  const [newTable, setNewTable] = useState({ name: "", capacity: "2", type: "Indoor" });

  const addTable = () => {
    if (!newTable.name) return;
    const updated = [...tables, { ...newTable, id: Date.now() }];
    setValue("tables", updated);
    setNewTable({ name: "", capacity: "2", type: "Indoor" });
  };

  const removeTable = (id) => {
    setValue("tables", tables.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl h-12 p-1 bg-secondary/50">
          <TabsTrigger value="simple" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <LayoutDashboard className="h-4 w-4 mr-2" /> Simple Mode
          </TabsTrigger>
          <TabsTrigger value="advanced" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <MousePointer2 className="h-4 w-4 mr-2" /> Advanced Mode
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="simple" className="mt-8 space-y-8">
          <div className="bg-muted/30 p-6 rounded-3xl border border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Add New Table</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="space-y-2 col-span-1 sm:col-span-1">
                <Label className="text-xs">Table Name/No.</Label>
                <Input 
                  placeholder="e.g. T1" 
                  value={newTable.name} 
                  onChange={(e) => setNewTable({...newTable, name: e.target.value})}
                  className="h-10"
                />
              </div>
              <div className="space-y-2 col-span-1">
                <Label className="text-xs">Capacity</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={newTable.capacity} 
                  onChange={(e) => setNewTable({...newTable, capacity: e.target.value})}
                  className="h-10"
                />
              </div>
              <div className="space-y-2 col-span-1">
                <Label className="text-xs">Type</Label>
                <Select 
                  value={newTable.type} 
                  onValueChange={(val) => setNewTable({...newTable, type: val})}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indoor">Indoor</SelectItem>
                    <SelectItem value="Outdoor">Outdoor</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addTable} className="rounded-xl h-10 w-full">
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-bold">Manage Tables ({tables.length})</Label>
              {tables.length > 0 && (
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Capacity: {tables.reduce((acc, t) => acc + parseInt(t.capacity), 0)} guests</p>
              )}
            </div>
            
            {tables.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl text-muted-foreground">
                <p className="text-sm italic">No tables added yet. Add your first table above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tables.map((table) => (
                  <div key={table.id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card shadow-sm group hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-sm">
                        {table.name}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <Users className="h-3 w-3 text-muted-foreground" />
                           <span className="text-sm font-bold text-foreground">{table.capacity} Seats</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0 h-4 mt-1">
                          {table.type}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeTable(table.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="mt-8">
           <div className="aspect-video rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30 text-center p-8">
              <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
                <MousePointer2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Visual Layout Editor</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Drag and drop your tables to match your restaurant's physical layout. This feature will be available after the initial registration.
              </p>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
