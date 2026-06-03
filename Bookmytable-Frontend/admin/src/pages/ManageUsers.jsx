import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShieldOff, Eye, Users, ShieldCheck, Briefcase, UserX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/services/user.service";
import { UserDetailsDrawer } from "@/components/users/UserDetailsDrawer";
import { StatCard } from "@/components/shared/StatCard";
import { motion } from "framer-motion";

export default function ManageUsers() {

  // 🔥 Fetch users
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAllUsers,
  });

  console.log("API DATA (React Query result):", data);
  // Temporary debug to confirm response nesting matches expectations
  console.log("API DATA.data:", data?.data);
  console.log("API DATA.data.data (array?):", data?.data?.data);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 🔥 Format backend data → table format
  // React Query `data` here can be one of:
  // 1) Full Axios response: { data: { success, data: [...] } }
  // 2) Unwrapped payload:   { success, data: [...] }
  // 3) Direct array:        [ ...users ]
  // 4) Nested users key:    { success, users: [...] } or { data: { users: [...] } }
  let usersArray = [];

  if (Array.isArray(data)) {
    usersArray = data;
  } else if (Array.isArray(data?.data?.data)) {
    usersArray = data.data.data;
  } else if (Array.isArray(data?.data?.users)) {
    usersArray = data.data.users;
  } else if (Array.isArray(data?.data)) {
    usersArray = data.data;
  } else if (Array.isArray(data?.users)) {
    usersArray = data.users;
  } else if (Array.isArray(data?.data?.results)) {
    usersArray = data.data.results;
  }

  console.log("Derived usersArray (final):", usersArray);
  console.log("usersArray length:", usersArray?.length ?? 0);

  const users = usersArray.map((user) => ({
    id: user._id,
    name: user.name ?? user.email,
    email: user.email,
    role: user.roles?.join(", ") ?? user.role ?? "user",
    status: user.isBlocked ? "Blocked" : "Active",
    isVerified: user.emailVerified || user.phoneVerified || false,
    ownedCount: user.ownedRestaurants?.length || 0,
    staffCount: user.staffAffiliations?.length || 0,
    totalMemberships: user.totalMemberships || 0,
    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "",
  }));

  // 🔥 Columns
  const columns = [
    {
      header: "User",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium flex items-center gap-2">
            {row.name}
            {row.isVerified && <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">Verified</Badge>}
          </span>
          <span className="text-xs text-muted-foreground">{row.email}</span>
        </div>
      ),
    },
    { 
      header: "Role", 
      accessorKey: "role",
      cell: (row) => <Badge variant="outline" className="capitalize text-[10px]">{row.role || 'User'}</Badge>
    },
    { 
      header: "Owned", 
      accessorKey: "ownedCount",
      cell: (row) => <div className="text-center">{row.ownedCount}</div>
    },
    { 
      header: "Staff In", 
      accessorKey: "staffCount",
      cell: (row) => <div className="text-center">{row.staffCount}</div>
    },
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
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => {
                setSelectedUserId(row.id);
                setDrawerOpen(true);
              }}
            >
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

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard title="Total Users" value={users.length} trend="up" trendValue={12} icon={Users} />
        <StatCard title="Verified Users" value={users.filter(u => u.isVerified).length} icon={ShieldCheck} />
        <StatCard title="Business Owners" value={users.filter(u => u.ownedCount > 0).length} icon={Briefcase} />
        <StatCard title="Blocked Users" value={users.filter(u => u.status === 'Blocked').length} icon={UserX} />
      </motion.div>

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

      <UserDetailsDrawer 
        userId={selectedUserId} 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen} 
      />
    </div>
  );
}