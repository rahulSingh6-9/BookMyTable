import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Store, MapPin, Phone, Camera, Clock, LayoutDashboard, Settings, Send } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useEffect, useCallback, useRef } from "react";
import { saveOnboardingDraft, getOnboardingDraft, deleteOnboardingDraft, submitOnboardingDraft } from "@/services/onboarding.service";

import { Briefcase } from "lucide-react";

// Import step components
import { Step0BrandSelection } from "@/components/partner/register/Step0BrandSelection";
import { Step1BasicInfo } from "@/components/partner/register/Step1BasicInfo";
import { Step2Location } from "@/components/partner/register/Step2Location";
import { Step3Contact } from "@/components/partner/register/Step3Contact";
import { Step4Media } from "@/components/partner/register/Step4Media";
import { Step5Hours } from "@/components/partner/register/Step5Hours";
import { Step6TableSetup } from "@/components/partner/register/Step6TableSetup";
import { Step7BookingSettings } from "@/components/partner/register/Step7BookingSettings";
import { Step8Review } from "@/components/partner/register/Step8Review";

// Import schemas
import { step0Schema, step1Schema, step2Schema, step3Schema, step5Schema } from "@/validation/restaurant.schema";
import { createRestaurant } from "@/services/restaurant.service";
import { z } from "zod";

const stepSchemas = [
  step0Schema,
  step1Schema,
  step2Schema,
  step3Schema,
  z.object({}), // step 4
  step5Schema,  // step 5
  z.object({}), // step 6
  z.object({}), // step 7
  z.object({})  // step 8
];

const steps = [
  { id: 0, title: "Brand", icon: Briefcase },
  { id: 1, title: "Basic Info", icon: Store },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Contact", icon: Phone },
  { id: 4, title: "Media", icon: Camera },
  { id: 5, title: "Hours", icon: Clock },
  { id: 6, title: "Table Setup", icon: LayoutDashboard },
  { id: 7, title: "Settings", icon: Settings },
  { id: 8, title: "Review", icon: Send },
];

