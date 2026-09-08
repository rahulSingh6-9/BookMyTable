import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, ShieldCheck, CheckCircle2, ChevronRight, 
  ArrowRight, DollarSign, Wallet, Building2, User,
  Banknote, AlertCircle, History, Landmark, Sparkles, Clock, Server, UploadCloud, ChevronLeft, Loader2,
  FileCheck, Shield, Phone, Mail, FileText, CheckCircle, Smartphone, LineChart, SlidersHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// MOCK DATA
const PROVIDERS = {
  razorpay: { name: "Razorpay", symbol: "R", colorHeader: "bg-blue-600", colorIcon: "text-blue-600 bg-white", gradient: "from-blue-600 to-blue-900" },
  stripe: { name: "Stripe", symbol: "S", colorHeader: "bg-indigo-600", colorIcon: "text-indigo-600 bg-white", gradient: "from-indigo-600 to-indigo-900" },
  cashfree: { name: "Cashfree", symbol: "C", colorHeader: "bg-orange-600", colorIcon: "text-orange-600 bg-white", gradient: "from-orange-600 to-orange-900" },
};

export default function OwnerPaymentsSettings() {
  const { toast } = useToast();
  
  // MAIN STATE
  const [integrationState, setIntegrationState] = useState("disconnected"); // disconnected, onboarding, submitting, redirecting, connected
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  // ONBOARDING WIZARD STATE
  const [wizardStep, setWizardStep] = useState(1);
  const [submittingProgress, setSubmittingProgress] = useState({ text: "Initializing...", percent: 0 });

  // MOCK FORM STATE FOR BANK PREVIEW
  const [bankDetails, setBankDetails] = useState({
    name: "BookMyTable Restaurant Pvt Ltd",
    account: "123456789921",
    ifsc: "HDFC0001234"
  });

  const [businessType, setBusinessType] = useState("llc");

  // DASHBOARD STATE
  const [activeDashboardStep, setActiveDashboardStep] = useState(4);
  const [activeDashboardTab, setActiveDashboardTab] = useState("overview");

  // === HANDLERS ===
  const startOnboarding = (providerKey) => {
    setSelectedProvider(providerKey);
    setIntegrationState("onboarding");
    setWizardStep(1);
  };

  const nextWizardStep = () => {
    if (wizardStep < 4) setWizardStep(wizardStep + 1);
  };

  const prevWizardStep = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1);
  };

  const finishOnboarding = () => {
    setIntegrationState("submitting");
    
    // Simulate complex submission phases
    setSubmittingProgress({ text: "Securing connection...", percent: 10 });
    
    setTimeout(() => setSubmittingProgress({ text: "Verifying Business Identity (KYC)...", percent: 40 }), 1000);
    setTimeout(() => setSubmittingProgress({ text: "Validating Bank Settlement Account...", percent: 70 }), 2500);
    setTimeout(() => setSubmittingProgress({ text: "Finalizing Gateway Configuration...", percent: 90 }), 4000);
    
    setTimeout(() => {
      setIntegrationState("redirecting");
      
      // Simulate redirect delay
      setTimeout(() => {
        setIntegrationState("connected");
        toast({
          title: "Gateway Connected",
          description: `Your ${PROVIDERS[selectedProvider].name} gateway has been successfully integrated.`,
        });
      }, 3000);
    }, 5000);
  };

  const reconnectGateway = () => {
    setIntegrationState("disconnected");
    setSelectedProvider(null);
  };

  // === RENDERERS ===

  // 1. DISCONNECTED STATE (Empty State)
  if (integrationState === "disconnected") {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 min-h-[80vh] flex flex-col justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto space-y-3">
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center bg-primary/5 rounded-full mb-3">
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20 animate-spin-slow"></div>
            <Landmark className="h-10 w-10 text-primary relative z-10" />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 shadow-lg">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-extrabold tracking-tight">Accept Payments Online</h1>
          <p className="text-muted-foreground text-sm">
            Connect your payout account to start receiving reservation deposits and full payments directly to your bank account.
          </p>
        </motion.div>

        {/* SECTION 2: Choose Payment Provider */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pt-8">
          <h3 className="text-xl font-bold mb-6 text-center">Supported Providers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-2xl border-border shadow-sm bg-muted/20 hover:border-primary/50 transition-all cursor-pointer hover:-translate-y-1 group" onClick={() => startOnboarding('razorpay')}>
              <CardContent className="p-6 text-center space-y-4 mt-6">
                <div className="mx-auto bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-blue-600 font-extrabold text-2xl">R</span>
                </div>
                <h3 className="font-semibold text-lg">Razorpay</h3>
                <p className="text-sm text-muted-foreground">Standard 2% fee per transaction. Next day payouts via IMPS/NEFT.</p>
                <Button variant="outline" className="w-full rounded-full">Connect Gateway</Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border shadow-sm bg-muted/20 hover:border-primary/50 transition-all cursor-pointer hover:-translate-y-1 group" onClick={() => startOnboarding('stripe')}>
              <CardContent className="p-6 text-center space-y-4 mt-6">
                <div className="mx-auto bg-indigo-500/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-indigo-600 font-extrabold text-2xl">S</span>
                </div>
                <h3 className="font-semibold text-lg">Stripe</h3>
                <p className="text-sm text-muted-foreground">Premium global gateway. 2.9% + 30¢ per transaction.</p>
                <Button variant="outline" className="w-full rounded-full">Connect Gateway</Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border shadow-sm bg-muted/20 hover:border-primary/50 transition-all cursor-pointer hover:-translate-y-1 group" onClick={() => startOnboarding('cashfree')}>
              <CardContent className="p-6 text-center space-y-4 mt-6">
                <div className="mx-auto bg-orange-500/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-orange-600 font-extrabold text-2xl">C</span>
                </div>
                <h3 className="font-semibold text-lg">Cashfree</h3>
                <p className="text-sm text-muted-foreground">Specialized local payouts. 1.9% per transaction.</p>
                <Button variant="outline" className="w-full rounded-full">Connect Gateway</Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. ONBOARDING WIZARD OVERLAY (Fintech Redesign)
  if (integrationState === "onboarding") {
    const provider = PROVIDERS[selectedProvider];

    return (
      <div className="fixed inset-0 z-[100] bg-background flex animate-in fade-in zoom-in-95 duration-300">
        {/* LEFT SIDEBAR: Branding & Vertical Stepper */}
        <div className={`hidden md:flex flex-col w-80 lg:w-96 bg-gradient-to-br ${provider.gradient} text-white p-8 relative overflow-hidden`}>
          {/* Glassmorphic Background Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-black opacity-10 blur-3xl"></div>

          <div className="relative z-10 flex items-center gap-3 mb-16">
            <div className={`w-10 h-10 rounded-xl ${provider.colorIcon} flex items-center justify-center shadow-lg`}>
              <span className="font-extrabold text-lg">{provider.symbol}</span>
            </div>
            <span className="font-bold text-xl tracking-tight">{provider.name}</span>
          </div>

          <div className="relative z-10 flex-1">
            <h2 className="text-2xl font-bold mb-8">Let's get you set up</h2>
            
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-white/20">
              {[
                { s: 1, label: "Business Details", desc: "Entity type and location" },
                { s: 2, label: "Verify Identity", desc: "Owner KYC and documents" },
                { s: 3, label: "Payout Account", desc: "Where to send your money" },
                { s: 4, label: "Review & Submit", desc: "Final verification" },
              ].map(step => (
                <div key={step.s} className="relative flex items-center gap-4">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 z-10 bg-inherit transition-colors duration-300 ${
                    wizardStep > step.s ? 'bg-emerald-400 border-emerald-400 text-white' :
                    wizardStep === step.s ? 'bg-white border-white text-blue-600' : 'bg-transparent border-white/40 text-white/40'
                  }`}>
                    {wizardStep > step.s ? <CheckCircle2 className="w-4 h-4" /> : <div className={`w-2 h-2 rounded-full ${wizardStep === step.s ? 'bg-blue-600' : 'bg-transparent'}`}></div>}
                  </div>
                  <div className={`transition-opacity duration-300 ${wizardStep >= step.s ? 'opacity-100' : 'opacity-50'}`}>
                    <p className="font-bold text-sm">{step.label}</p>
                    <p className="text-xs text-white/70">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-auto bg-black/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-white/80 leading-relaxed">
                Your data is securely encrypted. We use bank-level security to protect your sensitive information.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Form Area */}
        <div className="flex-1 flex flex-col bg-muted/10 relative">
          
          {/* Mobile Header */}
          <div className="md:hidden h-16 border-b border-border px-4 flex items-center justify-between bg-background">
            <span className="font-bold">{provider.name} Onboarding</span>
            <Button variant="ghost" size="sm" onClick={reconnectGateway}>Cancel</Button>
          </div>
          
          <div className="absolute top-4 right-8 hidden md:block">
            <Button variant="ghost" className="text-muted-foreground hover:bg-muted/50" onClick={reconnectGateway}>
              Save & Exit
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-20 flex justify-center">
            <div className="w-full max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={wizardStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  
                  {/* STEP 1: BUSINESS INFO */}
                  {wizardStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">Business Details</h2>
                        <p className="text-muted-foreground mt-2">Tell us about your restaurant to comply with financial regulations.</p>
                      </div>

                      <div className="space-y-4">
                        <Label>Business Structure</Label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { id: 'sole', label: 'Sole Prop', icon: User },
                            { id: 'llc', label: 'LLC / Pvt Ltd', icon: Building2 },
                            { id: 'corp', label: 'Corporation', icon: Landmark }
                          ].map(type => (
                            <div 
                              key={type.id}
                              onClick={() => setBusinessType(type.id)}
                              className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                                businessType === type.id ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                              }`}
                            >
                              <type.icon className="h-6 w-6" />
                              <span className="text-xs font-bold text-center">{type.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Legal Business Name</Label>
                          <Input className="h-12 bg-card rounded-xl" placeholder="Exactly as it appears on your tax documents" defaultValue="BookMyTable Restaurant Pvt Ltd" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tax ID / PAN / EIN</Label>
                            <Input className="h-12 bg-card rounded-xl uppercase" placeholder="ABCDE1234F" defaultValue="ABCDE1234F" />
                          </div>
                          <div className="space-y-2">
                            <Label>GST Number (Optional)</Label>
                            <Input className="h-12 bg-card rounded-xl uppercase" placeholder="22AAAAA0000A1Z5" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Registered Address</Label>
                          <Input className="h-12 bg-card rounded-xl" placeholder="Street Address" defaultValue="123 Culinary Lane, Food District" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: IDENTITY VERIFICATION */}
                  {wizardStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">Verify Identity</h2>
                        <p className="text-muted-foreground mt-2">We are required to verify the identity of the business owner.</p>
                      </div>

                      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-border/50">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-semibold text-sm">Phone Verification</p>
                              <p className="text-xs text-muted-foreground">+91 98765 43210</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Verified</Badge>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-border/50">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-semibold text-sm">Email Verification</p>
                              <p className="text-xs text-muted-foreground">owner@bookmytable.com</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Verified</Badge>
                        </div>

                        <div className="space-y-4 pt-2">
                          <Label>Owner Name</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <Input className="h-12 bg-muted/20 rounded-xl" defaultValue="Rahul" />
                            <Input className="h-12 bg-muted/20 rounded-xl" defaultValue="Singh" />
                          </div>
                        </div>

                        <div className="space-y-4 pt-2">
                          <Label>Upload Government ID</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors bg-muted/10 h-32">
                              <FileCheck className="h-6 w-6 text-primary" />
                              <span className="text-xs font-semibold text-primary">Front of ID</span>
                            </div>
                            <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors bg-muted/10 h-32">
                              <UploadCloud className="h-6 w-6 text-muted-foreground" />
                              <span className="text-xs font-semibold text-muted-foreground">Back of ID</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: BANK ACCOUNT */}
                  {wizardStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">Payout Account</h2>
                        <p className="text-muted-foreground mt-2">Where should we send your money? You will receive payouts daily.</p>
                      </div>

                      {/* Interactive Bank Card Preview */}
                      <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl p-6 relative overflow-hidden text-white flex flex-col justify-between border border-slate-700">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                          <Landmark className="w-24 h-24" />
                        </div>
                        <div className="flex justify-between items-start relative z-10">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Secure Settlement Account</span>
                          </div>
                        </div>
                        <div className="relative z-10 space-y-4">
                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Account Number</p>
                            <p className="font-mono text-xl tracking-widest">{bankDetails.account ? bankDetails.account.replace(/\d(?=\d{4})/g, "• ") : "•••• •••• •••• ••••"}</p>
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Account Holder</p>
                              <p className="font-bold">{bankDetails.name || "YOUR NAME"}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">IFSC</p>
                              <p className="font-bold">{bankDetails.ifsc || "BANK0000000"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <div className="space-y-2">
                          <Label>Account Holder Name</Label>
                          <Input 
                            className="h-12 rounded-xl" 
                            value={bankDetails.name}
                            onChange={(e) => setBankDetails({...bankDetails, name: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Account Number</Label>
                            <Input 
                              type="password" 
                              className="h-12 rounded-xl" 
                              value={bankDetails.account}
                              onChange={(e) => setBankDetails({...bankDetails, account: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Routing / IFSC</Label>
                            <Input 
                              className="h-12 rounded-xl uppercase" 
                              value={bankDetails.ifsc}
                              onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value.toUpperCase()})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: REVIEW */}
                  {wizardStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">Review & Submit</h2>
                        <p className="text-muted-foreground mt-2">Please verify your details. We will begin processing your application immediately.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                          <div className="flex justify-between items-center pb-3 border-b border-border/50">
                            <div className="flex items-center gap-2 text-foreground font-semibold">
                              <Building2 className="w-4 h-4 text-muted-foreground" /> Business Details
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setWizardStep(1)} className="text-blue-600 h-6 px-2 text-xs hover:bg-blue-50">Edit</Button>
                          </div>
                          <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Legal Name</p>
                              <p className="font-medium">BookMyTable Restaurant Pvt Ltd</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Tax ID</p>
                              <p className="font-medium">ABCDE1234F</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Address</p>
                              <p className="font-medium">123 Culinary Lane, Food District</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                          <div className="flex justify-between items-center pb-3 border-b border-border/50">
                            <div className="flex items-center gap-2 text-foreground font-semibold">
                              <ShieldCheck className="w-4 h-4 text-muted-foreground" /> Identity Verification
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setWizardStep(2)} className="text-blue-600 h-6 px-2 text-xs hover:bg-blue-50">Edit</Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Rahul Singh</p>
                              <p className="text-xs text-muted-foreground">ID uploaded & Phone Verified</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                          <div className="flex justify-between items-center pb-3 border-b border-border/50">
                            <div className="flex items-center gap-2 text-foreground font-semibold">
                              <Landmark className="w-4 h-4 text-muted-foreground" /> Settlement Account
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setWizardStep(3)} className="text-blue-600 h-6 px-2 text-xs hover:bg-blue-50">Edit</Button>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center border border-slate-700">
                              <Wallet className="w-4 h-4 text-slate-300" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">•••• {bankDetails.account.slice(-4) || "9921"}</p>
                              <p className="text-xs text-muted-foreground">{bankDetails.ifsc || "HDFC0001234"}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex gap-3 text-sm">
                          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                          <p>By submitting this form, you agree to the Payment Gateway Terms of Service and authorize BookMyTable to initiate deposits to your connected account.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NAVIGATION FOOTER */}
                  <div className="pt-8 flex justify-between items-center border-t border-border mt-8">
                    {wizardStep > 1 ? (
                      <Button variant="outline" size="lg" className="rounded-xl px-6" onClick={prevWizardStep}>
                        Back
                      </Button>
                    ) : <div></div>}
                    
                    {wizardStep < 4 ? (
                      <Button size="lg" className="rounded-xl px-8 ml-auto" onClick={nextWizardStep}>
                        Continue
                      </Button>
                    ) : (
                      <Button size="lg" className="rounded-xl px-8 ml-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20" onClick={finishOnboarding}>
                        Submit Application
                      </Button>
                    )}
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. SUBMITTING STATE
  if (integrationState === "submitting") {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Processing Application</h2>
            <p className="text-muted-foreground">Securely configuring your fintech integration.</p>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-6 text-left shadow-sm">
            <p className="text-sm font-semibold mb-3">{submittingProgress.text}</p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${submittingProgress.percent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right mt-2">Estimated time: ~5 seconds</p>
          </div>
        </div>
      </div>
    );
  }

  // 4. REDIRECTING STATE
  if (integrationState === "redirecting") {
    return (
      <div className="fixed inset-0 z-[100] bg-emerald-600 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500 text-white">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1, rotate: [0, 10, 0] }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="bg-white/20 p-8 rounded-full shadow-2xl"
        >
          <CheckCircle2 className="h-24 w-24 text-white" />
        </motion.div>
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-extrabold tracking-tight">Application Approved!</h2>
          <p className="text-emerald-100 text-xl font-medium flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Returning to BookMyTable Dashboard...
          </p>
        </div>
      </div>
    );
  }

  // 5. CONNECTED STATE (Dashboard)
  const provider = selectedProvider ? PROVIDERS[selectedProvider] : PROVIDERS['razorpay'];
  
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* SECTION 1: Compact Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${provider.colorIcon} flex items-center justify-center shadow-sm border border-border`}>
            <span className="font-extrabold text-xl">{provider.symbol}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              {provider.name} Gateway
              <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none px-2 py-0.5 text-[10px] uppercase tracking-wider">Connected</Badge>
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Identity Verified</span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Payouts Enabled</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            Manage Account
          </Button>
          <Button variant="outline" size="sm" className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50" onClick={reconnectGateway}>
            Disconnect
          </Button>
        </div>
      </div>

      {/* SEGMENTED TAB BAR */}
      <div className="flex flex-wrap items-center gap-1 bg-muted/50 p-1.5 rounded-2xl w-fit border border-border/50">
        <button 
          onClick={() => setActiveDashboardTab("overview")}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeDashboardTab === "overview" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
        >
          <LineChart className="w-4 h-4" /> Overview
        </button>
        <button 
          onClick={() => setActiveDashboardTab("configuration")}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeDashboardTab === "configuration" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
        >
          <SlidersHorizontal className="w-4 h-4" /> Configuration
        </button>
        <button 
          onClick={() => setActiveDashboardTab("health")}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeDashboardTab === "health" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
        >
          <Building2 className="w-4 h-4" /> Bank & Health
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeDashboardTab === "overview" && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* SECTION 3: Payout Summary Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-xl border-border shadow-sm">
                <CardContent className="p-5 flex flex-col justify-center h-full">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Settlement</p>
                    <div className="p-2 bg-blue-50 rounded-lg"><Clock className="w-4 h-4 text-blue-600" /></div>
                  </div>
                  <p className="text-2xl font-extrabold mt-3">$1,245.00</p>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-border shadow-sm">
                <CardContent className="p-5 flex flex-col justify-center h-full">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Next Settlement</p>
                    <div className="p-2 bg-emerald-50 rounded-lg"><Landmark className="w-4 h-4 text-emerald-600" /></div>
                  </div>
                  <p className="text-xl font-bold mt-3 text-emerald-600">Tomorrow</p>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-border shadow-sm">
                <CardContent className="p-5 flex flex-col justify-center h-full">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Transferred (30d)</p>
                    <div className="p-2 bg-purple-50 rounded-lg"><ArrowRight className="w-4 h-4 text-purple-600" /></div>
                  </div>
                  <p className="text-2xl font-extrabold mt-3">$14,230.50</p>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-border shadow-sm">
                <CardContent className="p-5 flex flex-col justify-center h-full">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Failed Payouts</p>
                    <div className="p-2 bg-slate-50 rounded-lg"><AlertCircle className="w-4 h-4 text-slate-400" /></div>
                  </div>
                  <p className="text-2xl font-extrabold mt-3">0</p>
                </CardContent>
              </Card>
            </div>

            {/* SECTION 6: Recent Payout Activity */}
            <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" /> Recent Payout Activity
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 text-xs">View All</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Date</th>
                        <th className="px-6 py-3 font-semibold">Amount</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold text-right">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">Oct 24, 2026</td>
                        <td className="px-6 py-4 font-semibold">$345.00</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">Processed</Badge>
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground font-mono text-xs">SET_982374X</td>
                      </tr>
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">Oct 23, 2026</td>
                        <td className="px-6 py-4 font-semibold">$412.50</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">Processed</Badge>
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground font-mono text-xs">SET_982373X</td>
                      </tr>
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">Oct 22, 2026</td>
                        <td className="px-6 py-4 font-semibold">$290.00</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">Processed</Badge>
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground font-mono text-xs">SET_982372X</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeDashboardTab === "configuration" && (
          <motion.div 
            key="configuration"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* SECTION 5: Payment Configuration */}
            <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" /> Payment Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  <div className="flex items-center justify-between p-5 hover:bg-muted/5 transition-colors">
                    <div>
                      <Label className="text-sm font-semibold">Accept Online Payments</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Master switch to allow customers to pay via the portal.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-5 hover:bg-muted/5 transition-colors">
                    <div>
                      <Label className="text-sm font-semibold">Require Reservation Deposits</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Charge a flat fee to secure tables during peak hours.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-5 hover:bg-muted/5 transition-colors opacity-70">
                    <div>
                      <Label className="text-sm font-semibold">Accept Full Pre-payments</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Allow users to pay the estimated bill amount upfront.</p>
                    </div>
                    <Switch disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SECTION 2: Money Flow Visualizer (Refined) */}
            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-primary" /> Fee Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3 relative">
                  {/* Connecting Line */}
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border -z-10"></div>
                  
                  <div className="flex items-center gap-3 text-sm bg-card p-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-border"><User className="w-4 h-4 text-slate-600"/></div>
                    <div className="flex-1 flex justify-between">
                      <span className="font-medium text-muted-foreground">Customer Pays</span>
                      <span className="font-semibold">$100.00</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm bg-card p-2">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center border border-red-100"><CreditCard className="w-4 h-4 text-red-500"/></div>
                    <div className="flex-1 flex justify-between text-muted-foreground">
                      <span>Gateway Fee (1.5%)</span>
                      <span>-$1.50</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm bg-card p-2">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100"><Server className="w-4 h-4 text-orange-500"/></div>
                    <div className="flex-1 flex justify-between text-muted-foreground">
                      <span>Platform Fee</span>
                      <span>-$1.00</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200"><Building2 className="w-4 h-4 text-emerald-600"/></div>
                    <div className="flex-1 flex justify-between text-emerald-700">
                      <span className="font-bold">You Receive</span>
                      <span className="font-extrabold">$97.50</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeDashboardTab === "health" && (
          <motion.div 
            key="health"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* SECTION 4: Settlement Account Card */}
            <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Settlement Account
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-4 bg-muted/20 p-3 rounded-xl border border-border/50">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 shrink-0">
                    <Wallet className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-sm truncate">{bankDetails.name || "BookMyTable Restaurant Pvt Ltd"}</p>
                    <p className="text-xs text-muted-foreground font-mono">•••• {bankDetails.account ? bankDetails.account.slice(-4) : "9921"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-muted/20 rounded-xl border border-border/50">
                    <p className="text-muted-foreground mb-1 uppercase tracking-wider font-semibold text-[10px]">Frequency</p>
                    <p className="font-medium">Daily (T+1)</p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-xl border border-border/50">
                    <p className="text-muted-foreground mb-1 uppercase tracking-wider font-semibold text-[10px]">Status</p>
                    <p className="font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Active</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 text-xs h-8">Edit Details</Button>
                  <Button variant="outline" className="flex-1 text-xs h-8">Change Bank</Button>
                </div>
              </CardContent>
            </Card>

            {/* SECTION 7: System Health & Webhooks */}
            <Card className="rounded-2xl border-border shadow-sm h-fit">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" /> System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Webhook Status
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">Connected</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    API Keys
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">Valid</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Account KYC
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">Verified</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
