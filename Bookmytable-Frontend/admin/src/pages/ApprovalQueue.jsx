import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Store, Briefcase, Eye, Check, X, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getApprovalQueue } from "@/services/moderation.service";
import { format } from "date-fns";
import { BrandDetailsDrawer } from "@/components/brands/BrandDetailsDrawer";
import { RestaurantDetailsDrawer } from "@/components/restaurants/RestaurantDetailsDrawer";
import { approveBrand, rejectBrand } from "@/services/brand.service";
import { approveRestaurant, rejectRestaurant } from "@/services/restaurant.service";
import { toast } from "sonner";

export default function ApprovalQueue() {
  const queryClient = useQueryClient();
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ["approvalQueue"],
    queryFn: getApprovalQueue,
  });

  const approveBrandMut = useMutation({
    mutationFn: approveBrand,
    onSuccess: () => {
      toast.success("Brand approved");
      queryClient.invalidateQueries(["approvalQueue"]);
    },
  });

  const rejectBrandMut = useMutation({
    mutationFn: rejectBrand,
    onSuccess: () => {
      toast.success("Brand rejected");
      queryClient.invalidateQueries(["approvalQueue"]);
    },
  });

  const approveRestaurantMut = useMutation({
    mutationFn: approveRestaurant,
    onSuccess: () => {
      toast.success("Restaurant approved");
      queryClient.invalidateQueries(["approvalQueue"]);
    },
  });

  const rejectRestaurantMut = useMutation({
    mutationFn: rejectRestaurant,
    onSuccess: () => {
      toast.success("Restaurant rejected");
      queryClient.invalidateQueries(["approvalQueue"]);
    },
  });

  const pendingRestaurants = queue.filter(item => item.type === "restaurant").length;
  const pendingBrands = queue.filter(item => item.type === "brand").length;

  const columns = [
    {
      header: "Type",
      accessorKey: "type",
      cell: (row) => (
        <Badge variant="outline" className={`capitalize ${row.type === 'brand' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
          {row.type === 'brand' ? <Briefcase className="w-3 h-3 mr-1" /> : <Store className="w-3 h-3 mr-1" />}
          {row.type}
        </Badge>
      )
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (row) => <span className="font-medium">{row.name}</span>
    },
    {
      header: "Submitted",
      accessorKey: "createdAt",
      cell: (row) => (
        <span className="text-muted-foreground text-sm">
          {format(new Date(row.createdAt), "MMM d, yyyy")}
        </span>
      )
    },
    {
      header: "Context",
      id: "context",
      cell: (row) => {
        const item = row;
        if (item.type === "brand") {
          return <span className="text-sm text-muted-foreground">Owner: {item.owner?.name || "Unknown"}</span>;
        }
        return <span className="text-sm text-muted-foreground">Brand: {item.brand?.name || "Independent"}</span>;
      }
    },
    {
      header: "Actions",
      id: "actions",
      cell: (row) => {
        const item = row;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Moderation Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                if (item.type === "brand") setSelectedBrandId(item.id);
                if (item.type === "restaurant") setSelectedRestaurantId(item.id);
              }}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-emerald-500"
                onClick={() => {
                  if (item.type === "brand") approveBrandMut.mutate(item.id);
                  if (item.type === "restaurant") approveRestaurantMut.mutate(item.id);
                }}
              >
                <Check className="mr-2 h-4 w-4" /> Approve
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-500"
                onClick={() => {
                  if (item.type === "brand") rejectBrandMut.mutate(item.id);
                  if (item.type === "restaurant") rejectRestaurantMut.mutate(item.id);
                }}
              >
                <X className="mr-2 h-4 w-4" /> Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animation-fade-in">
      <PageHeader
        title="Approval Queue"
        description="Review and process pending restaurants and brands across the platform."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Pending</p>
              <h3 className="text-2xl font-bold text-foreground">{queue.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Brands</p>
              <h3 className="text-2xl font-bold text-foreground">{pendingBrands}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Restaurants</p>
              <h3 className="text-2xl font-bold text-foreground">{pendingRestaurants}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden bg-card/50">
        <DataTable
          columns={columns}
          data={queue}
          isLoading={isLoading}
          searchPlaceholder="Search pending items..."
          searchColumn="name"
        />
      </Card>

      <BrandDetailsDrawer
        brandId={selectedBrandId}
        open={!!selectedBrandId}
        onOpenChange={(open) => !open && setSelectedBrandId(null)}
      />

      <RestaurantDetailsDrawer
        restaurantId={selectedRestaurantId}
        open={!!selectedRestaurantId}
        onOpenChange={(open) => !open && setSelectedRestaurantId(null)}
      />
    </div>
  );
}
