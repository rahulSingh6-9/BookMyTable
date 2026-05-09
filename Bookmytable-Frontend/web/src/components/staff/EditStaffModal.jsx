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
  { id: "manage_staff", label: "Manage Staff", description: "Can invite and edit staff members" },
  { id: "manage_menu", label: "Manage Menu", description: "Can update categories and items" },
  { id: "manage_tables", label: "Manage Tables", description: "Can update table layouts" },
  { id: "view_analytics", label: "View Analytics", description: "Can view revenue and stats" },
  { id: "manage_bookings", label: "Manage Bookings", description: "Can confirm/cancel reservations" },
  { id: "edit_permissions", label: "Edit Permissions", description: "Can change role permissions" },
];

export function EditStaffModal({ open, onOpenChange, staff, onUpdate, isLoading }) {
  const [role, setRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (staff) {
      setRole(staff.role || "waiter");
      setSelectedPermissions(staff.permissions || []);
      setStatus(staff.status || "active");
    }
  }, [staff]);

  const togglePermission = (permId) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(p => p !== permId) 
        : [...prev, permId]
    );
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
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="edit-role" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="waiter">Waiter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-sm font-semibold">Account Status</Label>
                <Select value={status} onValueChange={setStatus}>
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
