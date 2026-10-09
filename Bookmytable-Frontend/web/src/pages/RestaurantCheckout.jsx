import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  Calendar,
  Clock,
  Users,
  Hash,
  Wallet,
  CreditCard,
  Check,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/context/CartContext";
import { getRestaurantDetails } from "@/services/discovery.service";
import { initiateBookingHold, releaseBookingHold } from "@/services/booking.service";
import { verifyRazorpayPayment } from "@/services/payment.service";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RestaurantCheckout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { 
    cartItems, cartTotal, reservationDetails, clearCart, clearReservation 
  } = useCart();
  
  const { user, isLoggedIn } = useAuth();

  const [checkoutStep, setCheckoutStep] = useState("auth_check"); // 'auth_check' | 'phone_verification' | 'review' | 'processing' | 'success'
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [bookingId, setBookingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");

  const { date, time, guests, selectedTables } = reservationDetails;

  // Fetch Restaurant Details
  const { data: detailsRes, isLoading: detailsLoading, error: detailsErr } = useQuery({
    queryKey: ["restaurant", slug],
    queryFn: () => getRestaurantDetails(slug),
    staleTime: 5 * 60 * 1000,
  });

  const restaurant = detailsRes?.data?.data;

  // Evaluate authentication and verification flow
  const isPhoneVerified =
    user?.isPhoneVerified === true ||
    user?.phone?.isVerified === true ||
    user?.verification?.phoneVerified === true;

  useEffect(() => {
    if (checkoutStep === "processing" || checkoutStep === "success") return;
    
    if (!isLoggedIn) {
      setCheckoutStep("auth_check");
    } else if (!isPhoneVerified) {
      setCheckoutStep("phone_verification");
    } else {
      setCheckoutStep("review");
    }
  }, [isLoggedIn, isPhoneVerified, checkoutStep]);

  if (detailsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading checkout...</p>
      </div>
    );
  }

  if (detailsErr || !restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
        <p className="text-muted-foreground mb-6">Could not load restaurant details.</p>
        <Button onClick={() => navigate(-1)} variant="default">Go Back</Button>
      </div>
    );
  }

  // Calculations
  const foodTotal = cartTotal;
  const tablePrice = selectedTables?.reduce((sum, t) => sum + (t.tablePrice || 0), 0) || 0;
  const tax = Math.round((foodTotal + tablePrice) * 0.05 * 100) / 100; // 5% tax
  const grandTotal = Math.round((foodTotal + tablePrice + tax) * 100) / 100;

  const formattedDate = date ? format(new Date(date), "yyyy-MM-dd") : "";

  const handleConfirmAndPay = async () => {
    if (isSubmitting) return;

    if (!selectedTables || selectedTables.length === 0) {
      toast.warning("Table required", {
        description: "Please select at least one table before continuing to payment.",
      });
      navigate(`/restaurant/${restaurant.slug}/book?date=${formattedDate}&time=${time}&guests=${guests}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Authoritative Backend Availability Check & Atomic Temporary Hold
      const holdPayload = {
        restaurantId: restaurant.restaurantId || restaurant._id,
        date: formattedDate,
        time: time,
        guests: guests || 2,
        tables: selectedTables.map((t) => ({
          tableId: t.tableId || t.id || t._id,
          tableName: t.tableName || t.name,
          tableType: t.tableType,
          tablePrice: t.tablePrice,
          sectionLabel: t.sectionLabel,
          floorLabel: t.floorLabel,
        })),
        cartItems: cartItems.map((i) => ({
          _id: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        specialRequests,
        paymentMethod,
      };

      console.log("🔒 Requesting atomic table hold from backend...", holdPayload);
      const holdRes = await initiateBookingHold(holdPayload);
      const holdData = holdRes.data.data;
      const currentBookingId = holdData.bookingId;

      // 2. Razorpay Checkout Flow
      const options = {
        key: holdData.keyId,
        amount: holdData.amount, // in paise
        currency: holdData.currency,
        name: "BookMyTable",
        description: `${restaurant.name} — Booking on ${formattedDate} at ${time}`,
        order_id: holdData.orderId,
        handler: async function (response) {
          setCheckoutStep("processing");
          try {
            // 3. Authoritative Backend Payment Verification
            await verifyRazorpayPayment({
              bookingId: currentBookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setBookingId(currentBookingId);
            clearCart();
            clearReservation();
            setCheckoutStep("success");
            toast.success("Reservation confirmed!");
          } catch (verifyErr) {
            console.error("Payment verification error:", verifyErr);
            toast.error(verifyErr.message || "Payment verification failed. Please contact support.");
            setCheckoutStep("review");
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone?.e164 || user?.phone?.number || "",
        },
        theme: {
          color: "#e23744",
        },
        modal: {
          ondismiss: async function () {
            // 4. Release Hold Immediately on Checkout Dismissal
            try {
              await releaseBookingHold(currentBookingId);
            } catch (e) {}
            setIsSubmitting(false);
            setCheckoutStep("review");
            toast.info("Checkout dismissed. Your temporary table hold has been released.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response) {
        try {
          await releaseBookingHold(currentBookingId);
        } catch (e) {}
        setIsSubmitting(false);
        setCheckoutStep("review");
        toast.error(`Payment failed: ${response.error?.description || "Declined"}. Your table has been released.`);
      });

      rzp.open();
    } catch (err) {
      setIsSubmitting(false);
      console.error("Hold/Checkout error:", err);

      if (err.data?.code === "TABLE_UNAVAILABLE" || err.message?.includes("no longer available")) {
        toast.error("This table is no longer available for the selected time.");
        navigate(`/restaurant/${restaurant.slug}/book?date=${formattedDate}&time=${time}&guests=${guests}`);
        return;
      }

      if (err.data?.code === "PHONE_VERIFICATION_REQUIRED" || err.status === 403) {
        toast.error("Phone verification required before booking.");
        setCheckoutStep("phone_verification");
        return;
      }

      toast.error(err.message || "Failed to initialize table reservation hold.");
      setCheckoutStep("review");
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-32">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-30 shadow-sm">
        <div className="container max-w-5xl mx-auto px-4 lg:px-8 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold line-clamp-1">{restaurant.name} - Checkout</h1>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto px-4 lg:px-8 py-8">
        
        {/* STEP 0A: LOGIN REQUIRED */}
        {checkoutStep === "auth_check" && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-3">Login to book a table</h2>
            <p className="text-muted-foreground mb-8 max-w-md">Please login or create an account to securely complete your reservation at {restaurant.name}.</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
              <Button onClick={() => navigate("/login?redirect=" + encodeURIComponent(window.location.pathname))} className="w-full text-lg font-bold h-12 bg-primary">Login</Button>
              <Button onClick={() => navigate("/signup?redirect=" + encodeURIComponent(window.location.pathname))} variant="outline" className="w-full text-lg font-bold h-12">Create Account</Button>
            </div>
          </div>
        )}

        {/* STEP 0B: PHONE VERIFICATION REQUIRED */}
        {checkoutStep === "phone_verification" && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-orange-500/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert className="h-10 w-10 text-orange-500" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-3">Phone verification required</h2>
            <p className="text-muted-foreground mb-8 max-w-md">For security and to ensure the restaurant can confirm your party, please verify your phone number before making a reservation.</p>
            <Button 
              onClick={() => navigate("/profile/settings/contact-verification?redirect=" + encodeURIComponent(window.location.pathname))} 
              className="w-full max-w-xs text-lg font-bold h-12 bg-orange-500 hover:bg-orange-600 text-white"
            >
              Verify Phone Number
            </Button>
          </div>
        )}

        {/* STEP 1: REVIEW & PAYMENT SELECTION */}
        {checkoutStep === "review" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* RESERVATION DETAILS */}
            <section className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">1</span> 
                    Reservation Details
                  </h3>
                  <div className="text-right">
                    <div className="font-bold text-foreground text-lg">{restaurant?.name}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-muted/20 p-5 rounded-2xl border border-border/40">
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Date</div>
                    <div className="flex items-center gap-2 text-foreground font-semibold"><Calendar className="w-4 h-4 text-primary" /> {date ? format(new Date(date), "MMM d, yyyy") : 'No Date'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Time</div>
                    <div className="flex items-center gap-2 text-foreground font-semibold"><Clock className="w-4 h-4 text-primary" /> {time || 'No Time'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Guests</div>
                    <div className="flex items-center gap-2 text-foreground font-semibold"><Users className="w-4 h-4 text-primary" /> {guests || 2} People</div>
                  </div>
                  <div className="md:col-span-4 mt-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Tables & Seating ({selectedTables?.length || 0})</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTables?.map((t, idx) => (
                        <div key={idx} className="flex flex-col gap-0.5 bg-background border border-border/60 rounded-xl p-3 flex-1 min-w-[150px]">
                          <div className="flex items-center gap-2 text-foreground font-semibold line-clamp-1"><Hash className="w-4 h-4 text-primary shrink-0" /> {t.tableName || 'Table'}</div>
                          <div className="text-xs text-muted-foreground font-medium pl-6">{t.sectionLabel || 'General'}, {t.floorLabel || 'Main'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ORDER SUMMARY */}
            <section className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-black text-foreground flex items-center gap-2 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">2</span> 
                  Order Summary
                </h3>
                
                <div className="bg-muted/10 rounded-2xl border border-border/40 overflow-hidden">
                  {cartItems.length > 0 ? (
                    <div className="divide-y divide-border/40">
                      {cartItems.map((item) => (
                        <div key={item._id} className="p-4 sm:p-5 flex gap-4 items-center hover:bg-muted/20 transition-colors">
                          {item.image && (
                            <div className="h-14 w-14 rounded-xl bg-muted shrink-0 overflow-hidden border border-border">
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-base line-clamp-1 text-foreground">{item.name}</div>
                            <div className="text-sm font-medium text-muted-foreground mt-0.5">₹{item.price} × {item.quantity}</div>
                          </div>
                          <div className="font-black text-base whitespace-nowrap">₹{item.price * item.quantity}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground text-sm font-medium">No pre-ordered food items (optional).</div>
                  )}
                  
                  <div className="p-5 sm:p-6 bg-muted/30 border-t border-border/50">
                    <div className="space-y-3 text-sm font-medium">
                      {foodTotal > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Food Subtotal</span>
                          <span>₹{foodTotal.toFixed(2)}</span>
                        </div>
                      )}
                      {selectedTables?.length > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Table Reservation Price ({selectedTables.length})</span>
                          <span>{tablePrice > 0 ? `₹${tablePrice.toFixed(2)}` : 'Free'}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-muted-foreground border-b border-border/40 pb-4">
                        <span>Taxes & Service Fees (5%)</span>
                        <span>₹{tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-end pt-2">
                        <span className="text-lg font-bold text-foreground">Grand Total</span>
                        <span className="text-2xl font-black text-primary">₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SPECIAL REQUESTS */}
            <section className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden p-6 sm:p-8">
              <h3 className="text-xl font-black text-foreground flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">3</span> 
                Special Requests (Optional)
              </h3>
              <textarea 
                placeholder="Any dietary restrictions, anniversary notes, or seating requests?" 
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full bg-muted/20 border border-border/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-24"
              />
            </section>

            {/* PAYMENT METHOD & SUBMIT */}
            <section className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-black text-foreground flex items-center gap-2 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">4</span> 
                  Payment Method
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2 mb-8">
                  <button 
                    onClick={() => setPaymentMethod("upi")} 
                    className={cn(
                      "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center transition-all", 
                      paymentMethod === "upi" ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-sm scale-105" : "border-border/60 bg-muted/10 hover:border-primary/30 hover:bg-muted/30"
                    )}
                  >
                    <div className={cn("p-3 rounded-full shrink-0", paymentMethod === "upi" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground border shadow-sm")}>
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground">UPI / Wallets</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Google Pay, PhonePe, Paytm</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setPaymentMethod("card")} 
                    className={cn(
                      "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center transition-all", 
                      paymentMethod === "card" ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-sm scale-105" : "border-border/60 bg-muted/10 hover:border-primary/30 hover:bg-muted/30"
                    )}
                  >
                    <div className={cn("p-3 rounded-full shrink-0", paymentMethod === "card" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground border shadow-sm")}>
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground">Cards / Net Banking</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Debit, Credit & Net Banking</div>
                    </div>
                  </button>
                </div>

                <div className="pt-2">
                  <Button 
                    disabled={isSubmitting}
                    onClick={handleConfirmAndPay} 
                    className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 group cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Verifying table availability...
                      </span>
                    ) : (
                      <>
                        Pay ₹{grandTotal.toFixed(2)} securely
                        <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4 font-medium flex items-center justify-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Temporary table hold is created when payment starts and releases if cancelled.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* PROCESSING SCREEN */}
        {checkoutStep === "processing" && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in zoom-in-95 duration-500">
            <div className="relative mb-8">
              <div className="h-28 w-28 rounded-full border-4 border-muted flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-foreground mb-3">Verifying Payment...</h3>
            <p className="text-muted-foreground text-base max-w-[300px] mb-10">Confirming your reservation and locking in your table.</p>
          </div>
        )}

        {/* SUCCESS SCREEN */}
        {checkoutStep === "success" && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-green-600 text-white p-10 text-center rounded-t-3xl shadow-lg relative overflow-hidden">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur ring-4 ring-white/10 mb-6 relative z-10">
                <Check className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-black mb-2 relative z-10">Booking Confirmed!</h3>
              <p className="text-green-100 text-base relative z-10 font-medium">A confirmation email has been sent to your email address.</p>
            </div>

            <div className="bg-background rounded-b-3xl border border-t-0 border-border p-8 shadow-md">
              <div className="bg-muted/30 rounded-2xl border border-border/60 p-6 text-sm space-y-5">
                <div className="flex justify-between items-center border-b border-border/60 pb-4">
                  <span className="text-muted-foreground font-medium text-base">Booking ID</span>
                  <span className="font-mono font-black text-base">{bookingId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/60 pb-4">
                  <span className="text-muted-foreground font-medium text-base">Restaurant</span>
                  <span className="font-bold text-foreground text-base">{restaurant.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/60 pb-4">
                  <span className="text-muted-foreground font-medium text-base">Date & Time</span>
                  <span className="font-semibold text-foreground text-base">{formattedDate} at {time}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/60 pb-4">
                  <span className="text-muted-foreground font-medium text-base">Amount Paid</span>
                  <span className="font-black text-green-600 text-lg">₹{grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium text-base">Status</span>
                  <span className="font-black text-green-600 flex items-center gap-1 text-base">
                    <Check className="h-4 w-4" /> Confirmed
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <Button 
                  onClick={() => navigate("/profile/bookings")} 
                  className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md cursor-pointer"
                >
                  View My Bookings
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/restaurant/${slug}`)} 
                  className="w-full h-14 text-lg font-bold rounded-xl cursor-pointer"
                >
                  Back to Restaurant
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
