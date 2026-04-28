import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Store, MapPin, Phone, Camera, Clock, LayoutDashboard, Settings, Send } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// Import step components
import { Step1BasicInfo } from "@/components/partner/register/Step1BasicInfo";
import { Step2Location } from "@/components/partner/register/Step2Location";
import { Step3Contact } from "@/components/partner/register/Step3Contact";
import { Step4Media } from "@/components/partner/register/Step4Media";
import { Step5Hours } from "@/components/partner/register/Step5Hours";
import { Step6TableSetup } from "@/components/partner/register/Step6TableSetup";
import { Step7BookingSettings } from "@/components/partner/register/Step7BookingSettings";
import { Step8Review } from "@/components/partner/register/Step8Review";

// Import schemas
import { step1Schema, step2Schema, step3Schema } from "@/validation/restaurant.schema";
import { createRestaurant } from "@/services/restaurant.service";
import { z } from "zod";

const stepSchemas = [
  step1Schema,
  step2Schema,
  step3Schema,
  z.object({}), // step 4
  z.object({}), // step 5
  z.object({}), // step 6
  z.object({}), // step 7
  z.object({})  // step 8
];

const steps = [
  { id: 1, title: "Basic Info", icon: Store },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Contact", icon: Phone },
  { id: 4, title: "Media", icon: Camera },
  { id: 5, title: "Hours", icon: Clock },
  { id: 6, title: "Table Setup", icon: LayoutDashboard },
  { id: 7, title: "Settings", icon: Settings },
  { id: 8, title: "Review", icon: Send },
];

