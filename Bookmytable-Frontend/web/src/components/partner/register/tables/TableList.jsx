import { Users, Trash2, Copy, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function TableList({ tables, onUpdate, onRemove, onDuplicate }) {
  const [search, setSearch] = useState("");

  const filteredTables = tables.filter(t => 
    t.tableCode.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h3 className="font-bold text-foreground text-lg">Manage Tables ({tables.length})</h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by code or type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 rounded-full bg-muted/50"
          />
        </div>
      </div>

      {tables.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-3xl bg-muted/20">
          <div className="h-16 w-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h4 className="font-bold text-foreground mb-1">No tables added</h4>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Use the presets or the bulk generator above to quickly add your seating layout.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredTables.map((table) => (
            <div 
              key={table.id} 
              className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-sm border border-primary/20 shrink-0">
                    {table.tableCode}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                      <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{table.capacity} Seats</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0 h-5 border-border bg-muted/50 shrink-0">
                        {table.type?.replace("_dining", "") || table.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {table.price > 0 && (
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                      ₹{table.price}
                    </span>
                  )}
                  <div className="flex items-center gap-0.5">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDuplicate(table)}
                      className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onRemove(table.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium truncate">
                  {table.floorLabel || table.floor || "Ground Floor"} • {table.sectionLabel || table.section || "Couple Zone"}
                </span>
              </div>
            </div>
          ))}
          {filteredTables.length === 0 && tables.length > 0 && (
             <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                No tables match your search.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
