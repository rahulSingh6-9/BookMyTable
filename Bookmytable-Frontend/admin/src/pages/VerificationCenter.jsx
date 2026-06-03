import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, Mail, Phone, Store, User as UserIcon, Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getVerifications } from "@/services/moderation.service";
import { UserDetailsDrawer } from "@/components/users/UserDetailsDrawer";
import { RestaurantDetailsDrawer } from "@/components/restaurants/RestaurantDetailsDrawer";

export default function VerificationCenter() {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const { data: verifications = [], isLoading } = useQuery({
    queryKey: ["verifications"],
    queryFn: getVerifications,
  });

  const verifiedUsers = verifications.filter(v => v.type === "user" && v.emailVerified).length;
  const unverifiedRestaurants = verifications.filter(v => v.type === "restaurant" && !v.emailVerified && !v.phoneVerified).length;

  const columns = [
    {
      header: "Entity",
      accessorKey: "type",
      cell: (row) => (
        <Badge variant="outline" className="capitalize bg-secondary/50">
          {row.type === 'user' ? <UserIcon className="w-3 h-3 mr-1" /> : <Store className="w-3 h-3 mr-1" />}
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
      header: "Email Auth",
      accessorKey: "emailVerified",
      cell: (row) => (
        row.emailVerified ? 
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"><Mail className="w-3 h-3 mr-1" /> Verified</Badge> : 
        <Badge variant="outline" className="text-muted-foreground border-dashed"><Mail className="w-3 h-3 mr-1" /> Unverified</Badge>
      )
    },
    {
      header: "Phone Auth",
      accessorKey: "phoneVerified",
      cell: (row) => (
        row.phoneVerified ? 
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"><Phone className="w-3 h-3 mr-1" /> Verified</Badge> : 
        <Badge variant="outline" className="text-muted-foreground border-dashed"><Phone className="w-3 h-3 mr-1" /> Unverified</Badge>
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
              <DropdownMenuLabel>Verification Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                if (item.type === "user") setSelectedUserId(item.id);
                if (item.type === "restaurant") setSelectedRestaurantId(item.id);
              }}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" /> Force Verify
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" /> Resend Code
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
        title="Verification Center"
        description="Process and monitor identity, email, and phone verifications across the platform."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Verified Users</p>
              <h3 className="text-2xl font-bold text-foreground">{verifiedUsers}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unverified Restaurants</p>
              <h3 className="text-2xl font-bold text-foreground">{unverifiedRestaurants}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden bg-card/50">
        <DataTable
          columns={columns}
          data={verifications}
          isLoading={isLoading}
          searchPlaceholder="Search entities..."
          searchColumn="name"
        />
      </Card>

      <UserDetailsDrawer
        userId={selectedUserId}
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
      />

      <RestaurantDetailsDrawer
        restaurantId={selectedRestaurantId}
        open={!!selectedRestaurantId}
        onOpenChange={(open) => !open && setSelectedRestaurantId(null)}
      />
    </div>
  );
}
