import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShieldOff, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/services/user.service";

export default function ManageUsers() {

  // 🔥 Fetch users
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAllUsers,
  });

  // 🔥 Format backend data → table format
  const users =
    data?.data?.data?.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.roles?.join(", "),
      status: user.isBlocked ? "Blocked" : "Active",
      createdAt: new Date(user.createdAt).toLocaleDateString(),
    })) || [];

  // 🔥 Columns
  const columns = [
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "Role", accessorKey: "role" },
    { header: "Created At", accessorKey: "createdAt" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <Badge variant={row.status === "Active" ? "default" : "destructive"}>
          {row.status}
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
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive">
              <ShieldOff className="mr-2 h-4 w-4" />
              {row.status === "Blocked" ? "Unblock" : "Block"} User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // 🔥 Loading State
  if (isLoading) {
    return <div className="text-center py-10">Loading users...</div>;
  }

  // 🔥 Error State
  if (error) {
    return <div className="text-center py-10 text-red-500">Failed to load users</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animation-fade-in">
      <PageHeader
        title="Users Management"
        description="View and manage platform users, their roles, and status."
      />

      <DataTable
        columns={columns}
        data={users}
        filterOptions={[
          { label: "Active", value: "Active" },
          { label: "Blocked", value: "Blocked" },
          { label: "Admin", value: "admin" },
          { label: "Restaurant Owner", value: "owner" },
        ]}
      />
    </div>
  );
}