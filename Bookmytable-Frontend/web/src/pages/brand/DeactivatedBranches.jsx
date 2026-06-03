import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Store, ArchiveRestore, Trash2, AlertTriangle } from "lucide-react";
import { useBrand } from "@/context/BrandContext";
import { restoreBranch, permanentlyDeleteBranch } from "@/services/restaurant.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function DeactivatedBranches() {
  const { activeBrand, refreshMemberships } = useBrand();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, branch: null, typeInput: "" });
  
  const deactivatedBranches = activeBrand?.memberships?.filter(m => {
    return m.branch?.isActive === false || m.branch?.isDeleted === true || m.branch?.status === 'suspended';
  }) || [];

  const handleRestore = async (branchId) => {
    setIsProcessing(true);
    try {
      await restoreBranch(activeBrand.id, branchId);
      toast.success("Branch restored successfully.");
      await refreshMemberships(); // Refresh context
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to restore branch");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (deleteModal.typeInput !== "PERMANENT DELETE" || !deleteModal.branch) return;
    setIsProcessing(true);
    try {
      await permanentlyDeleteBranch(activeBrand.id, deleteModal.branch._id);
      toast.success(`${deleteModal.branch.branchName} has been permanently deleted.`);
      setDeleteModal({ isOpen: false, branch: null, typeInput: "" });
      await refreshMemberships(); // Refresh context
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to permanently delete branch");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full pb-16 space-y-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Deactivated Branches</h1>
          <p className="text-muted-foreground mt-1">Review branches that have been suspended, closed, or deactivated.</p>
        </div>
      </motion.div>

      {deactivatedBranches.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center border border-border rounded-[2rem] bg-card/50 shadow-sm">
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-6">
            <ShieldCheck className="h-10 w-10 opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No Deactivated Branches</h2>
          <p className="text-muted-foreground max-w-md">All branches under your portfolio are currently active and operational. Any branch you deactivate will appear here securely.</p>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deactivatedBranches.map((m, idx) => {
            const b = m.branch;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.05 }}
                key={b._id} 
              >
                <Card className="group overflow-hidden rounded-[1.5rem] border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full opacity-70 hover:opacity-100">
                  <div className="p-5 flex-1 flex flex-col pt-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {b.logo ? (
                           <img src={b.logo} className="w-full h-full object-cover rounded-full grayscale" />
                        ) : (
                           <Store className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground line-clamp-1">{b.branchName}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {b.isDeleted ? `Deleted on: ${new Date(b.deletedAt || Date.now()).toLocaleDateString()}` : `Deactivated`}
                        </p>
                      </div>
                    </div>
                    <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-xl border border-destructive/20 mt-auto">
                      <span className="font-semibold block mb-1">Status:</span>
                      {b.isDeleted ? "Soft Deleted" : b.deactivateReason || "Temporarily closed / Suspended"}
                    </div>
                  </div>
                  <div className="px-3 py-3 bg-muted/30 border-t border-border flex justify-end gap-2">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="h-8 text-xs bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => setDeleteModal({ isOpen: true, branch: b, typeInput: "" })}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete Permanently
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90"
                      onClick={() => handleRestore(b._id)}
                      disabled={isProcessing}
                    >
                      <ArchiveRestore className="mr-1.5 h-3.5 w-3.5" /> Restore
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Permanent Delete Danger Modal */}
      <Dialog open={deleteModal.isOpen} onOpenChange={(val) => setDeleteModal(prev => ({ ...prev, isOpen: val }))}>
        <DialogContent className="sm:max-w-md border-destructive">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Permanent Delete
            </DialogTitle>
            <DialogDescription className="pt-2">
              You are about to PERMANENTLY delete <strong className="text-foreground">{deleteModal.branch?.branchName}</strong>. 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-destructive/10 p-4 rounded-lg my-2 border border-destructive/20">
            <h4 className="text-sm font-bold text-destructive mb-2">Consequences:</h4>
            <ul className="text-sm text-destructive font-medium space-y-1 list-disc pl-4">
              <li>Permanently removes branch from the database.</li>
              <li>Destroys all staff relationships and memberships.</li>
              <li>Removes discovery visibility forever.</li>
              <li>Wipes all operational settings.</li>
            </ul>
          </div>
          
          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-perm-delete" className="text-foreground font-semibold">
              Type <span className="font-mono bg-muted px-1 py-0.5 rounded text-destructive">PERMANENT DELETE</span> to confirm
            </Label>
            <Input 
              id="confirm-perm-delete"
              placeholder="PERMANENT DELETE" 
              value={deleteModal.typeInput}
              onChange={(e) => setDeleteModal(prev => ({ ...prev, typeInput: e.target.value }))}
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handlePermanentDelete} 
              disabled={deleteModal.typeInput !== "PERMANENT DELETE" || isProcessing}
            >
              {isProcessing ? "Processing..." : "Destroy Branch Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
