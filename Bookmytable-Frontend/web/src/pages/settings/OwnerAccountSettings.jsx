import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User, AlertTriangle, PowerOff, Archive, Store, Mail, Phone, Globe, Edit, ShieldCheck, Zap, Activity, Clock, Server, CheckCircle2, MapPin, Sparkles, MessageSquare, Briefcase, Camera, Link as LinkIcon, Building2, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useBrand } from "@/context/BrandContext";
import { deactivateBrand, archiveBrand } from "@/services/brand.service";
import { BrandDeactivationModal } from "@/components/brand/BrandDeactivationModal";
import apiClient from "@/lib/api";

export default function OwnerAccountSettings() {
  const { activeBrand } = useBrand();
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [usageData, setUsageData] = useState(null);

  // Form mock state for UI Template
  const [formData, setFormData] = useState({
    name: "",
    tagline: "The best dining experience in town",
    description: "",
    email: "",
    phone: "",
    website: "",
    supportContact: "help@bookmytable.com",
    timezone: "UTC",
    currency: "USD",
  });

  useEffect(() => {
    if (activeBrand) {
      setFormData(prev => ({
        ...prev,
        name: activeBrand.name || "",
        description: activeBrand.description || "",
        email: activeBrand.email || "",
        phone: activeBrand.phone || "",
        website: activeBrand.website || "",
      }));
    }
  }, [activeBrand]);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await apiClient.get("/restaurants/subscriptions/my-usage");
        if (res.data?.success) {
          setUsageData(res.data.data);
        }
      } catch (e) {
        console.error("Failed to fetch usage data", e);
      }
    };
    if (activeBrand) fetchUsage();
  }, [activeBrand]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your brand preferences have been successfully updated.",
      });
    }, 800);
  };

  if (!activeBrand) return null;

  const calculatePercent = (used, max) => {
    if (!max || max === 0) return 0;
    const pct = Math.round((used / max) * 100);
    return pct > 100 ? 100 : pct;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Brand Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your brand identity, preferences, and subscription limits.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full shadow-sm" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button className="rounded-full shadow-md px-6" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Forms */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* SECTION 1: Brand Identity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Store className="h-5 w-5 text-primary" /> Brand Identity
                </CardTitle>
                <CardDescription>
                  Your public brand profile information and aesthetics.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative group cursor-pointer">
                      <Avatar className="h-32 w-32 rounded-2xl border-4 border-background shadow-md">
                        {activeBrand.logo ? (
                          <AvatarImage src={activeBrand.logo} className="object-cover" />
                        ) : (
                          <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold rounded-2xl">
                            {activeBrand.name?.charAt(0) || "B"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs rounded-full">
                      Upload Logo
                    </Button>
                  </div>

                  <div className="flex-1 space-y-5 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Brand Name</Label>
                        <Input 
                          value={formData.name} 
                          onChange={(e) => setFormData({...formData, name: e.target.value})} 
                          className="rounded-xl bg-muted/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
                          <span>Brand Slug</span>
                          <span className="text-[10px] text-muted-foreground/70 normal-case font-normal">(Read-only)</span>
                        </Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            value={activeBrand.slug} 
                            readOnly 
                            className="pl-9 rounded-xl bg-muted/50 text-muted-foreground border-transparent cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tagline</Label>
                      <div className="relative">
                        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          value={formData.tagline} 
                          onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                          placeholder="e.g. Elevating culinary experiences"
                          className="pl-9 rounded-xl bg-muted/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</Label>
                      <Textarea 
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Tell your customers about your brand's vision and history..."
                        className="rounded-xl min-h-[100px] resize-none bg-muted/20"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>


          {/* SECTION 4: Brand Preferences */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-primary" /> Brand Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  <div className="flex items-center justify-between p-6">
                    <div>
                      <Label className="text-base font-semibold">Global Timezone</Label>
                      <p className="text-sm text-muted-foreground mt-1">Set the default timezone for cross-branch analytics.</p>
                    </div>
                    <Select value={formData.timezone} onValueChange={(v) => setFormData({...formData, timezone: v})}>
                      <SelectTrigger className="w-[180px] rounded-xl">
                        <SelectValue placeholder="Select Timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                        <SelectItem value="EST">EST (GMT-5)</SelectItem>
                        <SelectItem value="PST">PST (GMT-8)</SelectItem>
                        <SelectItem value="IST">IST (GMT+5:30)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-6">
                    <div>
                      <Label className="text-base font-semibold">Reporting Currency</Label>
                      <p className="text-sm text-muted-foreground mt-1">Financial roll-ups will be converted to this currency.</p>
                    </div>
                    <Select value={formData.currency} onValueChange={(v) => setFormData({...formData, currency: v})}>
                      <SelectTrigger className="w-[180px] rounded-xl">
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-muted/10">
                    <div>
                      <Label className="text-base font-semibold text-foreground">Weekly Digest Emails</Label>
                      <p className="text-sm text-muted-foreground mt-1">Receive a weekly summary of brand performance and booking metrics.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-6 bg-muted/10">
                    <div>
                      <Label className="text-base font-semibold text-foreground">Strict Table Limits</Label>
                      <p className="text-sm text-muted-foreground mt-1">Prevent branch managers from overbooking tables beyond maximum capacity.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SECTION 7: Danger Zone */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="rounded-2xl border-destructive/20 shadow-sm bg-destructive/5 relative overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-destructive text-lg">
                  <AlertTriangle className="h-5 w-5" /> Danger Zone
                </CardTitle>
                <CardDescription className="text-destructive/80">
                  Irreversible actions. Proceed with absolute caution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 relative z-10">
                  
                  {/* Deactivate */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-destructive/20 bg-background/50 backdrop-blur-sm">
                    <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <PowerOff className="h-4 w-4 text-destructive" /> Deactivate Brand
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Temporarily disable operations. All active branches will be immediately set to inactive.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="whitespace-nowrap rounded-xl border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
                        window.location.reload();
                      } catch (e) {
                        toast({ variant: "destructive", title: "Error", description: e.response?.data?.message || "Failed to deactivate" });
                      } finally {
                        setIsDeactivating(false);
                      }
                    }}
                  />

                  {/* Archive */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-destructive/20 bg-background/50 backdrop-blur-sm">
                    <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Archive className="h-4 w-4 text-destructive" /> Archive Brand
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Soft delete this brand entirely. It will be hidden from public view and moved to the archives.
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      className="whitespace-nowrap rounded-xl"
                      disabled={isArchiving}
                      onClick={async () => {
                        if(confirm("Are you absolutely sure you want to archive this brand? This action is highly destructive.")) {
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
          </motion.div>

        </div>

        {/* RIGHT COLUMN: Context & Summaries */}
        <div className="space-y-6">
          

          {/* SECTION 3: Ownership Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Ownership Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Primary Owner</p>
                    <p className="font-semibold text-sm truncate">{activeBrand.ownerId?.name || "System Administrator"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 mt-1">
                      {activeBrand.status || "Approved"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Est. Date</p>
                    <p className="text-sm font-semibold mt-0.5">
                      {activeBrand.createdAt ? new Date(activeBrand.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* SECTION 6: Activity Snapshot */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-6">
                  <div className="relative pl-5 before:absolute before:left-[7px] before:top-2 before:bottom-[-24px] before:w-[2px] before:bg-border last:before:hidden">
                    <div className="absolute left-0 top-1.5 h-[16px] w-[16px] rounded-full border-2 border-background bg-primary" />
                    <p className="text-sm font-medium">Settings Updated</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Today at 10:42 AM</p>
                  </div>
                  <div className="relative pl-5 before:absolute before:left-[7px] before:top-2 before:bottom-[-24px] before:w-[2px] before:bg-border last:before:hidden">
                    <div className="absolute left-0 top-1.5 h-[16px] w-[16px] rounded-full border-2 border-background bg-muted-foreground/30" />
                    <p className="text-sm font-medium">Subscription Upgraded</p>
                    <p className="text-xs text-muted-foreground mt-0.5">3 days ago</p>
                  </div>
                  <div className="relative pl-5 before:absolute before:left-[7px] before:top-2 before:bottom-[-24px] before:w-[2px] before:bg-border last:before:hidden">
                    <div className="absolute left-0 top-1.5 h-[16px] w-[16px] rounded-full border-2 border-background bg-muted-foreground/30" />
                    <p className="text-sm font-medium">Brand Created</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activeBrand.createdAt ? new Date(activeBrand.createdAt).toLocaleDateString() : "Last month"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
