import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass, Star, EyeOff, Eye, TrendingUp, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDiscoveryRestaurants, featureRestaurant, hideRestaurant } from "@/services/discovery.service";
import { RestaurantDetailsDrawer } from "@/components/restaurants/RestaurantDetailsDrawer";
import { toast } from "sonner";

export default function DiscoveryManagement() {
  const queryClient = useQueryClient();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ["discoveryRestaurants"],
    queryFn: getDiscoveryRestaurants,
  });

  const featureMut = useMutation({
    mutationFn: ({ id, isFeatured }) => featureRestaurant(id, isFeatured, 100), // Default high ranking
    onSuccess: () => {
      toast.success("Feature status updated");
      queryClient.invalidateQueries(["discoveryRestaurants"]);
    },
  });

  const hideMut = useMutation({
    mutationFn: ({ id, isHidden }) => hideRestaurant(id, isHidden),
    onSuccess: () => {
      toast.success("Visibility updated");
      queryClient.invalidateQueries(["discoveryRestaurants"]);
    },
  });

  const featuredCount = restaurants.filter(r => r.isFeatured).length;
  const hiddenCount = restaurants.filter(r => r.isHiddenFromDiscovery).length;

  const columns = [
    {
      header: "Restaurant",
      accessorKey: "branchName",
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
            {row.logo ? (
              <img src={row.logo} alt="" className="w-full h-full object-cover" />
            ) : (row.branchName || row.name || "R")[0]}
          </div>
          <div>
            <span className="font-medium">{row.branchName || row.name}</span>
            {row.brandId?.name && (
              <p className="text-xs text-muted-foreground">{row.brandId.name}</p>
            )}
          </div>
        </div>
      )
    },
    {
      header: "Visibility",
      id: "visibility",
      cell: (row) => {
        if (row.isHiddenFromDiscovery) {
          return <Badge variant="outline" className="text-muted-foreground border-dashed"><EyeOff className="w-3 h-3 mr-1" /> Hidden</Badge>;
        }
        if (row.isFeatured) {
          return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"><Star className="w-3 h-3 mr-1 fill-primary" /> Featured</Badge>;
        }
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><Eye className="w-3 h-3 mr-1" /> Visible</Badge>;
      }
    },
    {
      header: "Rating",
      accessorKey: "averageRating",
      cell: (row) => (
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-medium">{row.averageRating || "N/A"}</span>
          <span className="text-xs text-muted-foreground">({row.totalReviews || 0})</span>
        </div>
      )
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
              <DropdownMenuLabel>Discovery Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSelectedRestaurantId(item._id)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => featureMut.mutate({ id: item._id, isFeatured: !item.isFeatured })}
              >
                <Star className="mr-2 h-4 w-4 text-primary" /> {item.isFeatured ? "Unfeature" : "Feature"} Restaurant
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => hideMut.mutate({ id: item._id, isHidden: !item.isHiddenFromDiscovery })}
                className="text-red-500"
              >
                <EyeOff className="mr-2 h-4 w-4" /> {item.isHiddenFromDiscovery ? "Unhide" : "Hide"} from Discovery
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
        title="Discovery Management"
        description="Manage featured restaurants, local rankings, and platform visibility."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total in Discovery</p>
              <h3 className="text-2xl font-bold text-foreground">{restaurants.length - hiddenCount}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Featured</p>
              <h3 className="text-2xl font-bold text-foreground">{featuredCount}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <EyeOff className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hidden</p>
              <h3 className="text-2xl font-bold text-foreground">{hiddenCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden bg-card/50">
        <DataTable
          columns={columns}
          data={restaurants}
          isLoading={isLoading}
          searchPlaceholder="Search discovery restaurants..."
          searchColumn="branchName"
        />
      </Card>

      <RestaurantDetailsDrawer
        restaurantId={selectedRestaurantId}
        open={!!selectedRestaurantId}
        onOpenChange={(open) => !open && setSelectedRestaurantId(null)}
      />
    </div>
  );
}
