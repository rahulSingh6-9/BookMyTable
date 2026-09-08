import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, AlertCircle, ChevronLeft, MapPin, Calendar, Clock, Users, Hash, Minus, Plus, Trash2, Receipt, Wallet, CreditCard, Check, ChevronRight, ShieldAlert } from "lucide-react";

import { useCart } from "@/context/CartContext";
import { getRestaurantDetails } from "@/services/discovery.service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RestaurantCheckout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { 
    cartItems, updateQuantity, removeFromCart, cartTotal,
    reservationDetails
  } = useCart();

  const [checkoutStep, setCheckoutStep] = useState("review"); // 'review' | 'payment' | 'processing' | 'success'
  const [paymentMethod, setPaymentMethod] = useState("pay_at_restaurant");
  const [bookingId, setBookingId] = useState(null);

  const { date, time, guests, selectedTables } = reservationDetails;

  // Fetch Restaurant Details
  const { data: detailsRes, isLoading: detailsLoading, error: detailsErr } = useQuery({
    queryKey: ["restaurant", slug],
    queryFn: () => getRestaurantDetails(slug),
    staleTime: 5 * 60 * 1000,
  });

  const restaurant = detailsRes?.data?.data;

  // Protect route (Disabled temporarily for debugging)
  useEffect(() => {
    // if (!detailsLoading && (!selectedTables || selectedTables.length === 0 || !date || !time)) {
    //   navigate(`/restaurant/${slug}`, { replace: true });
    // }
  }, [detailsLoading, selectedTables, date, time, slug, navigate]);

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
  
  const tax = (foodTotal + tablePrice) * 0.05; // 5% tax on everything
  const grandTotal = foodTotal + tablePrice + tax;

  const handleConfirmAndPay = () => {
    setCheckoutStep("processing");

    // Exact backend payload aligning with the new Booking model architecture
    const bookingPayload = {
      // 👤 User/Restaurant would go here if not injected by API
      date: date,
      time: time,
      guests: guests,
      tables: selectedTables,
      
      // 💰 Financial Data
      tablePrice: tablePrice,
      foodTotal: foodTotal,
      tax: tax,
      grandTotal: grandTotal,
      currency: "INR",
      
      // 💳 Payment Data
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === "pay_at_restaurant" ? "pending" : "paid",
      
      specialRequests: "" // from the text area in a real form
    };
    
    console.log("[ARCHITECTURE AUDIT] Booking Payload Prepared:", bookingPayload);

    // Fake processing
    setTimeout(() => {
      setBookingId("BK-" + Math.floor(Math.random() * 100000));
      setCheckoutStep("success");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-32">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-30 shadow-sm">
        <div className="container max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold line-clamp-1">{restaurant.name} - Checkout</h1>
        </div>
      </header>

      <div className="container max-w-2xl mx-auto px-4 py-8">
        
        {checkoutStep === "review" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* STEP 1: RESERVATION SUMMARY */}
            <section className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">1</span> 
                    Reservation Details
                  </h3>
                  <div className="text-right">
                    <div className="font-bold text-foreground text-lg">{restaurant?.branchName || restaurant?.name}</div>
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
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Tables & Areas ({selectedTables?.length || 0})</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTables?.map((t, idx) => (
                        <div key={idx} className="flex flex-col gap-0.5 bg-background border border-border/60 rounded-xl p-3 flex-1 min-w-[150px]">
                          <div className="flex items-center gap-2 text-foreground font-semibold line-clamp-1"><Hash className="w-4 h-4 text-primary shrink-0" /> {t.tableName || 'Unassigned'}</div>
                          <div className="text-xs text-muted-foreground font-medium pl-6">{t.sectionLabel || 'General'}, {t.floorLabel || 'Main'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* STEP 2: ORDER SUMMARY */}
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
                          <div className="h-14 w-14 rounded-xl bg-muted shrink-0 overflow-hidden border border-border">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-base line-clamp-1 text-foreground">{item.name}</div>
                            <div className="text-sm font-medium text-muted-foreground mt-0.5">₹{item.price} × {item.quantity}</div>
                          </div>
                          <div className="font-black text-base whitespace-nowrap">₹{item.price * item.quantity}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground font-medium">No food items added.</div>
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
                          <span>Tables Booking Price ({selectedTables.length})</span>
                          <span>{tablePrice > 0 ? `₹${tablePrice.toFixed(2)}` : 'Free'}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-muted-foreground border-b border-border/40 pb-4">
                        <span>Taxes & Fees (5%)</span>
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

            {/* STEP 3: GUEST INFORMATION */}
            <section className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-black text-foreground flex items-center gap-2 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">3</span> 
                  Guest Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">Full Name *</label>
                    <input type="text" placeholder="John Doe" className="w-full bg-muted/20 border border-border/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">Phone Number *</label>
                    <input type="tel" placeholder="+91 98765 43210" className="w-full bg-muted/20 border border-border/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-bold text-foreground">Email Address</label>
                    <input type="email" placeholder="john@example.com" className="w-full bg-muted/20 border border-border/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">Occasion</label>
                    <select className="w-full bg-muted/20 border border-border/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-foreground font-medium">
                      <option value="">Select an occasion (Optional)</option>
                      <option value="birthday">Birthday</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="date">Date Night</option>
                      <option value="business">Business Meal</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-bold text-foreground">Special Requests</label>
                    <textarea 
                      placeholder="Any allergies, dietary restrictions, or seating preferences?" 
                      className="w-full bg-muted/20 border border-border/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-24"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* STEP 4: PAYMENT SECTION */}
            <section className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-black text-foreground flex items-center gap-2 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">4</span> 
                  Payment Method
                </h3>
                
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                  <button onClick={() => setPaymentMethod("pay_at_restaurant")} className={cn("flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center transition-all", paymentMethod === "pay_at_restaurant" ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-sm scale-105" : "border-border/60 bg-muted/10 hover:border-primary/30 hover:bg-muted/30")}>
                    <div className={cn("p-3 rounded-full shrink-0", paymentMethod === "pay_at_restaurant" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground border shadow-sm")}><Receipt className="h-6 w-6" /></div>
                    <div>
                      <div className="font-bold text-sm text-foreground">Pay at Restaurant</div>
                    </div>
                  </button>

                  <button onClick={() => setPaymentMethod("upi")} className={cn("flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center transition-all", paymentMethod === "upi" ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-sm scale-105" : "border-border/60 bg-muted/10 hover:border-primary/30 hover:bg-muted/30")}>
                    <div className={cn("p-3 rounded-full shrink-0", paymentMethod === "upi" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground border shadow-sm")}><Wallet className="h-6 w-6" /></div>
                    <div>
                      <div className="font-bold text-sm text-foreground">UPI / Wallets</div>
                    </div>
                  </button>

                  <button onClick={() => setPaymentMethod("card")} className={cn("flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center transition-all", paymentMethod === "card" ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-sm scale-105" : "border-border/60 bg-muted/10 hover:border-primary/30 hover:bg-muted/30")}>
                    <div className={cn("p-3 rounded-full shrink-0", paymentMethod === "card" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground border shadow-sm")}><CreditCard className="h-6 w-6" /></div>
                    <div>
                      <div className="font-bold text-sm text-foreground">Credit Card</div>
                    </div>
                  </button>
                </div>

                <div className="pt-2">
                  <Button 
                    onClick={handleConfirmAndPay} 
                    className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 group"
                  >
                    {paymentMethod === "pay_at_restaurant" ? "Confirm Reservation" : `Pay ₹${grandTotal.toFixed(2)} securely`} 
                    <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4 font-medium flex items-center justify-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> By proceeding, you agree to our Cancellation Policy.
                  </p>
                </div>
              </div>
            </section>
            
            {/* BOOKING CONFIDENCE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="bg-background border border-border/60 rounded-2xl p-5 flex gap-4 text-sm text-muted-foreground shadow-sm">
                <Clock className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="font-bold text-foreground mb-1">Table Hold Policy</div>
                  <p>Your table will be held for 15 minutes past your reserved time. Please arrive promptly.</p>
                </div>
              </div>
              <div className="bg-background border border-border/60 rounded-2xl p-5 flex gap-4 text-sm text-muted-foreground shadow-sm">
                <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="font-bold text-foreground mb-1">Cancellation Policy</div>
                  <p>Free cancellation up to 2 hours before the reservation time. Deposits (if any) are non-refundable after.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {checkoutStep === "processing" && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in zoom-in-95 duration-500">
            <div className="relative mb-8">
              <div className="h-28 w-28 rounded-full border-4 border-muted flex items-center justify-center"><Loader2 className="h-12 w-12 text-[#e23744] animate-spin" /></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-[#e23744] animate-[spin_2s_linear_infinite]" />
            </div>
            <h3 className="text-3xl font-black text-foreground mb-3">Processing Payment...</h3>
            <p className="text-muted-foreground text-base max-w-[300px] mb-10">Please do not close this window or hit back.</p>
            
            <div className="space-y-4 w-full max-w-[300px] text-left bg-background p-6 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-4 text-sm font-bold text-foreground"><Check className="h-5 w-5 text-green-500" /> Locking table selection</div>
              <div className="flex items-center gap-4 text-sm font-bold text-foreground"><Check className="h-5 w-5 text-green-500" /> Sending food order to kitchen</div>
              <div className="flex items-center gap-4 text-sm font-bold text-[#e23744] animate-pulse"><Loader2 className="h-5 w-5 animate-spin" /> Awaiting gateway response</div>
            </div>
          </div>
        )}

        {checkoutStep === "success" && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-green-600 text-white p-10 text-center rounded-t-3xl shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur ring-4 ring-white/10 mb-6 relative z-10">
                <Check className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-black mb-2 relative z-10">Booking Confirmed!</h3>
              <p className="text-green-100 text-base relative z-10 font-medium">Your table and food are locked in.</p>
            </div>

            <div className="bg-background rounded-b-3xl border border-t-0 border-border p-8 shadow-md">
              <div className="bg-muted/30 rounded-2xl border border-border/60 p-6 text-sm space-y-5">
                <div className="flex justify-between items-center border-b border-border/60 pb-4">
                  <span className="text-muted-foreground font-medium text-base">Booking ID</span>
                  <span className="font-mono font-black text-base">{bookingId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/60 pb-4">
                  <span className="text-muted-foreground font-medium text-base">Amount Paid</span>
                  <span className="font-black text-green-600 text-lg">₹{grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/60 pb-4">
                  <span className="text-muted-foreground font-medium text-base">Payment Method</span>
                  <span className="font-bold capitalize text-base">{paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium text-base">Status</span>
                  <span className="font-black text-green-600 flex items-center gap-1 text-base"><Check className="h-4 w-4" /> Confirmed</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <Button onClick={() => navigate(`/restaurant/${slug}`)} className="w-full h-14 text-lg font-bold bg-[#e23744] hover:bg-[#c92f3b] text-white rounded-xl shadow-md">View Dashboard</Button>
                <Button variant="outline" className="w-full h-14 text-lg font-bold rounded-xl">Share Receipt</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
