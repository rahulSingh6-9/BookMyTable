import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Mail,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { useAdminAuth } from "../context/AuthContext";
import { invitationService } from "../services/invitation.service";
import { toast } from "sonner";
import CreateAdminInvitationModal from "../components/AdminInvitations/CreateAdminInvitationModal";
import StatsCard from "../components/AdminInvitations/StatsCard";

const AdminInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [stats, setStats] = useState({ pending: 0, accepted: 0, expired: 0, revoked: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await invitationService.getInvitations({ page, limit: 10, status: statusFilter });
      setInvitations(res.data);
      setTotalPages(res.pagination.pages);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch invitations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [page, statusFilter]);

  const handleRevoke = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this invitation?")) return;
    try {
      await invitationService.revokeInvitation(id);
      toast.success("Invitation revoked successfully");
      fetchInvitations();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to revoke invitation");
    }
  };

  const handleResend = async (id) => {
    try {
      await invitationService.resendInvitation(id);
      toast.success("Invitation resent successfully");
      fetchInvitations();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend invitation");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      accepted: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      expired: "bg-muted text-muted-foreground border-border",
      revoked: "bg-destructive/10 text-destructive border-destructive/20",
      delivery_failed: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Platform Admin Invitations
          </h1>
          <p className="text-muted-foreground mt-1">Manage core platform administrators and pending invites</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Invite Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Invites" value={stats.total} icon={Users} color="blue" />
        <StatsCard title="Pending" value={stats.pending} icon={Clock} color="yellow" />
        <StatsCard title="Accepted" value={stats.accepted} icon={CheckCircle2} color="green" />
        <StatsCard title="Revoked/Expired" value={(stats.revoked || 0) + (stats.expired || 0)} icon={XCircle} color="red" />
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-2xl shadow-sm border border-border/40 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {["", "pending", "accepted", "expired", "revoked"].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? "bg-foreground text-background"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted border border-border/60"
              }`}
            >
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : "All"}
            </button>
          ))}
        </div>
        <button onClick={fetchInvitations} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors">
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* List */}
      <div className="bg-card rounded-2xl shadow-sm border border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/20 border-b border-border/40">
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Invited By</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading && invitations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : invitations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Mail className="w-12 h-12 text-muted-foreground/30 mb-3" />
                      <p className="text-lg font-medium text-foreground">No invitations found</p>
                      <p className="text-sm text-muted-foreground mt-1">Try changing filters or invite a new admin.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => (
                  <tr key={inv._id} className="hover:bg-muted/20 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {inv.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{inv.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {inv.role.replace(/_/g, " ")}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(inv.status)}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {inv.invitedBy ? inv.invitedBy.name : "System"}
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {format(new Date(inv.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {inv.status === "pending" && (
                          <button
                            onClick={() => handleRevoke(inv._id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Revoke Invite"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {(inv.status === "pending" || inv.status === "expired" || inv.status === "revoked") && (
                          <button
                            onClick={() => handleResend(inv._id)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Resend Invite"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border/40 flex justify-between items-center bg-muted/10">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 text-sm font-semibold text-foreground bg-card border border-border/60 rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 text-sm font-semibold text-foreground bg-card border border-border/60 rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateAdminInvitationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchInvitations();
        }}
      />
    </div>
  );
};

export default AdminInvitations;
