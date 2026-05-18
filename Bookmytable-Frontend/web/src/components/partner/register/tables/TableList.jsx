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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredTables.map((table) => (
            <div key={table.id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card shadow-sm group hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-sm border border-primary/20 shrink-0">
                  {table.tableCode}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                     <Users className="h-3 w-3 text-muted-foreground" />
                     <span className="text-sm font-bold text-foreground">{table.capacity} Seats</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0 h-5 mt-1 border-border bg-muted/50">
                    {table.type}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDuplicate(table)}
                  className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  title="Duplicate"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onRemove(table.id)}
                  className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Remove"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
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
