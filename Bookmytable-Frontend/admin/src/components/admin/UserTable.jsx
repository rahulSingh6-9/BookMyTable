import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

const mockUsers = [
  { id: "U001", name: "Alice Johnson", email: "alice@email.com", role: "customer", status: "active", joined: "2026-01-15" },
  { id: "U002", name: "Bob Smith", email: "bob@email.com", role: "customer", status: "active", joined: "2026-02-03" },
  { id: "U003", name: "Chef Tanaka", email: "tanaka@sakura.com", role: "owner", status: "active", joined: "2025-11-20" },
  { id: "U004", name: "David Lee", email: "david@email.com", role: "customer", status: "suspended", joined: "2026-01-28" },
  { id: "U005", name: "Maria Garcia", email: "maria@bella.com", role: "owner", status: "pending", joined: "2026-03-10" },
];

export function UserTable({ users = mockUsers }) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell><Badge variant="secondary" className="text-xs">{u.role}</Badge></TableCell>
              <TableCell>
                <Badge variant="outline" className={`text-xs ${u.status === "active" ? "text-accent border-accent/20" : u.status === "suspended" ? "text-destructive border-destructive/20" : "text-primary border-primary/20"}`}>
                  {u.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{u.joined}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
