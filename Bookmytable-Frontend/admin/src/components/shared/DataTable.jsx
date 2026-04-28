import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";

export function DataTable({ columns, data, searchable = true, filterOptions = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredData = data.filter((item) => {
    const matchesSearch = Object.values(item).some(
      (val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesFilter = activeFilter === "all" || item.status?.toLowerCase() === activeFilter.toLowerCase() 
                          || item.role?.toLowerCase() === activeFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden flex flex-col bg-card">
      <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50">
        {searchable && (
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              className="pl-9 bg-background/50 h-9 rounded-full border-border/50"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
        {filterOptions.length > 0 && (
          <div className="w-full sm:w-auto flex shrink-0">
            <Select value={activeFilter} onValueChange={(v) => {
              setActiveFilter(v);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 bg-background/50 rounded-full border-border/50">
                <SlidersHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All</SelectItem>
                {filterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/40">
              {columns.map((col, i) => (
                <TableHead key={i} className="font-semibold text-foreground/80 whitespace-nowrap">{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, i) => (
                <TableRow key={i} className="transition-colors hover:bg-muted/30 border-border/40">
                  {columns.map((col, j) => (
                    <TableCell key={j} className="py-3 px-4">
                      {col.cell ? col.cell(row) : row[col.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Search className="h-8 w-8 text-muted-foreground/50" />
                    <p>No records found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-border/40 flex items-center justify-between bg-card/50 mt-auto">
        <div className="text-sm text-muted-foreground">
          Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8 rounded-full border-border/50 bg-background/50"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8 rounded-full border-border/50 bg-background/50"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
