import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const mockRestaurants = [
  { id: "R001", name: "Sakura Omakase", owner: "Chef Tanaka", cuisine: "Japanese", status: "approved", rating: 4.8 },
  { id: "R002", name: "Trattoria Bella", owner: "Maria Garcia", cuisine: "Italian", status: "approved", rating: 4.6 },
  { id: "R003", name: "Spice Route", owner: "Raj Patel", cuisine: "Indian", status: "pending", rating: null },
  { id: "R004", name: "El Fuego", owner: "Carlos Diaz", cuisine: "Mexican", status: "pending", rating: null },
  { id: "R005", name: "The Capital Grill", owner: "James Wilson", cuisine: "Steakhouse", status: "approved", rating: 4.7 },
];

export function RestaurantTable({ restaurants = mockRestaurants }) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Restaurant</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Cuisine</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {restaurants.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell className="text-muted-foreground">{r.owner}</TableCell>
              <TableCell>{r.cuisine}</TableCell>
              <TableCell>{r.rating ? r.rating : "—"}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`text-xs ${r.status === "approved" ? "text-accent border-accent/20" : "text-primary border-primary/20"}`}>
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell>
                {r.status === "pending" ? (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-accent"><Check className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
