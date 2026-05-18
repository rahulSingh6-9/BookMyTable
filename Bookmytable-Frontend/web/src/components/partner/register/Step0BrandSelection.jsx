import { useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, PlusCircle, FastForward, Search, Building, CheckCircle2, Info, Upload, X, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyBrands } from "@/services/onboarding.service";

export function Step0BrandSelection() {
  const { register, watch, setValue, trigger, formState: { errors } } = useFormContext();
  const [brands, setBrands] = useState([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);

  const onboardingMode = watch("onboardingMode") || "create_brand";
  const selectedBrandId = watch("selectedBrandId");
  const brandLogo = watch("brandLogo");

  // Fetch accessible brands for the user
  useEffect(() => {
    if (onboardingMode === "add_branch") {
      fetchBrands();
    }
  }, [onboardingMode]);

  const fetchBrands = async () => {
    setIsLoadingBrands(true);
    try {
      const response = await getMyBrands();
      if (response && response.success && Array.isArray(response.brands)) {
        setBrands(response.brands);
      } else {
        setBrands([]);
      }
    } catch (error) {
      console.error("[Step0BrandSelection] ❌ Failed to fetch brands:", error);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("brandLogo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = (e) => {
    e.stopPropagation();
    setValue("brandLogo", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Safe filtering matching searched name or slug
  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const options = [
    {
      id: "create_brand",
      title: "Create New Brand",
      description: "Start fresh with a brand new, stunning identity for your business.",
      icon: PlusCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30"
    },
    {
      id: "add_branch",
      title: "Add Branch To Existing Brand",
      description: "Already have a brand? Link this new location to an existing brand identity.",
      icon: Building2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30"
    },
    {
      id: "skip",
      title: "Skip For Now",
      description: "Launch in quick start mode. We'll set up a temporary internal brand.",
      icon: FastForward,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30"
    }
  ];

  return (
    <div className="space-y-10">
      {/* Cards Selector Option */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((option) => (
          <motion.div
            key={option.id}
            whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setValue("onboardingMode", option.id);
              if (option.id !== "add_branch") {
                setValue("selectedBrandId", "");
                setValue("selectedBrandName", "");
              }
              trigger("onboardingMode");
            }}
            className={`relative cursor-pointer rounded-[2rem] border-2 p-6 transition-all duration-300 flex flex-col items-center text-center gap-4 ${
              onboardingMode === option.id 
                ? `${option.borderColor} bg-card shadow-xl ring-4 ring-primary/10 scale-[1.02]` 
                : "border-border bg-muted/20 hover:bg-card hover:shadow-lg hover:border-muted-foreground/20"
            }`}
          >
            <div className={`h-16 w-16 rounded-2xl ${option.bgColor} ${option.color} flex items-center justify-center shadow-inner`}>
              <option.icon className="h-8 w-8" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-foreground">{option.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {option.description}
              </p>
            </div>

            {onboardingMode === option.id && (
              <motion.div 
                layoutId="active-check-badge"
                className="absolute -top-2.5 -right-2.5 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg border-4 border-background"
              >
                <CheckCircle2 className="h-5 w-5" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Mode Specific Containers */}
      <motion.div
        layout
        initial={false}
        animate={{ opacity: 1, height: "auto" }}
        className="overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {/* Create New Brand Flow */}
          {onboardingMode === "create_brand" && (
            <motion.div 
              key="create_brand_form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-8 md:p-10 rounded-[2.5rem] bg-card border border-border shadow-inner space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">New Brand Identity</h4>
                  <p className="text-sm text-muted-foreground">Setup the overarching global brand details.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="brandName" className="text-sm font-semibold ml-1">Brand Name <span className="text-destructive">*</span></Label>
                    <Input 
                      id="brandName" 
                      placeholder="e.g. Burger Kingdom, Spice Kitchen" 
                      className="h-12 rounded-xl border border-border focus-visible:ring-primary/20 bg-muted/20"
                      {...register("brandName")}
                    />
                    {errors.brandName && (
                      <p className="text-xs text-destructive mt-1 ml-1">{errors.brandName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandDescription" className="text-sm font-semibold ml-1">Brand Description</Label>
                    <Textarea 
                      id="brandDescription" 
                      placeholder="Brief description of the brand identity, culinary vision, or philosophy..." 
                      className="min-h-[140px] rounded-xl border border-border focus-visible:ring-primary/20 bg-muted/20 resize-none"
                      {...register("brandDescription")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold ml-1">Brand Logo</Label>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div 
                    onClick={handleFileClick}
                    className={`h-52 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group relative overflow-hidden ${
                      brandLogo ? "border-primary bg-primary/5 shadow-inner" : "border-border bg-muted/10 hover:bg-muted/25"
                    }`}
                  >
                    {brandLogo ? (
                      <>
                        <img src={brandLogo} alt="Brand Logo Preview" className="h-full w-full object-contain p-4" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                              <Upload className="h-5 w-5" />
                           </div>
                           <button 
                             type="button"
                             onClick={removeLogo}
                             className="h-10 w-10 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                           >
                              <X className="h-5 w-5" />
                           </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform shadow-sm">
                          <PlusCircle className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Click to upload brand logo</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Add Branch to Existing Brand Flow */}
          {onboardingMode === "add_branch" && (
            <motion.div 
              key="add_branch_selector"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-8 md:p-10 rounded-[2.5rem] bg-card border border-border shadow-inner space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Select Existing Brand</h4>
                    <p className="text-sm text-muted-foreground">Select a brand where you are an Owner, Co-Owner, or Manager.</p>
                  </div>
                </div>
                {selectedBrandId && (
                  <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-widest shrink-0 self-start md:self-auto">
                    ✓ Brand Selected
                  </Badge>
                )}
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Type to search your authorized brands..." 
                  className="pl-12 h-14 rounded-2xl border border-border focus-visible:ring-primary/20 text-lg bg-muted/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Brand Grid Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar pt-2">
                {isLoadingBrands ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-border flex items-center gap-4 bg-muted/5">
                      <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" />
                      <div className="space-y-2.5 flex-1">
                        <Skeleton className="h-5 w-1/2 rounded" />
                        <Skeleton className="h-4 w-1/3 rounded" />
                      </div>
                    </div>
                  ))
                ) : filteredBrands.length > 0 ? (
                  filteredBrands.map((brand) => {
                    const isSelected = selectedBrandId === brand._id;
                    return (
                      <motion.div
                        key={brand._id}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setValue("selectedBrandId", brand._id, { shouldValidate: true });
                          setValue("selectedBrandName", brand.name);
                          trigger("selectedBrandId");
                        }}
                        className={`p-4 rounded-[1.75rem] border-2 cursor-pointer transition-all flex items-center gap-4 ${
                          isSelected 
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/5 ring-2 ring-primary/10" 
                            : "border-border bg-muted/10 hover:border-primary/40 hover:bg-muted/20"
                        }`}
                      >
                        <div className="h-16 w-16 rounded-2xl bg-background border border-border flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm relative">
                          {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="h-full w-full object-cover" />
                          ) : (
                            <Building className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-foreground truncate">{brand.name}</h5>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <Badge variant="secondary" className="text-[10px] font-bold h-5 uppercase tracking-wider text-muted-foreground px-2 rounded-full border">
                              slug: {brand.slug}
                            </Badge>
                            <Badge className="bg-purple-500/10 text-purple-700 hover:bg-purple-500/10 border-none text-[9px] font-extrabold h-5 px-2 rounded-full uppercase tracking-widest shrink-0">
                              {brand.branchCount || 0} {brand.branchCount === 1 ? 'branch' : 'branches'}
                            </Badge>
                          </div>
                        </div>

                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-md"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-14 text-center space-y-4">
                    <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto text-muted-foreground/60 shadow-inner">
                      <Search className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-foreground font-bold text-lg">No brands available</p>
                      <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                        {searchTerm 
                          ? `We couldn't find any brands matching "${searchTerm}". Please try a different query.`
                          : "You don't have owner or manager permissions on any brands yet."
                        }
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setValue("onboardingMode", "create_brand");
                        trigger("onboardingMode");
                      }}
                      className="text-primary font-bold hover:underline inline-flex items-center gap-1 bg-primary/10 px-5 py-2.5 rounded-full text-sm hover:scale-105 active:scale-95 transition-transform"
                    >
                      <PlusCircle className="h-4 w-4" /> Create a new brand
                    </button>
                  </div>
                )}
              </div>

              {errors.selectedBrandId && (
                <p className="text-xs text-destructive mt-3 ml-1 font-semibold">{errors.selectedBrandId.message}</p>
              )}
            </motion.div>
          )}

          {/* Skip for Now Flow */}
          {onboardingMode === "skip" && (
            <motion.div 
              key="skip_mode_info"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/25 shadow-inner flex flex-col md:flex-row gap-6 items-center"
            >
              <div className="h-20 w-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-inner">
                <Info className="h-10 w-10 animate-pulse" />
              </div>
              <div className="space-y-2.5 text-center md:text-left">
                <h4 className="text-xl font-bold text-amber-700">Quick Start Mode</h4>
                <p className="text-amber-900/70 text-sm leading-relaxed max-w-xl">
                  Choosing to skip will automatically set up a lightweight internal brand context. 
                  This gets you directly to configuring your branch details and tables immediately. 
                  You can seamlessly customize, split, or scale your brand hierarchy and franchise settings at any time from the dashboard after creation.
                </p>
                <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                  {["Zero Friction", "Rapid Setup", "Multi-Tenant Ready"].map((tag) => (
                    <Badge key={tag} className="bg-amber-500/10 text-amber-800 border-amber-500/20 shadow-none font-bold uppercase tracking-widest text-[9px] px-2.5 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
