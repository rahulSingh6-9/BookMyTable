import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Plus, MapPin, Users, Star, ArrowRight, Store, Settings, PowerOff, Activity, Clock, MoreVertical, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useBrand } from "@/context/BrandContext";
import { useBranch } from "@/context/BranchContext";
import { deactivateBranch, deleteBranch } from "@/services/restaurant.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function ActiveBranches() {
  const navigate = useNavigate();
  const { activeBrand, activeBrandSlug, refreshMemberships } = useBrand();
  const { switchBranch } = useBranch();
  
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [deactivateModal, setDeactivateModal] = useState({ isOpen: false, branch: null, reason: "", confirmed: false });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, branch: null, typeInput: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Exclude branches that are softly deleted or not active
  const branches = activeBrand?.memberships?.filter(m => {
    // If the schema includes isActive or isDeleted, filter them here to be safe
    // Since UI shouldn't show them if they slip through read models temporarily
    return m.branch?.isActive !== false && m.branch?.isDeleted !== true;
  }) || [];
  
  const filteredBranches = branches.filter(m => 
    m.branch?.branchName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.branch?.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );



  const handleBranchSelect = (branchSlug) => {
    switchBranch(branchSlug);
    navigate(`/brand/${activeBrandSlug}/branch/${branchSlug}/dashboard`);
  };

  const handleDeactivate = async () => {
    if (!deactivateModal.confirmed || !deactivateModal.branch) return;
    setIsProcessing(true);
    try {
      await deactivateBranch(activeBrand.id, deactivateModal.branch._id, { reason: deactivateModal.reason });
      toast.success(`${deactivateModal.branch.branchName} has been deactivated.`);
      setDeactivateModal({ isOpen: false, branch: null, reason: "", confirmed: false });
      await refreshMemberships(); // Refresh context
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to deactivate branch");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (deleteModal.typeInput !== "DELETE BRANCH" || !deleteModal.branch) return;
    setIsProcessing(true);
    try {
      await deleteBranch(activeBrand.id, deleteModal.branch._id);
      toast.success(`${deleteModal.branch.branchName} has been successfully deleted.`);
      setDeleteModal({ isOpen: false, branch: null, typeInput: "" });
      await refreshMemberships(); // Refresh context
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete branch");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full pb-16 space-y-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Active Branches</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all operational branches within this brand.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search branches..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border rounded-full"
            />
          </div>

        </div>
      </motion.div>

      {branches.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-[2rem] bg-card/50">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
            <Store className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No Active Branches</h2>
          <p className="text-muted-foreground max-w-md mb-8">You haven't added any operational branches to this brand yet. Create your first branch to start accepting bookings.</p>

        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.map((m, idx) => {
            const b = m.branch;
            const branchSlug = b.slug || b.branchName?.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.05 }}
                key={b._id} 
              >
                <Card className="group overflow-hidden rounded-[1.5rem] border-border bg-card shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer flex flex-col h-full" onClick={() => handleBranchSelect(branchSlug)}>
                  
                  {/* Cover Image Area */}
                  <div className="relative h-32 w-full bg-muted overflow-hidden">
                    {b.coverImage ? (
                      <img src={b.coverImage} alt={b.branchName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Store className="h-10 w-10 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm border-none backdrop-blur-md">Active</Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="p-5 flex-1 flex flex-col relative pt-10">
                    {/* Floating Logo */}
                    <Avatar className="absolute -top-10 left-5 h-16 w-16 border-4 border-card shadow-lg bg-card">
                      {b.logo ? (
                        <AvatarImage src={b.logo} className="object-cover" />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                          {b.branchName?.charAt(0) || "B"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    


                    {/* Content */}
                    <div className="flex justify-between items-start mb-2 mt-2">
                      <div className="pr-6">
                        <h3 className="font-bold text-lg text-foreground line-clamp-1">{b.branchName}</h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span className="line-clamp-1">{b.city || "Location not set"} {b.area && `, ${b.area}`}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-1 rounded-md">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-bold">{b.rating || "4.8"}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4 mt-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">{b.branchType || "Restaurant"}</Badge>
                      {(b.cuisines || ["Multi-Cuisine"]).slice(0, 2).map((c, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] capitalize">{c}</Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-border/50">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Staff</span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium">
                          <Users className="h-3.5 w-3.5 text-primary" /> {b.staffCount || 12}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Role</span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium">
                          <Badge variant="outline" className="border-primary/20 text-primary text-[10px] px-1.5 py-0 capitalize">
                            {m.role.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="px-3 py-2 bg-muted/30 border-t border-border flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <TooltipProvider>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuItem onClick={() => handleBranchSelect(branchSlug)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-amber-600" onClick={() => setDeactivateModal({ isOpen: true, branch: b, reason: "", confirmed: false })}>
                              <PowerOff className="mr-2 h-4 w-4" /> Deactivate Branch
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteModal({ isOpen: true, branch: b, typeInput: "" })}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Branch
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Activity className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Analytics</p></TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>

                    <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold hover:bg-primary hover:text-primary-foreground group/btn" onClick={(e) => { e.stopPropagation(); handleBranchSelect(branchSlug); }}>
                      Open Branch <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Deactivate Modal */}
      <Dialog open={deactivateModal.isOpen} onOpenChange={(val) => setDeactivateModal(prev => ({ ...prev, isOpen: val }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PowerOff className="h-5 w-5 text-amber-500" />
              Deactivate Branch
            </DialogTitle>
            <DialogDescription>
              This will temporarily suspend operations for <strong className="text-foreground">{deactivateModal.branch?.branchName}</strong>. 
              New bookings will be blocked and it will be hidden from discovery.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input 
                id="reason"
                placeholder="e.g. Under renovation until next month" 
                value={deactivateModal.reason}
                onChange={(e) => setDeactivateModal(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="confirm" 
                checked={deactivateModal.confirmed}
                onCheckedChange={(val) => setDeactivateModal(prev => ({ ...prev, confirmed: val }))}
              />
              <label
                htmlFor="confirm"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand this will immediately disable online availability.
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateModal(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-white" 
              onClick={handleDeactivate} 
              disabled={!deactivateModal.confirmed || isProcessing}
            >
              {isProcessing ? "Processing..." : "Deactivate Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Soft Delete Danger Modal */}
      <Dialog open={deleteModal.isOpen} onOpenChange={(val) => setDeleteModal(prev => ({ ...prev, isOpen: val }))}>
        <DialogContent className="sm:max-w-md border-destructive/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Branch
            </DialogTitle>
            <DialogDescription className="pt-2">
              You are about to delete <strong className="text-foreground">{deleteModal.branch?.branchName}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-destructive/10 p-4 rounded-lg my-2 border border-destructive/20">
            <ul className="text-sm text-destructive font-medium space-y-1 list-disc pl-4">
              <li>All active staff ({deleteModal.branch?.staffCount || 12}) will lose access immediately.</li>
              <li>Future reservations will be forcibly canceled or flagged.</li>
              <li>The branch will be completely hidden from discovery.</li>
            </ul>
          </div>
          
          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-delete" className="text-foreground font-semibold">
              Type <span className="font-mono bg-muted px-1 py-0.5 rounded text-destructive">DELETE BRANCH</span> to confirm
            </Label>
            <Input 
              id="confirm-delete"
              placeholder="DELETE BRANCH" 
              value={deleteModal.typeInput}
              onChange={(e) => setDeleteModal(prev => ({ ...prev, typeInput: e.target.value }))}
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={deleteModal.typeInput !== "DELETE BRANCH" || isProcessing}
            >
              {isProcessing ? "Deleting..." : "Soft Delete Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
