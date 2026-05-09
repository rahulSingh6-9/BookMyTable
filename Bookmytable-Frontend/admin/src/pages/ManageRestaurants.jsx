import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal, Check, X, Eye, Edit, Store as StoreIcon,
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
import { getAllRestaurants, approveRestaurant, suspendRestaurant } from "@/services/restaurant.service";
import { toast } from "sonner";

// ── helpers ─────────────────────────────────────────────────────────────────
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

// ── Component ────────────────────────────────────────────────────────────────
export default function ManageRestaurants() {
  const queryClient = useQueryClient();

  // Drives both the dropdown UI and the API query param
  const [statusFilter, setStatusFilter] = useState("all");

  // 🔥 Fetch restaurants — re-fetches whenever statusFilter changes
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-restaurants", statusFilter],
    queryFn: () => getAllRestaurants(statusFilter === "all" ? undefined : statusFilter),
  });

  // 🔥 Mutations
  const approveMutation = useMutation({
    mutationFn: approveRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      toast.success("Restaurant approved successfully");
    },
    onError: () => toast.error("Failed to approve restaurant"),
  });

  const suspendMutation = useMutation({
    mutationFn: suspendRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      toast.success("Restaurant suspended successfully");
    },
    onError: () => toast.error("Failed to update status"),
  });

  // 🔥 Map backend DTO → table rows
  // Backend now returns: { id, name, owner: { id, name, email }, status, city, createdAt }
  // Axios wraps: response.data → { success, count, data: [...] }
  const restaurants =
    data?.data?.data?.map((r) => ({
      id: r.id || r._id,
      name: r.name,
      owner: r.owner?.name || "N/A",
      city: r.city || "—",
      status: r.status || "pending",           // lowercase — matches DB enum
      statusLabel: capitalize(r.status || "pending"),
      createdAt: r.createdAt
        ? new Date(r.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
          })
        : "—",
    })) || [];

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = [
    {
      header: "Restaurant Name",
      accessorKey: "name",
      cell: (row) => (
        <div className="font-medium flex items-center gap-2">
          <StoreIcon className="w-4 h-4 text-muted-foreground" />
          {row.name}
        </div>
      ),
    },
    { header: "Owner",      accessorKey: "owner" },
    { header: "City",       accessorKey: "city" },
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
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </DropdownMenuItem>
            {row.status !== "pending" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => suspendMutation.mutate(row.id)}
                >
                  <X className="mr-2 h-4 w-4" />
                  {row.status === "suspended" ? "Lift Suspension" : "Suspend"}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-7xl mx-auto animation-fade-in">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Restaurants Management"
          description="Review, approve, and manage restaurant listings."
        />

        {/* Server-side status filter dropdown */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Restaurants</SelectItem>
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
          <p>Failed to load restaurants. Please try again later.</p>
          <p className="text-xs mt-1 text-muted-foreground">{error.message}</p>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center text-muted-foreground p-12 border border-dashed rounded-xl">
          <StoreIcon className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="font-medium">No records found</p>
          <p className="text-sm mt-1">
            {statusFilter === "all"
              ? "No restaurants have been registered yet."
              : `No restaurants with status "${capitalize(statusFilter)}".`}
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={restaurants} />
      )}
    </div>
  );
}
