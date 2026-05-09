import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Search, Filter, ShieldCheck, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useStaff, usePendingInvites, useInviteStaff, useUpdateStaff, useDeleteStaff } from "@/hooks/useStaff";
import { StaffTable } from "@/components/staff/StaffTable";
import { PendingInvites } from "@/components/staff/PendingInvites";
import { InviteStaffModal } from "@/components/staff/InviteStaffModal";
import { EditStaffModal } from "@/components/staff/EditStaffModal";
import { Loader } from "@/components/common/Loader";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useMyRestaurant } from "@/hooks/useRestaurantSettings";


export default function StaffListPage() {
  const { user } = useAuth();
  const { data: restaurant, isLoading: isLoadingRestaurant } = useMyRestaurant();
  const restaurantId = restaurant?._id;
  
  // RBAC checks for Frontend safety
  // Robust check: either role is owner or manage_staff is in permissions
 const canManageStaff = useMemo(() => {
  const roles = user?.roles || [];
  const permissions = user?.permissions || [];

  return (
    roles.includes("owner") ||
    roles.includes("admin") ||
    permissions.includes("manage_staff")
  );
}, [user]);

  const canEditPermissions = useMemo(() => {
    const roles = user?.roles || [];
    const permissions = user?.permissions || [];
    
    return (
      roles.includes("owner") || 
      roles.includes("admin") || 
      permissions.includes("edit_permissions")
    );
  }, [user]);

  const [searchTerm, setSearchTerm] = useState("");
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const { data: staffList = [], isLoading: isLoadingStaff, isError, error } = useStaff(restaurantId);
  const { data: pendingInvites = [], isLoading: isLoadingPending } = usePendingInvites(restaurantId);
  
  const { mutate: inviteMutation, isPending: isInviting } = useInviteStaff(restaurantId);
  const { mutate: updateMutation, isPending: isUpdating } = useUpdateStaff(restaurantId);
  const { mutate: deleteMutation } = useDeleteStaff(restaurantId);

  const filteredStaff = useMemo(() => {
    return (staffList || []).filter(s => 
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staffList, searchTerm]);

  const handleInvite = (inviteData) => {
    inviteMutation(inviteData, {
      onSuccess: () => {
        setOpenInviteModal(false);
      }
    });
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setEditModalOpen(true);
  };

  const handleUpdate = (staffId, updateData) => {
    updateMutation({ staffId, data: updateData }, {
      onSuccess: () => {
        setEditModalOpen(false);
        setSelectedStaff(null);
      }
    });
  };

  const handleDelete = (staff) => {
    if (window.confirm(`Are you sure you want to deactivate ${staff.name || staff.email}?`)) {
      deleteMutation(staff._id);
    }
  };

  if (isLoadingStaff || isLoadingPending || isLoadingRestaurant) return <div className="h-[60vh] flex items-center justify-center"><Loader /></div>;
  if (isError) return <ErrorMessage message={error?.message} />;

  return (
    <div className="w-full min-h-screen bg-background/50">
      <div className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Page Header - Fixed Layout [Title] [Invite Button] [Search] */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-3xl border border-border/40 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Staff Management</h1>
                <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Real-time role & permission management
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 ml-auto">
              {/* RBAC CONDITION: Show button only if user has manage_staff */}
              {canManageStaff && (
                <Button 
                  onClick={() => setOpenInviteModal(true)}
                  className="gap-2 rounded-2xl shadow-lg shadow-primary/20 px-6 h-11 font-bold whitespace-nowrap"
                  id="invite-staff-button"
                >
                  <Plus className="h-4 w-4" /> 
                  Invite Staff
                </Button>
              )}

              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  placeholder="Search staff..." 
                  className="pl-10 pr-4 py-2 w-full md:w-[260px] rounded-2xl border border-border/60 bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all h-11 text-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Active Team Table Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                Active Team
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {filteredStaff.length} Members
                </span>
              </h2>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground font-medium">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>

            {filteredStaff.length === 0 ? (
              <div className="bg-card rounded-3xl border border-dashed border-border/60 p-12 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto text-muted-foreground/30">
                  <Users className="w-8 h-8" />
                </div>
                <div className="max-w-xs mx-auto space-y-2">
                  <h3 className="text-lg font-bold text-foreground">No team members yet</h3>
                  <p className="text-sm text-muted-foreground">Invite your first staff member to start managing operations</p>
                </div>
                {/* EMPTY STATE CTA FIX */}
                {canManageStaff && (
                  <Button 
                    onClick={() => setOpenInviteModal(true)}
                    className="gap-2 rounded-2xl font-bold px-8 h-11"
                  >
                    <Plus className="h-4 w-4" />
                    Invite First Staff Member
                  </Button>
                )}
              </div>
            ) : (
              <StaffTable 
                staff={filteredStaff} 
                onEdit={handleEdit}
                onDeactivate={handleDelete}
                canManageStaff={canManageStaff}
                canEditPermissions={canEditPermissions}
              />
            )}
          </div>

          {/* Pending Invites Section */}
          <PendingInvites invites={pendingInvites} />
          
          {/* Info Card */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex gap-4 items-start shadow-sm">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-primary">Email Notifications</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Invitations are sent via our automated system. Staff will appear in the pending list until they accept the invitation and set up their password.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* InviteStaffModal Integration */}
      <InviteStaffModal 
        open={openInviteModal} 
        onOpenChange={setOpenInviteModal}
        onInvite={handleInvite}
        isLoading={isInviting}
        canEditPermissions={canEditPermissions}
      />

      <EditStaffModal 
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        staff={selectedStaff}
        onUpdate={handleUpdate}
        isLoading={isUpdating}
        canEditPermissions={canEditPermissions}
      />
    </div>
  );
}
