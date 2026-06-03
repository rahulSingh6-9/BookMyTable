import React, { useState, useEffect } from "react";
import { Mail, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { invitationService } from "@/services/invitation.service";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const CreateAdminInvitationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    role: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rbacConfig, setRbacConfig] = useState(null);

  useEffect(() => {
    if (isOpen && !rbacConfig) {
      invitationService.getRBACConfig().then((res) => {
        setRbacConfig(res.data);
      }).catch((err) => {
        toast.error("Failed to load roles from server");
      });
    }
  }, [isOpen, rbacConfig]);

  const formatRole = (role) => {
    if (!role) return "";
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const handleRoleChange = (role) => {
    setTimeout(() => {
      setFormData(prev => ({ ...prev, role }));
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.role) return;
    
    setLoading(true);
    setError(null);
    try {
      await invitationService.createInvitation(formData);
      toast.success("Invitation sent successfully!");
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl overflow-hidden border-none shadow-2xl">
        <DialogHeader className="bg-primary/5 -mx-6 -mt-6 p-6 mb-2 border-b border-primary/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">Invite Administrator</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1 text-sm">
                Send an invitation to join the platform admin team.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
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
              {rbacConfig ? (
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="rounded-2xl border-border/60 bg-muted/30 h-11">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40 shadow-xl">
                    {Object.values(rbacConfig.roles).map((roleStr) => (
                      <SelectItem key={roleStr} value={roleStr} className="rounded-xl">
                        {formatRole(roleStr)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="animate-pulse h-11 bg-muted/50 rounded-2xl w-full"></div>
              )}
            </div>

            {/* Permissions Preview */}
            {rbacConfig && formData.role && rbacConfig.rolePermissions[formData.role] && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Permissions
                  </Label>
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0 h-5">
                    {formatRole(formData.role)}
                  </Badge>
                </div>
                
                <ScrollArea className="h-[100px] rounded-2xl border border-border/40 bg-muted/20 p-3">
                  <div className="flex flex-wrap gap-2">
                    {rbacConfig.rolePermissions[formData.role].map((perm) => (
                      <span 
                        key={perm} 
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-background text-foreground border border-border/60 shadow-sm"
                      >
                        <CheckCircle className="w-3 h-3 mr-1.5 text-primary" />
                        {perm}
                      </span>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Notes Field */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-bold uppercase text-muted-foreground ml-1">Internal Notes (Optional)</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-border/60 rounded-2xl bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all resize-none"
                placeholder="Why are they being invited?"
                rows="2"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 mt-4 -mx-6 px-6">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-2xl h-11 px-6 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.email || !formData.role}
              className="rounded-2xl h-11 px-8 font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : null}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAdminInvitationModal;
