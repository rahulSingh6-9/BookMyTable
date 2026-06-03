import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, AlertTriangle, PowerOff, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useBrand } from "@/context/BrandContext";
import { deactivateBrand, archiveBrand } from "@/services/brand.service";
import { BrandDeactivationModal } from "@/components/brand/BrandDeactivationModal";

export default function OwnerAccountSettings() {
  const { activeBrand } = useBrand();
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your personal account details and preferences.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your profile details and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            Account settings form will be implemented here
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {activeBrand && (
        <Card className="rounded-2xl border-destructive/20 shadow-sm bg-destructive/5 relative overflow-hidden mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Danger Zone
            </CardTitle>
            <CardDescription className="text-destructive/80">
              Irreversible and highly destructive actions for your brand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 relative z-10">
              <div className="flex flex-col gap-2 p-4 rounded-xl border border-destructive/20 bg-background/50 backdrop-blur-sm">
                <div>
                  <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <PowerOff className="h-4 w-4 text-destructive" /> Deactivate Brand
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">Temporarily disable operations. Branches will be set to inactive.</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full md:w-auto mt-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  disabled={isDeactivating}
                  onClick={() => setIsDeactivateModalOpen(true)}
                >
                  Deactivate Brand
                </Button>
              </div>

              <BrandDeactivationModal 
                isOpen={isDeactivateModalOpen}
                onClose={setIsDeactivateModalOpen}
                brand={activeBrand}
                isProcessing={isDeactivating}
                onConfirm={async (data) => {
                  setIsDeactivating(true);
                  try {
                    await deactivateBrand(activeBrand.id, data);
                    toast({ title: "Brand Deactivated", description: "Brand and all branches are now inactive." });
                    setIsDeactivateModalOpen(false);
                    // Redirect to archived or just reload
                    window.location.reload();
                  } catch (e) {
                    toast({ variant: "destructive", title: "Error", description: e.response?.data?.message || "Failed to deactivate" });
                  } finally {
                    setIsDeactivating(false);
                  }
                }}
              />

              <div className="flex flex-col gap-2 p-4 rounded-xl border border-destructive/20 bg-background/50 backdrop-blur-sm">
                <div>
                  <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <Archive className="h-4 w-4 text-destructive" /> Archive Brand
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">Soft delete brand. It will be moved to archived list and hidden from public.</p>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full md:w-auto mt-2"
                  disabled={isArchiving}
                  onClick={async () => {
                    if(confirm("Are you sure you want to archive this brand?")) {
                      setIsArchiving(true);
                      try {
                        await archiveBrand(activeBrand.id);
                        toast({ title: "Brand Archived", description: "Brand has been moved to archives." });
                        navigate("/brand/archived");
                      } catch (e) {
                        toast({ variant: "destructive", title: "Error", description: e.response?.data?.message || "Failed to archive" });
                      } finally {
                        setIsArchiving(false);
                      }
                    }
                  }}
                >
                  {isArchiving ? "Archiving..." : "Archive Brand"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
