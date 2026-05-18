import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Store, MapPin, Phone, Camera, Clock, LayoutDashboard, Settings, Edit2, Briefcase, 
  CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Eye, ShieldCheck, Users, Calendar, 
  ArrowRight, Loader2, Landmark 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Step8Review({ watch, onEdit, isLoading }) {
  const data = watch();
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [progressVal, setProgressVal] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  // Progressive submitting stepper animation helper
  const submissionSteps = [
    { title: "Brand Identity", desc: "Verifying multi-tenant brand structures..." },
    { title: "Restaurant Provisioning", desc: "Creating primary branch registry..." },
    { title: "Seating Configuration", desc: "Bulk generating interactive tables..." },
    { title: "Booking Slot Timings", desc: "Applying reservation calendars & interval systems..." },
    { title: "Ownership Access", desc: "Initializing primary owner membership..." },
    { title: "Kafka Event Stream", desc: "Broadcasting restaurant.created event..." },
    { title: "Draft Completion", desc: "Securing database state and clearing draft..." }
  ];

  useEffect(() => {
    if (isLoading) {
      setProgressVal(0);
      setActiveStep(0);
      const interval = setInterval(() => {
        setProgressVal((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const nextVal = prev + Math.floor(Math.random() * 4) + 1;
          
          // Map progress value to active step index
          const stepIdx = Math.min(
            Math.floor((nextVal / 100) * submissionSteps.length),
            submissionSteps.length - 1
          );
          setActiveStep(stepIdx);
          
          return nextVal;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Form helpers
  const getCuisinesList = () => {
    return data.cuisines || [];
  };

  const getTablesCount = () => {
    return (data.tables || []).length;
  };

  const getTotalSeats = () => {
    return (data.tables || []).reduce((sum, t) => sum + (parseInt(t.capacity) || 0), 0);
  };

  const getMediaList = () => {
    // Collect all uploaded media or show default placeholder
    if (data.uploadedMedia && data.uploadedMedia.length > 0) {
      return data.uploadedMedia.map(m => m.url);
    }
    if (data.images && data.images.length > 0) {
      return data.images;
    }
    return ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"];
  };

  const mediaList = getMediaList();

  const getFormattedHours = () => {
    if (!data.hours || Array.isArray(data.hours)) return null;
    const days = [
      { key: "mon", label: "Mon" },
      { key: "tue", label: "Tue" },
      { key: "wed", label: "Wed" },
      { key: "thu", label: "Thu" },
      { key: "fri", label: "Fri" },
      { key: "sat", label: "Sat" },
      { key: "sun", label: "Sun" }
    ];
    return days.map(d => ({
      day: d.label,
      ...data.hours[d.key]
    }));
  };

  const formattedHours = getFormattedHours();

  // Onboarding Health Check Analysis Engine
  const runHealthCheck = () => {
    const findings = [];
    let score = 100;

    // Table checks
    if (getTablesCount() === 0) {
      findings.push({
        type: "error",
        text: "Table configuration missing. Please add at least one table to accept reservations.",
        step: 6
      });
      score -= 30;
    } else if (getTotalSeats() < 6) {
      findings.push({
        type: "warning",
        text: "Low seating capacity detected. Confirm this represents your full restaurant floor plan.",
        step: 6
      });
      score -= 5;
    }

    // Media checks
    const hasMedia = (data.images && data.images.length > 0) || (data.uploadedMedia && data.uploadedMedia.length > 0);
    if (!hasMedia) {
      findings.push({
        type: "warning",
        text: "No gallery media uploaded. Beautiful images increase reservation conversion rate by 3x.",
        step: 4
      });
      score -= 10;
    }

    // Settings checks
    if (!data.settings?.timeSlotInterval) {
      findings.push({
        type: "info",
        text: "Using default 30-minute booking intervals. Customize this in booking settings.",
        step: 7
      });
    }

    // Contact Verification checks
    if (!data.contactInfo?.primaryPhone?.isVerified) {
      findings.push({
        type: "warning",
        text: "Owner primary phone has not completed OTP verification.",
        step: 3
      });
      score -= 10;
    }

    return { findings, score };
  };

  const { findings, score } = runHealthCheck();

  const sections = [
    { 
      title: "Brand", 
      icon: Briefcase, 
      step: 0, 
      fields: [
        { label: "Onboarding Mode", value: data.onboardingMode === "create_brand" ? "Creating Brand" : data.onboardingMode === "add_branch" ? "Adding to Brand" : "Standalone Branch" },
        { label: "Brand Name", value: data.onboardingMode === "create_brand" ? data.brandName : data.onboardingMode === "add_branch" ? data.selectedBrandName : "Internal Brand" },
      ]
    },
    { 
      title: "Basic Info", 
      icon: Store, 
      step: 1, 
      fields: [
        { label: "Restaurant Name", value: data.restaurantName },
        { label: "Cuisines & Tags", value: getCuisinesList().length > 0 ? getCuisinesList().join(", ") : "Not selected" },
        { label: "Price Tier", value: data.priceRange === "₹" ? "Budget (₹)" : data.priceRange === "₹₹" ? "Moderate (₹₹)" : data.priceRange === "₹₹₹" ? "Premium (₹₹₹)" : "Luxury (₹₹₹₹)" },
      ]
    },
    { 
      title: "Location", 
      icon: MapPin, 
      step: 2, 
      fields: [
        { label: "Registered Address", value: `${data.addressLine1 || ""}, ${data.addressLine2 ? data.addressLine2 + ", " : ""}${data.city || ""}, ${data.state || ""} - ${data.pincode || ""}` },
        { label: "Coordinates (GPS)", value: `Lat: ${parseFloat(data.lat || 0).toFixed(4)}, Lng: ${parseFloat(data.lng || 0).toFixed(4)}` },
      ]
    },
    { 
      title: "Contact", 
      icon: Phone, 
      step: 3, 
      fields: [
        { label: "Primary Phone", value: data.contactInfo?.primaryPhone?.e164 || "Not provided", isVerified: data.contactInfo?.primaryPhone?.isVerified },
        { label: "Business Email", value: data.contactInfo?.businessEmail?.value || "Not provided" },
      ]
    },
    { 
      title: "Settings & Buffers", 
      icon: Settings, 
      step: 7, 
      fields: [
        { label: "Booking Slot Interval", value: `${data.settings?.timeSlotInterval || 30} minutes` },
        { label: "Average Slot Duration", value: `${data.settings?.slotDuration || 60} minutes` },
        { label: "Advance Booking Days", value: `${data.settings?.advanceBookingDays || 30} days ahead` },
        { label: "Auto-Accept Reservations", value: data.settings?.autoAcceptBookings ? "Enabled" : "Manual review required" },
      ]
    },
  ];

  return (
    <div className="space-y-10 relative">
      {/* 1. Progressive Submission Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <Card className="max-w-xl w-full p-8 md:p-12 rounded-[2.5rem] border-border shadow-2xl space-y-8 bg-card flex flex-col items-center text-center">
              <div className="relative h-28 w-28 flex items-center justify-center">
                <svg className="absolute inset-0 transform -rotate-90 w-full h-full">
                  <circle 
                    cx="56" cy="56" r="48" 
                    className="stroke-muted fill-none" 
                    strokeWidth="8"
                  />
                  <motion.circle 
                    cx="56" cy="56" r="48" 
                    className="stroke-primary fill-none" 
                    strokeWidth="8" 
                    strokeDasharray="301.6"
                    strokeDashoffset={301.6 - (301.6 * progressVal) / 100}
                    strokeLinecap="round"
                    transition={{ ease: "easeInOut" }}
                  />
                </svg>
                <div className="text-2xl font-extrabold text-primary">{Math.round(progressVal)}%</div>
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-extrabold text-foreground tracking-tight">Creating Restaurant Branch</h3>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm">Please do not refresh or close this tab while we publish your restaurant settings live.</p>
              </div>

              {/* Progress Steps */}
              <div className="w-full max-w-md space-y-3.5 bg-secondary/20 p-6 rounded-3xl border border-border">
                {submissionSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                        idx < activeStep 
                          ? "bg-primary text-primary-foreground" 
                          : idx === activeStep 
                            ? "bg-primary/20 text-primary border border-primary animate-pulse" 
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {idx < activeStep ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>
                      <div>
                        <span className={`text-xs font-bold ${idx === activeStep ? "text-primary" : idx < activeStep ? "text-foreground/80" : "text-muted-foreground"}`}>{step.title}</span>
                        <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                    {idx === activeStep && (
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Onboarding Health Check Score Panel */}
      <div className="p-6 md:p-8 rounded-[2rem] border border-border bg-card shadow-lg flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
          <Sparkles className="h-24 w-24 text-primary" />
        </div>

        {/* Circular score display */}
        <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
          <svg className="absolute inset-0 transform -rotate-90 w-full h-full">
            <circle cx="48" cy="48" r="40" className="stroke-muted fill-none" strokeWidth="6" />
            <circle 
              cx="48" cy="48" r="40" 
              className={`fill-none ${score >= 90 ? "stroke-emerald-500" : score >= 70 ? "stroke-amber-500" : "stroke-red-500"}`} 
              strokeWidth="6" 
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * score) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-foreground">{score}</span>
            <span className="text-[8px] uppercase tracking-widest font-extrabold text-muted-foreground">Ready</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <Badge variant="outline" className="border-primary/20 text-primary font-bold">Onboarding Audit System</Badge>
            {score >= 95 ? (
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold">Elite Readiness Score</Badge>
            ) : score >= 80 ? (
              <Badge className="bg-amber-500/10 text-amber-500 border-none font-bold">Highly Prepared</Badge>
            ) : (
              <Badge className="bg-red-500/10 text-red-500 border-none font-bold">Needs Attention</Badge>
            )}
          </div>
          <h4 className="text-xl font-bold tracking-tight">Enterprise Onboarding Quality Score</h4>
          <p className="text-sm text-muted-foreground max-w-xl">
            We analyzed your multi-tenant parameters against SaaS configuration best practices. You're fully cleared to continue, but resolving recommendations below increases reservation probability.
          </p>
        </div>
      </div>

      {/* 3. Onboarding Health Alerts */}
      {findings.length > 0 && (
        <div className="space-y-3 bg-destructive/5 p-6 rounded-3xl border border-destructive/10">
          <div className="flex items-center gap-2 mb-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h5 className="font-extrabold text-sm uppercase tracking-wider">Recommendations for Optimizing Bookings</h5>
          </div>
          <div className="space-y-3">
            {findings.map((f, i) => (
              <div key={i} className="flex items-start justify-between gap-4 text-sm bg-background/50 p-3.5 rounded-2xl border border-border/40 hover:border-border transition-all">
                <div className="flex gap-3">
                  <div className={`mt-0.5 shrink-0 ${f.type === 'error' ? 'text-red-500' : f.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <span className="text-foreground/80 leading-relaxed text-xs">{f.text}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7 text-primary hover:text-primary/80 font-bold shrink-0"
                  onClick={() => onEdit(f.step)}
                >
                  Configure
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Split Dashboard Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.8fr] gap-8">
        
        {/* Left Hand: Review Section Cards */}
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <Card key={idx} className="group p-6 rounded-[2rem] border border-border bg-card shadow-sm hover:border-primary/30 transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-all duration-300 group-hover:scale-105">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-extrabold text-sm uppercase tracking-widest text-foreground">{section.title}</h4>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full text-xs h-8 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                  onClick={() => onEdit(section.step)}
                >
                  <Edit2 className="h-3 w-3" /> Edit
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {section.fields.map((field, fIdx) => (
                  <div key={fIdx} className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{field.label}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground leading-relaxed">{field.value || "Not configured"}</span>
                      {field.isVerified && (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[9px] h-4 flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {/* Special Card for Decoupled Table Layout */}
          <Card className="group p-6 rounded-[2rem] border border-border bg-card shadow-sm hover:border-primary/30 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-all duration-300 group-hover:scale-105">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-sm uppercase tracking-widest text-foreground">Table Configuration</h4>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full text-xs h-8 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                onClick={() => onEdit(6)}
              >
                <Edit2 className="h-3 w-3" /> Edit
              </Button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {getTablesCount() === 0 ? (
                <p className="text-sm text-muted-foreground italic">No tables defined yet</p>
              ) : (
                data.tables.map((t, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3.5 py-1.5 font-extrabold text-xs bg-muted/65 border border-border rounded-xl">
                    {t.tableCode} <span className="text-muted-foreground font-normal">({t.capacity}p • {t.type})</span>
                  </Badge>
                ))
              )}
            </div>
          </Card>

          {/* Special Card for Operational Hours */}
          <Card className="group p-6 rounded-[2rem] border border-border bg-card shadow-sm hover:border-primary/30 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-all duration-300 group-hover:scale-105">
                  <Clock className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-sm uppercase tracking-widest text-foreground">Weekly Operational Hours</h4>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full text-xs h-8 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                onClick={() => onEdit(5)}
              >
                <Edit2 className="h-3 w-3" /> Edit
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3.5">
              {formattedHours ? (
                formattedHours.map((h, i) => (
                  <div key={i} className={`p-3 rounded-2xl border text-center transition-all ${
                    h.isClosed 
                      ? "bg-muted/30 border-dashed border-border text-muted-foreground" 
                      : "bg-primary/5 border-primary/10 text-foreground"
                  }`}>
                    <p className="text-[10px] uppercase font-bold tracking-widest mb-1.5">{h.day}</p>
                    {h.isClosed ? (
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Closed</span>
                    ) : (
                      <span className="text-[10px] font-bold tracking-tight text-primary block leading-none">{h.open} - {h.close}</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic col-span-7">No hours configured</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Hand: Live Business Listing Preview Mock */}
        <div className="space-y-6">
          <div className="sticky top-28">
            <div className="flex items-center gap-2 mb-4 text-foreground opacity-90">
              <Eye className="h-5 w-5 text-primary" />
              <h4 className="font-black text-sm uppercase tracking-widest">Live Business Listing Preview</h4>
            </div>

            <Card className="rounded-[2.5rem] border-none bg-card shadow-2xl overflow-hidden border border-border">
              {/* Media gallery slideshow */}
              <div className="h-52 w-full relative bg-muted overflow-hidden">
                <img 
                  src={mediaList[activeMediaIndex]} 
                  alt="Restaurant Gallery" 
                  className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                />
                
                {/* Visual badges over media */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge className="bg-primary/95 text-primary-foreground font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md rounded-full shadow-lg border-none px-3.5 py-1">
                    {data.priceRange || "₹₹"}
                  </Badge>
                  {data.contactInfo?.primaryPhone?.isVerified && (
                    <Badge className="bg-emerald-500/90 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-full shadow-lg border-none px-3.5 py-1 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </Badge>
                  )}
                </div>

                {/* Slideshow dot indicators */}
                {mediaList.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 p-2 rounded-full backdrop-blur-sm">
                    {mediaList.map((_, mIdx) => (
                      <button 
                        key={mIdx} 
                        type="button"
                        onClick={() => setActiveMediaIndex(mIdx)}
                        className={`h-2 w-2 rounded-full transition-all ${
                          mIdx === activeMediaIndex ? "bg-white scale-125 w-4" : "bg-white/50 hover:bg-white"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Mock restaurant details card */}
              <div className="p-6 md:p-8 space-y-6">
                
                {/* Brand header / Avatar layout */}
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 text-primary-foreground flex items-center justify-center font-black text-xl shadow-lg border border-white/10 shrink-0">
                    {data.brandLogo ? (
                      <img src={data.brandLogo} alt="Logo" className="h-full w-full object-cover rounded-2xl" />
                    ) : (
                      (data.restaurantName || "B").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-foreground tracking-tight leading-tight">{data.restaurantName || "New Restaurant Branch"}</h3>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-xs text-muted-foreground font-semibold">{data.city || "Bangalore"}, India</span>
                      <span className="text-[8px] text-muted-foreground">•</span>
                      <span className="text-xs text-primary font-bold">{data.cuisines?.slice(0, 3).join(", ") || "Casual Dining"}</span>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-border" />

                {/* Summary Badges Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3 bg-secondary/35 rounded-2xl border border-border flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest leading-none mb-1">Capacity</p>
                      <span className="text-xs font-extrabold text-foreground">{getTotalSeats()} Seats</span>
                    </div>
                  </div>

                  <div className="p-3 bg-secondary/35 rounded-2xl border border-border flex items-center gap-3">
                    <LayoutDashboard className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest leading-none mb-1">Floor Plan</p>
                      <span className="text-xs font-extrabold text-foreground">{getTablesCount()} Tables</span>
                    </div>
                  </div>

                  <div className="p-3 bg-secondary/35 rounded-2xl border border-border flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest leading-none mb-1">Booking Window</p>
                      <span className="text-xs font-extrabold text-foreground">{data.settings?.advanceBookingDays || 30} Days</span>
                    </div>
                  </div>

                  <div className="p-3 bg-secondary/35 rounded-2xl border border-border flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest leading-none mb-1">Slot Intervals</p>
                      <span className="text-xs font-extrabold text-foreground">{data.settings?.timeSlotInterval || 30} Mins</span>
                    </div>
                  </div>
                </div>

                {/* Reservation action bar mockup */}
                <div className="bg-primary/5 p-4 rounded-3xl border border-primary/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary leading-none">Instant Reservation</span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Fast confirmation via bookmytable.com</p>
                  </div>
                  <Button size="sm" className="rounded-full px-4 h-9 font-extrabold bg-primary text-primary-foreground text-xs shadow-lg hover:scale-105 transition-transform flex items-center gap-1">
                    Book Now <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