const setNestedValue = (obj, pathArray, value) => {
  let current = obj;
  for (let i = 0; i < pathArray.length; i++) {
    const key = pathArray[i];
    if (i === pathArray.length - 1) {
      current[key] = value;
    } else {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
  }
};

const safeZodResolver = (schema) => {
  const baseResolver = zodResolver(schema);
  return async (values, context, options) => {
    try {
      return await baseResolver(values, context, options);
    } catch (error) {
      console.error("Validation resolver caught error:", error);
      if (error && error.name === "ZodError") {
        const nestedErrors = {};
        error.errors.forEach((err) => {
          setNestedValue(nestedErrors, err.path, {
            type: err.code,
            message: err.message
          });
        });
        return {
          values: {},
          errors: nestedErrors
        };
      }
      return {
        values: {},
        errors: {
          global: {
            type: "validate",
            message: error.message || "Validation failed"
          }
        }
      };
    }
  };
};

export default function PartnerRegister() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [skippedSteps, setSkippedSteps] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReviewEditMode, setIsReviewEditMode] = useState(false);
  const [returnStep, setReturnStep] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentSchema = stepSchemas[currentStep] || z.object({});

  const methods = useForm({
    resolver: safeZodResolver(currentSchema),
    mode: "onChange",
    defaultValues: {
      onboardingMode: "create_brand",
      selectedBrandId: "",
      brandName: "",
      brandDescription: "",
      brandLogo: "",
      restaurantName: "",
      slug: "",
      isManualSlug: false,
      tags: [],
      description: "",
      cuisines: [],
      priceRange: "₹₹",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
      lat: 12.9716,
      lng: 77.5946,
      contactInfo: {
        primaryPhone: {
          countryCode: "+91",
          number: "",
          e164: "",
          isVerified: false
        },
        alternatePhone: {
          countryCode: "+91",
          number: "",
          e164: ""
        },
        businessEmail: {
          value: "",
          isVerified: false
        },
        supportEmail: "",
        website: "",
        socialLinks: {
          instagram: ""
        }
      },
      tables: [],
      hours: {
        mon: { isClosed: false, open: "10:00", close: "23:00", breaks: [] },
        tue: { isClosed: false, open: "10:00", close: "23:00", breaks: [] },
        wed: { isClosed: false, open: "10:00", close: "23:00", breaks: [] },
        thu: { isClosed: false, open: "10:00", close: "23:00", breaks: [] },
        fri: { isClosed: false, open: "10:00", close: "00:00", breaks: [] },
        sat: { isClosed: false, open: "10:00", close: "00:00", breaks: [] },
        sun: { isClosed: true, open: "10:00", close: "23:00", breaks: [] }
      },
      autoConfirm: true,
      slotDuration: "60",
      advanceBookingDays: "30"
    }
  });

  const { register, handleSubmit, trigger, formState: { errors, isValid }, watch, setValue, reset } = methods;

  // 🔄 Draft Recovery System
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const response = await getOnboardingDraft();
        if (response && response.data) {
          const { currentStep: savedStep, formData, completedSteps: savedCompleted, skippedSteps: savedSkipped, draftData } = response.data;
          
          // Restore form data
          reset(formData);
          
          // Restore state
          if (savedStep !== undefined && savedStep !== null) setCurrentStep(savedStep);
          if (savedCompleted) setCompletedSteps(savedCompleted);
          if (savedSkipped) setSkippedSteps(savedSkipped);
          
          if (draftData) {
            if (draftData.isReviewEditMode !== undefined) setIsReviewEditMode(draftData.isReviewEditMode);
            if (draftData.returnStep !== undefined) setReturnStep(draftData.returnStep);
          }
          
          toast.success("Resumed from your last draft");
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    };

    loadDraft();
  }, [reset]);

  // 💾 Auto-Save System
  const saveTimeoutRef = useRef(null);

  const autoSave = useCallback(async (step, data, reviewEditState, returnStepState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveOnboardingDraft(step, data, {
          completedSteps,
          skippedSteps,
          draftData: {
            isReviewEditMode: reviewEditState,
            returnStep: returnStepState
          }
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 2000);
  }, [completedSteps, skippedSteps]);

  useEffect(() => {
    const subscription = watch((value) => {
      autoSave(currentStep, value, isReviewEditMode, returnStep);
    });
    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [watch, currentStep, autoSave, isReviewEditMode, returnStep]);

  const handleEditFromReview = async (step) => {
    setIsReviewEditMode(true);
    setReturnStep(8);
    
    // Save draft immediately with the new edit state to ensure refresh-safety!
    const currentValues = watch();
    try {
      await saveOnboardingDraft(step, currentValues, {
        completedSteps,
        skippedSteps,
        draftData: {
          isReviewEditMode: true,
          returnStep: 8
        }
      });
    } catch (error) {
      console.error("Failed to save draft on review edit redirect:", error);
    }

    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  const handleReturnToReview = async () => {
    // Validate current step fields before returning
    const fieldsToValidate = getFieldsForStep(currentStep);
    
    let isStepValid = true;
    if (fieldsToValidate.length > 0) {
      isStepValid = await trigger(fieldsToValidate);
    }
    
    if (isStepValid) {
      if (currentStep === 3) {
        const isPhoneVerified = watch("contactInfo.primaryPhone.isVerified");
        if (!isPhoneVerified) {
          toast.error("Please verify your primary phone number to continue");
          return;
        }
        const isEmailVerified = watch("contactInfo.businessEmail.isVerified");
        if (!isEmailVerified) {
          toast.error("Please verify your business email address to continue");
          return;
        }
      }

      setIsReviewEditMode(false);
      setReturnStep(null);
      
      const currentValues = watch();
      try {
        await saveOnboardingDraft(8, currentValues, {
          completedSteps: [...new Set([...completedSteps, currentStep])],
          skippedSteps: skippedSteps.filter(s => s !== currentStep),
          draftData: {
            isReviewEditMode: false,
            returnStep: null
          }
        });
      } catch (error) {
        console.error("Failed to save draft on return to review:", error);
      }

      setCurrentStep(8);
      window.scrollTo(0, 0);
    } else {
      toast.error("Please fix the validation errors on this step before returning to review.");
    }
  };

  const handleHeaderStepClick = (stepId) => {
    // If navigating back to Review step (8) via header click
    if (stepId === 8 && isReviewEditMode) {
      handleReturnToReview();
    } else {
      setCurrentStep(stepId);
    }
  };

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const nextStep = async () => {
    // Validate current step fields before proceeding
    const fieldsToValidate = getFieldsForStep(currentStep);
    
    let isStepValid = true;
    if (fieldsToValidate.length > 0) {
      isStepValid = await trigger(fieldsToValidate);
    }
    
    if (isStepValid) {
      if (currentStep === 3) {
        const isPhoneVerified = watch("contactInfo.primaryPhone.isVerified");
        if (!isPhoneVerified) {
          toast.error("Please verify your primary phone number to continue");
          return;
        }
        const isEmailVerified = watch("contactInfo.businessEmail.isVerified");
        if (!isEmailVerified) {
          toast.error("Please verify your business email address to continue");
          return;
        }
      }
      
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setSkippedSteps(prev => prev.filter(s => s !== currentStep));
      
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      window.scrollTo(0, 0);
    } else {
      toast.error("Please fix the errors before continuing.");
    }
  };

  const skipStep = () => {
    if (!skippedSteps.includes(currentStep)) {
      setSkippedSteps(prev => [...prev, currentStep]);
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0: {
        const mode = watch("onboardingMode");
        if (mode === "create_brand") return ["brandName"];
        if (mode === "add_branch") return ["selectedBrandId"];
        return [];
      }
      case 1: return ["restaurantName", "slug", "description", "cuisines", "priceRange"];
      case 2: return ["addressLine1", "city", "state", "country", "pincode", "lat", "lng"];
      case 3: return ["contactInfo"];
      case 5: return ["hours"];
      case 6: return ["tables"];
      case 7: return ["settings"];
      default: return [];
    }
  };
  const onSubmit = async () => {
    const data = methods.getValues();
    const isPhoneVerified = data.contactInfo?.primaryPhone?.isVerified;
    const isEmailVerified = data.contactInfo?.businessEmail?.isVerified;
    if (!isPhoneVerified || !isEmailVerified) {
      toast.error("Please ensure both your business phone and email are fully verified before submitting.");
      return;
    }
    setIsLoading(true);
    try {
      const priceMap = {
        "₹": "budget",
        "₹₹": "moderate",
        "₹₹₹": "premium",
        "₹₹₹₹": "luxury"
      };

      const timeToMinutes = (timeStr) => {
        if (!timeStr) return null;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return (hours * 60) + minutes;
      };

      const DEFAULT_HOURS = {
        mon: { isClosed: false, open: "10:00", close: "23:00", breaks: [] },
        tue: { isClosed: false, open: "10:00", close: "23:00", breaks: [] },
        wed: { isClosed: false, open: "10:00", close: "23:00", breaks: [] },
        thu: { isClosed: false, open: "10:00", close: "23:00", breaks: [] },
        fri: { isClosed: false, open: "10:00", close: "00:00", breaks: [] },
        sat: { isClosed: false, open: "10:00", close: "00:00", breaks: [] },
        sun: { isClosed: true, open: "10:00", close: "23:00", breaks: [] }
      };

      const finalHours = (!data.hours || Array.isArray(data.hours) || !data.hours.mon) 
        ? DEFAULT_HOURS 
        : data.hours;

      const openingHours = {};
      Object.entries(finalHours).forEach(([day, schedule]) => {
        openingHours[day] = {
          isClosed: schedule.isClosed,
          open: schedule.isClosed ? null : timeToMinutes(schedule.open),
          close: schedule.isClosed ? null : timeToMinutes(schedule.close),
          breaks: (schedule.breaks || []).map(b => ({
            start: timeToMinutes(b.start),
            end: timeToMinutes(b.end)
          }))
        };
      });

      // Helper to generate slug and normalized name
      const generateBrandMeta = (name) => {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const normalizedName = name.toLowerCase().replace(/\s+/g, "");
        return { slug, normalizedName };
      }

      const payload = {
        // Brand Data
        onboardingMode: data.onboardingMode,
        ...(data.onboardingMode === "create_brand" && {
          brandData: {
            name: data.brandName,
            description: data.brandDescription,
            logo: data.brandLogo,
            coverImage: (data.images && data.images.length > 0) ? data.images[0] : "",
            ...generateBrandMeta(data.brandName)
          }
        }),
        ...(data.onboardingMode === "add_branch" && {
          brandId: data.selectedBrandId
        }),
        
        // Restaurant Branch Data
        restaurantName: data.restaurantName,
        branchName: data.restaurantName,
        slug: data.slug,
        tags: data.tags,
        description: data.description,
        cuisines: data.cuisines,
        logo: data.brandLogo || "",
        coverImage: (data.images && data.images.length > 0) ? data.images[0] : "",
        images: data.images || [],
        tables: data.tables || [],
        
        // Root location fields expected by backend onboarding service
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        landmark: data.landmark,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        lat: data.lat,
        lng: data.lng,

        address: data.addressLine1,
        location: {
          type: "Point",
          coordinates: [parseFloat(data.lng) || 77.5946, parseFloat(data.lat) || 12.9716],
          country: data.country,
          state: data.state,
          city: data.city,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          landmark: data.landmark
        },
        contactInfo: data.contactInfo,
        phone: data.contactInfo?.primaryPhone?.e164, // Fallback for legacy fields if needed
        priceRange: priceMap[data.priceRange] || "moderate",
        openingHours,
        settings: data.settings || {}
      };

      await submitOnboardingDraft(payload);
      toast.success("Registration submitted successfully!");
      setIsSubmitted(true);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to submit registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    const props = {
      register,
      errors,
      setValue,
      watch,
      skipStep
    };

    switch (currentStep) {
      case 0: return <Step0BrandSelection />;
      case 1: return <Step1BasicInfo />;
      case 2: return <Step2Location {...props} />;
      case 3: return <Step3Contact {...props} />;
      case 4: return <Step4Media {...props} />;
      case 5: return <Step5Hours {...props} />;
      case 6: return <Step6TableSetup {...props} />;
      case 7: return <Step7BookingSettings {...props} />;
      case 8: return <Step8Review onEdit={handleEditFromReview} isLoading={isLoading} {...props} />;
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
      <div className="container mx-auto max-w-10xl">
        <div className="mb-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Register Your Restaurant</h1>
              <p className="text-muted-foreground mt-1 text-lg">Join the BookMyTable network and start growing your business.</p>
            </div>
            <div className="hidden md:block text-right">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Step {currentStep + 1} of {totalSteps}</span>
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
                  onClick={() => (completedSteps.includes(step.id) || currentStep > step.id) && handleHeaderStepClick(step.id)}
                >
                  {currentStep > step.id ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
                {step.id !== totalSteps - 1 && (
                  <div className={`absolute top-6 left-1/2 w-full h-[2px] -translate-y-1/2 transition-colors duration-500 -z-10 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.9fr_0.65fr] gap-8">
          <div>
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
                        <h2 className="text-3xl font-bold text-foreground mb-2">{steps[currentStep].title}</h2>
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
                      disabled={currentStep === 0}
                      className="rounded-full px-8 h-12 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" /> Back
                    </Button>
                    
                    {currentStep === totalSteps - 1 ? (
                      <Button 
                        type="submit"
                        disabled={isLoading}
                        className="rounded-full px-10 h-14 text-xl font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                      >
                        {isLoading ? "Submitting..." : "Submit Application"} <Send className="ml-2 h-6 w-6" />
                      </Button>
                    ) : (
                      <div className="flex items-center gap-3">
                        {isReviewEditMode && (
                          <Button 
                            type="button"
                            onClick={handleReturnToReview} 
                            className="rounded-full px-8 h-12 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center transition-all hover:scale-105 active:scale-95 gap-2"
                          >
                            Return to Review <Check className="h-5 w-5" />
                          </Button>
                        )}
                        <Button 
                          type="button"
                          onClick={nextStep} 
                          className={`rounded-full px-10 h-12 font-bold transition-all hover:translate-x-1 ${
                            isReviewEditMode 
                              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border" 
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          Continue <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </form>
              </FormProvider>
            </Card>
          </div>

          <div className="space-y-5 w-full max-w-[320px] ml-auto">
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
