import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal, Check, X, Eye, Edit, Briefcase,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllBrands, approveBrand, suspendBrand } from "@/services/brand.service";
import { toast } from "sonner";
import { BrandDetailsDrawer } from "@/components/brands/BrandDetailsDrawer";

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "Unknown";

const statusVariant = (status) => {
  switch (status) {
    case "approved":  return "default";
    case "pending":   return "secondary";
    case "suspended": return "destructive";
    case "rejected":  return "destructive";
    default:          return "outline";
  }
};

export default function ManageBrands() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-brands", statusFilter],
    queryFn: () => getAllBrands(statusFilter === "all" ? undefined : statusFilter),
  });

  const approveMutation = useMutation({
    mutationFn: approveBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success("Brand approved successfully");
    },
    onError: () => toast.error("Failed to approve brand"),
  });

  const suspendMutation = useMutation({
    mutationFn: suspendBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success("Brand status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const brands =
    data?.data?.data?.map((b) => ({
      id: b.id || b._id,
      name: b.name,
      owner: b.ownerId || "N/A",
      status: b.status || "pending",
      statusLabel: capitalize(b.status || "pending"),
      isVerified: b.isVerified,
      createdAt: b.createdAt
        ? new Date(b.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
          })
        : "—",
    })) || [];

  const columns = [
    {
      header: "Brand Name",
      accessorKey: "name",
      cell: (row) => (
        <div className="font-medium flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary" />
          {row.name}
          {row.isVerified && <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">Verified</Badge>}
        </div>
      ),
    },
    { header: "Owner ID",      accessorKey: "owner" },
    { header: "Created At", accessorKey: "createdAt" },
    {
      header: "Status",
      accessorKey: "statusLabel",
      cell: (row) => (
        <Badge variant={statusVariant(row.status)}>
          {row.statusLabel}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-border/50">
            {row.status === "pending" && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer text-emerald-600 focus:text-emerald-700"
                  onClick={() => approveMutation.mutate(row.id)}
                >
                  <Check className="mr-2 h-4 w-4" /> Approve
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                  <X className="mr-2 h-4 w-4" /> Reject
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => {
                setSelectedBrandId(row.id);
                setDrawerOpen(true);
              }}
            >
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => suspendMutation.mutate(row.id)}
            >
              <X className="mr-2 h-4 w-4" />
              {row.status === "suspended" ? "Lift Suspension" : "Suspend"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animation-fade-in">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Brand Management"
          description="Moderate and manage restaurant brands and ownership."
        />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-destructive p-8 bg-destructive/10 rounded-xl border border-destructive/20">
          <p>Failed to load brands. Please try again later.</p>
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center text-muted-foreground p-12 border border-dashed rounded-xl">
          <Briefcase className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="font-medium">No records found</p>
        </div>
      ) : (
        <DataTable columns={columns} data={brands} />
      )}

      <BrandDetailsDrawer 
        brandId={selectedBrandId} 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen} 
      />
    </div>
  );
}
