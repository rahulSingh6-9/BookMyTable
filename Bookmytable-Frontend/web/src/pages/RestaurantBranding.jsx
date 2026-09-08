import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBranch } from "@/context/BranchContext";
import { useBrand } from "@/context/BrandContext";
import { 
  getBrandingDetails, 
  updateBrandingDetails,
  uploadBrandLogo,
  uploadRestaurantLogo,
  uploadRestaurantCover,
  uploadRestaurantGallery,
  deleteRestaurantGalleryImage as deleteGalleryImageAPI
} from "@/services/workspace.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Store, Camera, Upload, Trash, Globe, Building2, Sparkles, Star, 
  Clock, ShieldCheck, ShieldAlert, Check, X, Loader2, Link, Mail, Phone,
  Instagram, Facebook
} from "lucide-react";
import { toast } from "sonner";

export default function RestaurantBranding() {
  const { activeBranch, activeMembership, activeBranchId, isLoading: isBranchLoading } = useBranch();
  const { refreshMemberships } = useBrand();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState(null);

  // Form State
  const [branchName, setBranchName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [cuisines, setCuisines] = useState([]);
  const [newCuisine, setNewCuisine] = useState("");
  
  // Media State
  const [logo, setLogo] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [gallery, setGallery] = useState([]);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // Social & Presence State
  const [website, setWebsite] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  
  // Track initial state for delta updates
  const [initialBusinessIdentity, setInitialBusinessIdentity] = useState({});

  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Sync state reactively with active branch from central memberships context
  useEffect(() => {
    if (!activeBranch) return;
    
    setIsLoading(false);
    const branch = activeBranch;
    const brand = activeMembership?.brand || {};
    
    setData({ branch, brand });
    const initBranchName = branch.branchName || branch.name || branch.restaurantName || "";
    const initSlug = branch.slug || "";
    const initDesc = branch.description || "";
    const initCuisines = branch.cuisines || [];

    setInitialBusinessIdentity({
      branchName: initBranchName,
      slug: initSlug,
      description: initDesc,
      cuisines: initCuisines
    });

    setBranchName(initBranchName);
    setBrandName(brand.name || "");
    setSlug(initSlug);
    setDescription(initDesc);
    setCuisines(initCuisines);
    setLogo(branch.logo || "");
    setCoverImage(branch.coverImage || brand.coverImage || "");
    setGallery(branch.images || []);
    
    setWebsite(brand.website || "");
    setSupportEmail(branch.contact?.supportEmail || brand.supportEmail || "");
    setContactNumber(branch.contact?.primaryPhone?.number || brand.contactPhone || "");
    
    // Parse socials from branch tags
    let ig = "";
    let fb = "";
    if (branch.tags && branch.tags.length > 0) {
      const igTag = branch.tags.find(tag => tag.startsWith("social:instagram:"));
      const fbTag = branch.tags.find(tag => tag.startsWith("social:facebook:"));
      if (igTag) ig = igTag.split(":")[2] || "";
      if (fbTag) fb = fbTag.split(":")[2] || "";
    }
    setInstagram(ig);
    setFacebook(fb);
  }, [activeBranch, activeMembership]);

  // Handle updates
  const handleSaveBusinessIdentity = async (e) => {
    e.preventDefault();
    if (!branchName.trim()) {
      toast.error("Branch Name is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {};
      if (branchName !== initialBusinessIdentity.branchName) payload.branchName = branchName;
      if (slug !== initialBusinessIdentity.slug) payload.slug = slug;
      if (description !== initialBusinessIdentity.description) payload.description = description;
      if (JSON.stringify(cuisines) !== JSON.stringify(initialBusinessIdentity.cuisines)) payload.cuisines = cuisines;

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save");
        return;
      }

      const response = await updateBrandingDetails(payload);
      if (response.success) {
        toast.success("Business Identity saved successfully!");
        await refreshMemberships();
      }
    } catch (error) {
      console.error("Failed to save business identity:", error);
      toast.error(error.message || "Failed to update business identity");
    } finally {
      setIsSaving(false);
    }
  };

  // Media upload handlers
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!activeBranch?._id) {
      toast.error("Branch ID context not found");
      return;
    }
    setIsUploadingLogo(true);
    try {
      const response = await uploadRestaurantLogo(activeBranch._id, file);
      if (response.success && response.data) {
        setLogo(response.data);
        toast.success("Branch logo uploaded successfully");
        await refreshMemberships();
      }
    } catch (error) {
      console.error("Logo upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload branch logo image");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!activeBranch?._id) {
      toast.error("Branch ID context not found");
      return;
    }
    setIsUploadingCover(true);
    try {
      const response = await uploadRestaurantCover(activeBranch._id, file);
      if (response.success && response.data) {
        setCoverImage(response.data);
        toast.success("Cover image uploaded successfully");
        await refreshMemberships();
      }
    } catch (error) {
      console.error("Cover upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload cover image");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (!activeBranch?._id) {
      toast.error("Branch ID context not found");
      return;
    }
    setIsUploadingGallery(true);
    try {
      const response = await uploadRestaurantGallery(activeBranch._id, files);
      if (response.success && response.data) {
        setGallery(prev => [...prev, ...response.data]);
        toast.success(`${files.length} gallery image(s) uploaded successfully`);
        await refreshMemberships();
      }
    } catch (error) {
      console.error("Gallery upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload gallery images");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const removeGalleryImage = async (indexToRemove, imageUrl) => {
    if (!activeBranch?._id) {
      toast.error("Branch ID context not found");
      return;
    }
    try {
      const response = await deleteGalleryImageAPI(activeBranch._id, imageUrl);
      if (response.success) {
        setGallery(prev => prev.filter((_, idx) => idx !== indexToRemove));
        toast.success("Gallery image deleted successfully");
        await refreshMemberships();
      }
    } catch (error) {
      console.error("Delete gallery image error:", error);
      toast.error(error.response?.data?.message || "Failed to delete gallery image");
    }
  };

  // Cuisine Chip helpers
  const addCuisine = () => {
    const clean = newCuisine.trim();
    if (!clean) return;
    if (cuisines.includes(clean)) {
      toast.info("Cuisine tag is already present");
      return;
    }
    setCuisines(prev => [...prev, clean]);
    setNewCuisine("");
  };

  const removeCuisine = (cuisineToRemove) => {
    setCuisines(prev => prev.filter(c => c !== cuisineToRemove));
  };

  if (isLoading || isBranchLoading || !activeBranch) {
    return (
      <div className="flex h-screen items-center justify-center bg-background/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium text-sm">Loading Business Workspace...</p>
        </div>
      </div>
    );
  }

  const { branch, brand } = data || {};
  const isVerified = brand?.isVerifiedBrand || false;

  return (
    <div className="w-full min-h-screen bg-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              Business Workspace
            </h1>
            <p className="text-muted-foreground mt-1">
              Centralized business identity, asset libraries, and branding configurations for BookMyTable.
            </p>
          </div>
        </div>

        {/* 1. BRANDING HERO CONTAINER */}
        <Card className="rounded-[2.5rem] overflow-hidden border border-border shadow-xl bg-card">
          {/* Cover image banner */}
          <div className="h-64 sm:h-80 w-full bg-slate-900 relative overflow-hidden group">
            {coverImage ? (
              <img src={coverImage} alt="Cover Banner" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-500" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-slate-950 to-slate-800 flex items-center justify-center">
                <Store className="h-20 w-20 text-muted-foreground/30 animate-pulse" />
              </div>
            )}
            
            {/* Cover upload overlay */}
            <div 
              onClick={() => coverInputRef.current?.click()}
              className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 text-white cursor-pointer transition-opacity duration-300 font-semibold"
            >
              {isUploadingCover ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
              <span>Change Cover Image</span>
            </div>
            <input type="file" ref={coverInputRef} onChange={handleCoverUpload} accept="image/*" className="hidden" />

            {/* Status indicators */}
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <Badge className={`px-4 py-1.5 rounded-full font-bold shadow-md capitalize ${
                branch?.status === "approved" ? "bg-emerald-600 hover:bg-emerald-700 text-white" :
                branch?.status === "pending" ? "bg-amber-500 hover:bg-amber-600 text-white" :
                "bg-destructive hover:bg-destructive text-white"
              }`}>
                {branch?.status || "Draft"}
              </Badge>
              
              <Badge className={`px-4 py-1.5 rounded-full font-bold shadow-md ${
                branch?.isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {branch?.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Logo & Identity overlay section */}
          <div className="p-8 relative pt-16 sm:pt-20">
            {/* Logo absolute float */}
            <div className="absolute -top-16 left-8 h-28 w-28 sm:h-32 sm:w-32 rounded-3xl border-4 border-card bg-card overflow-hidden shadow-2xl group cursor-pointer">
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Store className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              {/* Logo hover upload trigger */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  logoInputRef.current?.click();
                }}
                className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity"
              >
                {isUploadingLogo ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                <span className="mt-1">Edit Logo</span>
              </div>
              <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
            </div>

            {/* Details and highlights */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-extrabold text-foreground">{branchName || "Unnamed Branch"}</h2>
                  {isVerified ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center gap-1 rounded-full px-3 py-1 font-bold">
                      <ShieldCheck className="h-4 w-4" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700 flex items-center gap-1 rounded-full px-3 py-1 font-bold">
                      <ShieldAlert className="h-4 w-4" /> Verification Required
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground font-medium text-lg flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Part of <strong className="text-foreground">{brandName || "Unnamed Brand"}</strong>
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {cuisines.map(c => (
                    <Badge key={c} variant="secondary" className="px-3 py-1 rounded-full text-xs font-semibold">
                      {c}
                    </Badge>
                  ))}
                  {cuisines.length === 0 && (
                    <span className="text-muted-foreground text-xs italic">No cuisine tags configured</span>
                  )}
                </div>
              </div>

              {/* Readonly highlight badges */}
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-5 rounded-[1.5rem] border border-border/50 self-start sm:min-w-[280px]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Branch Code</span>
                  <span className="text-base font-bold font-mono text-foreground">{branch?.branchCode || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Rating Score</span>
                  <span className="text-base font-bold text-foreground flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {branch?.averageRating?.toFixed(1) || "0.0"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </Card>

        {/* 2. BUSINESS IDENTITY SECTION */}
        <Card className="p-8 rounded-[2rem] border border-border shadow-md space-y-6 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" /> Business Identity
              </h3>
              <p className="text-sm text-muted-foreground">Configure the visible, consumer-facing information for this branch.</p>
            </div>
            <Button onClick={handleSaveBusinessIdentity} disabled={isSaving} className="rounded-full shadow-md h-10 px-6 font-bold bg-primary text-primary-foreground hover:bg-primary/90">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-bold">Branch Name</Label>
              <Input value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="e.g. Downtown Central" className="h-11 rounded-lg" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Brand Name</Label>
              <Input value={brandName} disabled className="h-11 rounded-lg bg-muted/50 cursor-not-allowed font-medium text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Slug URL Identifier</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-muted-foreground text-sm">bookmytable.com/</span>
                <Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().trim())} className="h-11 rounded-lg pl-36 font-semibold" />
              </div>
              <p className="text-[11px] text-muted-foreground">Slug must be unique and handles search queries for customers.</p>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Business Category</Label>
              <Input value={branch?.branchType || "branch"} disabled className="h-11 rounded-lg bg-muted/50 cursor-not-allowed font-medium uppercase" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Restaurant Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe your restaurant environment, special dishes, rules, or general bio information for booking profiles..." className="rounded-xl resize-none" />
          </div>

          {/* Cuisine interactive chips */}
          <div className="space-y-3">
            <Label className="font-bold block">Cuisine Tags Management</Label>
            <div className="flex flex-wrap gap-2 p-4 bg-muted/20 border border-border/50 rounded-xl min-h-[50px]">
              {cuisines.map(c => (
                <Badge key={c} variant="secondary" className="px-3.5 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
                  {c}
                  <X onClick={() => removeCuisine(c)} className="h-3.5 w-3.5 hover:text-destructive cursor-pointer rounded-full hover:bg-muted" />
                </Badge>
              ))}
              {cuisines.length === 0 && (
                <span className="text-muted-foreground text-sm italic">Add cuisine categories below</span>
              )}
            </div>
            <div className="flex gap-2 max-w-sm">
              <Input value={newCuisine} onChange={(e) => setNewCuisine(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCuisine())} placeholder="e.g. Italian, Fast Food" className="h-10 rounded-lg" />
              <Button type="button" onClick={addCuisine} variant="outline" className="h-10 px-4 rounded-lg font-bold">Add</Button>
            </div>
          </div>
        </Card>

        {/* 3. BRANDING ASSETS SECTION */}
        <Card className="p-8 rounded-[2rem] border border-border shadow-md space-y-6 bg-card">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" /> Visual Assets & Photo Gallery
            </h3>
            <p className="text-sm text-muted-foreground">Manage files, visual assets, Cover Banner, Logo, and Gallery displays.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Logo block */}
            <div className="space-y-3">
              <Label className="font-bold">Workspace Logo</Label>
              <div className="flex items-center gap-4 p-4 border rounded-2xl bg-muted/10">
                <div className="h-20 w-20 rounded-2xl overflow-hidden border border-border shrink-0">
                  {logo ? (
                    <img src={logo} alt="Workspace Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Store className="h-8 w-8 text-muted-foreground/55" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Button type="button" onClick={() => logoInputRef.current?.click()} disabled={isUploadingLogo} size="sm" variant="outline" className="rounded-full font-bold">
                    {isUploadingLogo ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                    Upload Logo
                  </Button>
                  <p className="text-[10px] text-muted-foreground">PNG, JPG recommended. Max 2MB size limit.</p>
                </div>
              </div>
            </div>

            {/* Cover image block */}
            <div className="space-y-3">
              <Label className="font-bold">Cover Banner Image</Label>
              <div className="flex items-center gap-4 p-4 border rounded-2xl bg-muted/10">
                <div className="h-20 w-32 rounded-2xl overflow-hidden border border-border shrink-0">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Store className="h-8 w-8 text-muted-foreground/55" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Button type="button" onClick={() => coverInputRef.current?.click()} disabled={isUploadingCover} size="sm" variant="outline" className="rounded-full font-bold">
                    {isUploadingCover ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                    Upload Cover
                  </Button>
                  <p className="text-[10px] text-muted-foreground">Vibrant 16:9 banner layout. Max 5MB size limit.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="space-y-4 pt-4 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-bold text-base">Photo Gallery Showcase</Label>
                <p className="text-xs text-muted-foreground">Upload and manage visual assets shown on client reservation maps.</p>
              </div>
              <Button type="button" onClick={() => galleryInputRef.current?.click()} disabled={isUploadingGallery} className="rounded-full font-bold">
                {isUploadingGallery ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Add Photos
              </Button>
              <input type="file" ref={galleryInputRef} onChange={handleGalleryUpload} accept="image/*" multiple className="hidden" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-muted/10 border border-border/50 rounded-2xl min-h-[150px]">
              <AnimatePresence>
                {gallery.map((img, idx) => (
                  <motion.div 
                    key={img + idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="aspect-video relative rounded-xl overflow-hidden border border-border shadow-sm group bg-slate-950"
                  >
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    
                    {/* Delete overlay */}
                    <div 
                      onClick={() => removeGalleryImage(idx, img)}
                      className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity"
                    >
                      <Trash className="h-5 w-5 text-destructive hover:scale-110 transition" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {gallery.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-8 text-muted-foreground gap-2">
                  <Camera className="h-8 w-8 text-muted-foreground/45" />
                  <span className="text-sm font-medium">Your asset gallery is empty. Upload premium photos to attract customers!</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 4. PUBLIC PRESENCE SECTION */}
        <Card className="p-8 rounded-[2rem] border border-border shadow-md space-y-6 bg-card">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Public Presence & Socials
            </h3>
            <p className="text-sm text-muted-foreground">Configure social handle tags, support contacts, and direct website landing parameters.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-bold flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-muted-foreground" /> Website Address
              </Label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g. www.burgerpalace.com" className="h-11 rounded-lg" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-muted-foreground" /> Support Email
              </Label>
              <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="e.g. contact@burgerpalace.com" className="h-11 rounded-lg" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-muted-foreground" /> Contact / Hotline Number
              </Label>
              <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="e.g. +91 9876543210" className="h-11 rounded-lg" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold flex items-center gap-1.5">
                <Instagram className="h-4 w-4 text-muted-foreground" /> Instagram Handle
              </Label>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="e.g. burger_palace_hq" className="h-11 rounded-lg" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-bold flex items-center gap-1.5">
                <Facebook className="h-4 w-4 text-muted-foreground" /> Facebook Fan Page
              </Label>
              <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="e.g. facebook.com/burgerpalace.hq" className="h-11 rounded-lg" />
            </div>
          </div>
        </Card>

        {/* 5. READONLY METADATA & COMPLIANCE SECTION */}
        <Card className="p-8 rounded-[2rem] border border-border shadow-sm space-y-4 bg-muted/10">
          <Label className="font-bold block text-sm text-muted-foreground uppercase tracking-wider">Readonly System Metadata</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs text-muted-foreground font-mono">
            <div>
              <span className="block text-[10px] text-muted-foreground/60 uppercase">Branch ID</span>
              <span className="text-foreground/80 font-bold select-all">{branch?._id || "N/A"}</span>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground/60 uppercase">Brand ID</span>
              <span className="text-foreground/80 font-bold select-all">{branch?.brandId || "N/A"}</span>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground/60 uppercase">Branch Code</span>
              <span className="text-foreground/80 font-bold">{branch?.branchCode || "N/A"}</span>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground/60 uppercase">Created Date</span>
              <span className="text-foreground/80 font-bold">{branch?.createdAt ? new Date(branch.createdAt).toLocaleString() : "N/A"}</span>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground/60 uppercase">Last Updated</span>
              <span className="text-foreground/80 font-bold">{branch?.updatedAt ? new Date(branch.updatedAt).toLocaleString() : "N/A"}</span>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground/60 uppercase">Created By (Owner ID)</span>
              <span className="text-foreground/80 font-bold">{branch?.ownerId?._id || branch?.ownerId || "N/A"}</span>
            </div>
          </div>
        </Card>

        {/* Floating actions wrapper removed */}

      </div>
    </div>
  );
}
