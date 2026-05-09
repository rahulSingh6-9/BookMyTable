import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield, UserPlus } from "lucide-react";

const ROLE_PERMISSIONS = {
  receptionist: ["view_bookings", "check_in_customers"],
  manager: ["view_bookings", "manage_tables", "manage_staff", "edit_permissions"],
  waiter: ["view_bookings"],
};

const AVAILABLE_PERMISSIONS = [
  { id: "view_bookings", label: "View Bookings" },
  { id: "manage_tables", label: "Manage Tables" },
  { id: "check_in_customers", label: "Check-in Customers" },
  { id: "manage_staff", label: "Manage Staff" },
  { id: "edit_permissions", label: "Edit Permissions" },
];

export function InviteStaffModal({ open, onOpenChange, onInvite, isLoading, canEditPermissions }) {
  const [formData, setFormData] = useState({
    email: "",
    role: "",
    permissions: [],
  });

  // Handle role selection - auto-fill permissions
  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
      permissions: ROLE_PERMISSIONS[role] || [],
    }));
  };

  // Handle manual permission toggle
  const togglePermission = (permissionId) => {
    if (!canEditPermissions) return;
    
    setFormData((prev) => {
      const isSelected = prev.permissions.includes(permissionId);
      const newPermissions = isSelected
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId];
      
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.role) return;
    onInvite(formData);
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({ email: "", role: "", permissions: [] });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl overflow-hidden border-none shadow-2xl">
        <DialogHeader className="bg-primary/5 -mx-6 -mt-6 p-8 mb-4 border-b border-primary/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">Invite Team Member</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-sm">
                Add a new staff member to your restaurant team.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@example.com"
                  className="pl-10 rounded-2xl border-border/60 bg-muted/30 focus:bg-background transition-all h-11"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Assigned Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="rounded-2xl border-border/60 bg-muted/30 h-11">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40 shadow-xl">
                  <SelectItem value="receptionist" className="rounded-xl">Receptionist</SelectItem>
                  <SelectItem value="manager" className="rounded-xl">Manager</SelectItem>
                  <SelectItem value="waiter" className="rounded-xl">Waiter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Permissions Checkboxes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Permissions
                </Label>
                {formData.role && (
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0 h-5">
                    {formData.role} Defaults
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-2 p-4 rounded-2xl bg-muted/20 border border-border/40">
                {AVAILABLE_PERMISSIONS.map((permission) => (
                  <div 
                    key={permission.id} 
                    className={`flex items-center space-x-3 p-2 rounded-xl transition-colors ${!canEditPermissions ? 'opacity-50' : 'hover:bg-primary/5 cursor-pointer'}`}
                    onClick={() => togglePermission(permission.id)}
                  >
                    <Checkbox
                      id={permission.id}
                      checked={formData.permissions.includes(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                      disabled={!canEditPermissions}
                      className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor={permission.id}
                      className="text-sm font-medium leading-none cursor-pointer select-none"
                    >
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
              {!canEditPermissions && (
                <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 italic">
                  * You do not have permission to modify staff permissions.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 mt-6 -mx-6 px-6">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="rounded-2xl h-11 px-6 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.email || !formData.role}
              className="rounded-2xl h-11 px-8 font-bold shadow-lg shadow-primary/20"
            >
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