export default function PartnerRegister() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentSchema = stepSchemas[currentStep - 1] || z.object({});

  const methods = useForm({
    resolver: zodResolver(currentSchema),
    mode: "onChange",
    defaultValues: {
      restaurantName: "",
      description: "",
      cuisines: [],
      priceRange: "₹₹",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      isPhoneVerified: false,
      email: "",
      tables: [],
      hours: [],
      autoConfirm: true,
      slotDuration: "60",
      advanceBookingDays: "30"
    }
  });

  const { register, handleSubmit, trigger, formState: { errors, isValid }, watch, setValue } = methods;

  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  const nextStep = async () => {
    // Validate current step fields before proceeding
    const fieldsToValidate = getFieldsForStep(currentStep);
    
    let isStepValid = true;
    if (fieldsToValidate.length > 0) {
      isStepValid = await trigger(fieldsToValidate);
    }
    
    if (isStepValid) {
      if (currentStep === 3) {
        const isVerified = watch("isPhoneVerified");
        if (!isVerified) {
          toast.error("Please verify your phone number to continue");
          return;
        }
      }
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    } else {
      toast.error("Please fix the errors before continuing.");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 1: return ["restaurantName", "description", "cuisines", "priceRange"];
      case 2: return ["address", "city", "state", "pincode"];
      case 3: return ["phone", "email"];
      default: return [];
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const priceMap = {
        "₹": "budget",
        "₹₹": "moderate",
        "₹₹₹": "premium",
        "₹₹₹₹": "luxury"
      };

      const openingHours = {};
      if (data.hours && data.hours.length > 0) {
        data.hours.forEach(h => {
          openingHours[h.day.toLowerCase()] = {
            isOpen: h.isOpen,
            slots: h.isOpen && h.open && h.close ? [{ open: h.open, close: h.close }] : []
          };
        });
      }

      const payload = {
        name: data.restaurantName,
        description: data.description,
        cuisines: data.cuisines,
        address: data.address,
        city: data.city,
        phone: data.phone,
        priceRange: priceMap[data.priceRange] || "moderate",
        openingHours,
      };

      await createRestaurant(payload);
      toast.success("Registration submitted successfully!");
      setIsSubmitted(true);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Failed to submit registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    const props = {
      register,
      errors,
      setValue,
      watch
    };

    switch (currentStep) {
      case 1: return <Step1BasicInfo />;
      case 2: return <Step2Location {...props} />;
      case 3: return <Step3Contact {...props} />;
      case 4: return <Step4Media {...props} />;
      case 5: return <Step5Hours {...props} />;
      case 6: return <Step6TableSetup {...props} />;
      case 7: return <Step7BookingSettings {...props} />;
      case 8: return <Step8Review onEdit={setCurrentStep} {...props} />;
      default: return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="h-24 w-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Registration Successful!</h1>
          <p className="text-muted-foreground">
            Your restaurant application has been received and is currently under review. 
            Our team will contact you within 24-48 hours.
          </p>
          <Button size="lg" className="w-full rounded-full h-12" onClick={() => window.location.href = "/owner"}>
            Go to Owner Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Register Your Restaurant</h1>
              <p className="text-muted-foreground mt-1 text-lg">Join the BookMyTable network and start growing your business.</p>
            </div>
            <div className="hidden md:block text-right">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Step {currentStep} of {totalSteps}</span>
              <Progress value={progress} className="h-2 w-48 mt-2" />
            </div>
          </div>

          <div className="hidden md:flex justify-between items-center bg-card p-6 rounded-[2rem] border border-border shadow-md">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                <div 
                  className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer ${
                    currentStep >= step.id ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-110" : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                >
                  {currentStep > step.id ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
                {step.id !== totalSteps && (
                  <div className={`absolute top-6 left-1/2 w-full h-[2px] -translate-y-1/2 transition-colors duration-500 -z-10 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-8 md:p-12 rounded-[2.5rem] border-border shadow-xl overflow-hidden min-h-[600px] flex flex-col bg-card">
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1"
                    >
                      <div className="mb-10">
                        <h2 className="text-3xl font-bold text-foreground mb-2">{steps[currentStep-1].title}</h2>
                        <div className="h-1 w-20 bg-primary rounded-full" />
                      </div>
                      
                      {renderStep()}
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-12 flex justify-between items-center pt-8 border-t border-border">
                    <Button 
                      type="button"
                      variant="ghost" 
                      onClick={prevStep} 
                      disabled={currentStep === 1}
                      className="rounded-full px-8 h-12 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" /> Back
                    </Button>
                    
                    {currentStep === totalSteps ? (
                      <Button 
                        type="submit"
                        disabled={isLoading}
                        className="rounded-full px-10 h-14 text-xl font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                      >
                        {isLoading ? "Submitting..." : "Submit Application"} <Send className="ml-2 h-6 w-6" />
                      </Button>
                    ) : (
                      <Button 
                        type="button"
                        onClick={nextStep} 
                        className="rounded-full px-10 h-12 font-bold transition-all hover:translate-x-1"
                      >
                        Continue <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </form>
              </FormProvider>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-8 rounded-[2rem] bg-foreground text-primary-foreground border-none shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Store className="h-24 w-24" />
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">Need Assistance?</h3>
              <p className="text-sm opacity-80 leading-relaxed mb-6 relative z-10">
                Our restaurant experts are ready to help you complete your profile and optimize your listing for maximum visibility.
              </p>
              <Button variant="secondary" className="w-full rounded-full h-12 font-bold shadow-lg relative z-10">Chat with Expert</Button>
            </Card>
            
            <div className="p-8 rounded-[2rem] border border-border bg-card shadow-lg">
              <h3 className="font-bold text-foreground text-lg mb-6">Partner Benefits</h3>
              <ul className="space-y-5">
                {[
                  "Premium listing in search results",
                  "Verified partner badge",
                  "Direct booking management",
                  "Real-time customer reviews",
                  "Weekly performance insights"
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 text-sm text-muted-foreground items-start">
                    <div className="h-6 w-6 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 rounded-[2rem] bg-muted/30 border border-border">
               <p className="text-[11px] text-muted-foreground leading-relaxed text-center italic">
                 "Joining BookMyTable helped us increase our weekend reservations by 40% in just two months."
                 <br />
                 <span className="font-bold not-italic mt-2 block">— Chef Marco, Italian Garden</span>
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
