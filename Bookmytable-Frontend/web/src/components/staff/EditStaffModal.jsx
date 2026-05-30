import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldAlert, UserCog } from "lucide-react";
import { toast } from "sonner";

const AVAILABLE_PERMISSIONS = [
  { id: "MANAGE_STAFF", label: "Manage Staff", description: "Can invite and edit staff members" },
  { id: "VIEW_STAFF", label: "View Staff", description: "Can view staff members" },
  { id: "MANAGE_MENU", label: "Manage Menu", description: "Can update categories and items" },
  { id: "VIEW_MENU", label: "View Menu", description: "Can view menu" },
  { id: "MANAGE_TABLES", label: "Manage Tables", description: "Can update table layouts" },
  { id: "VIEW_TABLES", label: "View Tables", description: "Can view tables" },
  { id: "VIEW_ASSIGNED_TABLES", label: "View Assigned Tables", description: "Can view assigned tables" },
  { id: "MANAGE_BOOKINGS", label: "Manage Bookings", description: "Can configure bookings" },
  { id: "MANAGE_RESERVATIONS", label: "Manage Reservations", description: "Can confirm/cancel reservations" },
  { id: "CREATE_BOOKING", label: "Create Booking", description: "Can create new bookings" },
  { id: "VIEW_BOOKINGS", label: "View Bookings", description: "Can view bookings" },
  { id: "VIEW_ANALYTICS", label: "View Analytics", description: "Can view revenue and stats" },
  { id: "VIEW_REPORTS", label: "View Reports", description: "Can view reports" },
  { id: "VIEW_KITCHEN_ORDERS", label: "View Kitchen Orders", description: "Can view kitchen orders" },
  { id: "UPDATE_ORDER_STATUS", label: "Update Order Status", description: "Can update order status" },
  { id: "VIEW_BASIC_INFO", label: "View Basic Info", description: "Can view basic branch info" },
];

export function EditStaffModal({ open, onOpenChange, staff, onUpdate, isLoading }) {
  const [role, setRole] = useState(staff?.role || "waiter");
  const [selectedPermissions, setSelectedPermissions] = useState(staff?.permissions || []);
  const [status, setStatus] = useState(staff?.status || "active");

  const togglePermission = (permId) => {
    // Delay state update to avoid Radix UI Presence conflicts
    setTimeout(() => {
      setSelectedPermissions(prev => 
        prev.includes(permId) 
          ? prev.filter(p => p !== permId) 
          : [...prev, permId]
      );
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(staff._id, { role, permissions: selectedPermissions, status });
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl overflow-hidden border-border/40">
        <DialogHeader className="space-y-3 pb-4 border-b border-border/40">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold">Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update role, permissions, or account status for <b>{staff.email}</b>.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role" className="text-sm font-semibold">System Role</Label>
                <Select value={role} onValueChange={(val) => setTimeout(() => setRole(val), 0)}>
                  <SelectTrigger id="edit-role" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="assistant_manager">Assistant Manager</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="host">Host</SelectItem>
                    <SelectItem value="waiter">Waiter</SelectItem>
                    <SelectItem value="chef">Chef</SelectItem>
                    <SelectItem value="kitchen_staff">Kitchen Staff</SelectItem>
                    <SelectItem value="support_staff">Support Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-sm font-semibold">Account Status</Label>
                <Select value={status} onValueChange={(val) => setTimeout(() => setStatus(val), 0)}>
                  <SelectTrigger id="edit-status" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" />
                <Label className="text-sm font-semibold text-foreground">Update Permissions</Label>
              </div>
              
              <ScrollArea className="h-[200px] rounded-xl border border-border/50 bg-muted/20 p-4">
                <div className="grid gap-4">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <div key={perm.id} className="flex items-start space-x-3 space-y-0">
                      <Checkbox
                        id={`edit-${perm.id}`}
                        checked={selectedPermissions.includes(perm.id)}
                        onCheckedChange={() => togglePermission(perm.id)}
                        className="mt-1"
                      />
                      <div className="grid gap-1 leading-none">
                        <label
                          htmlFor={`edit-${perm.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {perm.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {perm.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40">
            <div className="flex gap-2 w-full sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-xl shadow-lg px-8 bg-blue-600 hover:bg-blue-700">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
