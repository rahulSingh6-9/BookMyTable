import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Archive, RefreshCcw, Store, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getArchivedBrands, restoreBrand } from "@/services/brand.service";
import { Loader } from "@/components/common/Loader";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function ArchivedBrands() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [restoringId, setRestoringId] = useState(null);

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["archived-brands"],
    queryFn: getArchivedBrands,
  });

  const brands = response?.data?.brands || [];

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestore = async (brandId) => {
    if(!confirm("Are you sure you want to restore this brand and all its branches?")) return;
    
    setRestoringId(brandId);
    try {
      await restoreBrand(brandId);
      toast({ title: "Brand Restored", description: "Brand and branches have been restored successfully." });
      refetch();
    } catch (error) {
      toast({ variant: "destructive", title: "Restore Failed", description: error.response?.data?.message || "Failed to restore brand." });
    } finally {
      setRestoringId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full pb-16 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Archive className="h-8 w-8 text-primary" />
            Archived Brands
          </h1>
          <p className="text-muted-foreground mt-1">View and restore soft-deleted brands in your portfolio.</p>
        </div>
      </motion.div>

      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search archived brands..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Archived Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Archive className="h-10 w-10 text-muted-foreground/30" />
                    <p>No archived brands found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBrands.map((brand) => (
                <TableRow key={brand._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="h-10 w-10 rounded-md object-cover border" />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center border">
                          <Store className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{brand.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">@{brand.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {brand.deletedAt ? (
                      <div className="text-sm">
                        <p>{format(new Date(brand.deletedAt), 'MMM dd, yyyy')}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(brand.deletedAt), 'hh:mm a')}</p>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      Archived
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={restoringId === brand._id}
                      onClick={() => handleRestore(brand._id)}
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <RefreshCcw className={`mr-2 h-4 w-4 ${restoringId === brand._id ? 'animate-spin' : ''}`} />
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
