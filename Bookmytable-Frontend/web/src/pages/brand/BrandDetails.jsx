import { motion } from "framer-motion";
import { Store, Globe, Mail, Phone, Calendar, Users, Activity, TrendingUp, Settings, Edit, Upload, Eye, EyeOff, Bell, Search, Layers } from "lucide-react";
import { useBrand } from "@/context/BrandContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function BrandDetails() {
  const { activeBrand } = useBrand();

  if (!activeBrand) return null;

  const totalBranches = activeBrand.memberships?.length || 0;
  // Assume all memberships in the brand context are active for this summary
  const activeBranches = totalBranches;
  
  // Calculate a mock staff count across branches
  const staffCount = totalBranches * 4; 
  // Mock analytics
  const totalBookings = totalBranches * 1240;

  return (
    <div className="w-full pb-16 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Brand Details</h1>
          <p className="text-muted-foreground mt-1">Manage your brand's public profile and overarching settings.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full shadow-sm">
            <Eye className="mr-2 h-4 w-4" /> Public Profile
          </Button>
          <Button className="rounded-full shadow-md">
            <Edit className="mr-2 h-4 w-4" /> Edit Brand
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6 md:p-8 rounded-[2rem] border-border shadow-md bg-card overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Store className="h-48 w-48" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 relative z-10">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group cursor-pointer">
                <Avatar className="h-32 w-32 rounded-2xl border-4 border-background shadow-xl">
                  {activeBrand.logo ? (
                    <AvatarImage src={activeBrand.logo} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold rounded-2xl">
                      {activeBrand.name?.charAt(0) || "B"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <Upload className="h-8 w-8 text-white" />
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1">
                Active Portfolio
              </Badge>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground">{activeBrand.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <Badge variant="secondary" className="font-mono text-xs">@{activeBrand.slug}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Assets</p>
                    <p className="text-sm font-semibold">{totalBranches} Branches</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Created On</p>
                    <p className="text-sm font-semibold">
                      {activeBrand.createdAt ? new Date(activeBrand.createdAt).toLocaleDateString() : 'Dec 12, 2025'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-6">
          <Card className="p-6 rounded-2xl border-border shadow-sm bg-card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" /> Brand Information
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                <p className="text-sm mt-1 text-foreground leading-relaxed">
                  {activeBrand.description || "No description provided for this brand. Click 'Edit Brand' to add a description that will appear on your public profile and across your branches."}
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Website</label>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {activeBrand.website ? (
                      <a href={activeBrand.website} className="text-primary hover:underline">{activeBrand.website}</a>
                    ) : (
                      <span className="text-muted-foreground italic">Not specified</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Contact Email</label>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {activeBrand.email ? (
                      <span>{activeBrand.email}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Not specified</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Contact Phone</label>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {activeBrand.phone ? (
                      <span>{activeBrand.phone}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Not specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border-border shadow-sm bg-card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Brand Settings
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Public Brand Directory</h4>
                    <p className="text-xs text-muted-foreground mt-1">Allow customers to discover all your branches through your brand profile.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">Manage</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Brand Notifications</h4>
                    <p className="text-xs text-muted-foreground mt-1">Receive digest emails across all your operating branches.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">Manage</Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
          <Card className="p-6 rounded-2xl border-border shadow-sm bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10">
              <Activity className="h-32 w-32 -mr-6 -mt-6" />
            </div>
            <h3 className="text-lg font-bold mb-6 relative z-10">Brand Analytics</h3>
            
            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-wider">Total Active Branches</p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-4xl font-extrabold">{activeBranches}</span>
                </div>
              </div>
              
              <Separator className="bg-primary-foreground/20" />
              
              <div>
                <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-wider">Total Staff Members</p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-3xl font-bold">{staffCount}</span>
                  <span className="text-sm text-primary-foreground/70 pb-1">across brand</span>
                </div>
              </div>
              
              <Separator className="bg-primary-foreground/20" />
              
              <div>
                <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-wider">Total Bookings (YTD)</p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-3xl font-bold">{totalBookings.toLocaleString()}</span>
                  <Badge className="bg-white/20 text-white hover:bg-white/20 border-none ml-2">
                    <TrendingUp className="mr-1 h-3 w-3" /> +12%
                  </Badge>
                </div>
              </div>
            </div>
          </Card>


        </motion.div>
      </div>
    </div>
  );
}
