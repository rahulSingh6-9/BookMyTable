import { useState, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, MapPin, Calendar, Clock, Users, Hash, Receipt, CreditCard, ShieldAlert, Loader2, Check, X, Wallet, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CheckoutDrawer({ restaurant }) {
  const { 
    isCheckoutOpen, closeCheckout, 
    cartItems, updateQuantity, removeFromCart, cartTotal,
    reservationDetails
  } = useCart();

  const [checkoutStep, setCheckoutStep] = useState("review"); // 'review' | 'payment' | 'processing' | 'success'
  const [paymentMethod, setPaymentMethod] = useState("pay_at_restaurant");
  const [bookingId, setBookingId] = useState(null);

  const { date, time, guests, tableId, tableType } = reservationDetails;
  
  // Fake taxes/fees calculation
  const tax = cartTotal * 0.05; // 5% tax
  const deposit = tableId ? 500 : 0; // Assume 500 deposit if table selected
  const grandTotal = cartTotal + tax + deposit;

  const handleProceedToPayment = () => {
    if (!tableId || !date || !time) {
      // Must book a table first
      closeCheckout();
      // Need a way to highlight BookingSidebar, but for now just close
      return;
    }
    setCheckoutStep("payment");
  };

  const handleConfirmAndPay = () => {
    setCheckoutStep("processing");
    
    // Fake processing
    setTimeout(() => {
      setBookingId("BK-" + Math.floor(Math.random() * 100000));
      setCheckoutStep("success");
    }, 3000);
  };

  const handleClose = () => {
    if (checkoutStep === "success") {
      // reset flow on close if success
      setCheckoutStep("review");
      // Optionally clear cart/reservation here
    }
    closeCheckout();
  };

  return (
    <Sheet open={isCheckoutOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-background border-border" side="right">
        
        {/* HEADER */}
        <SheetHeader className="p-4 border-b border-border shrink-0 bg-card">
          <SheetTitle className="text-xl font-bold flex items-center justify-between">
            {checkoutStep === "review" && "Review Order & Booking"}
            {checkoutStep === "payment" && "Payment Options"}
            {checkoutStep === "processing" && "Processing..."}
            {checkoutStep === "success" && "Reservation Confirmed"}
            {checkoutStep !== "processing" && checkoutStep !== "success" && (
              <span className="text-xs font-normal text-muted-foreground">{cartItems.length} items</span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-muted/10">
          
          {/* STEP: REVIEW */}
          {checkoutStep === "review" && (
            <div className="p-4 space-y-6">
              
              {/* 1. Reservation Summary */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <MapPin className="h-4 w-4 text-primary" /> Reservation Details
                </h4>
                {tableId && date && time ? (
                  <div className="bg-card rounded-xl border border-border p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <div className="font-bold text-foreground mb-3">{restaurant?.branchName || restaurant?.name}</div>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> <span className="font-medium text-foreground">{format(date, "MMM d, yyyy")}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> <span className="font-medium text-foreground">{time}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> <span className="font-medium text-foreground">{guests} Guests</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Hash className="h-4 w-4" /> <span className="font-medium text-foreground">{tableType}</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                    <AlertCircle className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-orange-700">Please select Date, Time, and Table from the booking panel to complete your reservation.</p>
                  </div>
                )}
              </div>

              {/* 2. Cart Items */}
              {cartItems.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Food Details</h4>
                  <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    {cartItems.map((item, index) => (
                      <div key={item._id} className={cn("p-4 flex gap-3", index !== cartItems.length - 1 && "border-b border-border/50")}>
                        <div className="h-14 w-14 rounded-lg bg-muted shrink-0 overflow-hidden">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm line-clamp-1">{item.name}</span>
                            <span className="font-bold text-sm">₹{item.price * item.quantity}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center bg-muted rounded-full px-1 py-0.5 border border-border">
                              <button onClick={() => updateQuantity(item._id, -1)} className="p-1 hover:bg-background rounded-full transition-colors"><Minus className="h-3 w-3" /></button>
                              <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item._id, 1)} className="p-1 hover:bg-background rounded-full transition-colors"><Plus className="h-3 w-3" /></button>
                            </div>
                            <button onClick={() => removeFromCart(item._id)} className="text-xs text-destructive hover:underline flex items-center gap-1">
                              <Trash2 className="h-3 w-3" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="p-3 bg-muted/30">
                      <textarea placeholder="Any special cooking instructions?" className="w-full bg-background border border-border rounded-lg text-xs p-2 focus:ring-1 focus:ring-primary outline-none" rows={2} />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Bill Summary */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Bill Summary</h4>
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Item Total</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes & Fees (5%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  {tableId && (
                    <div className="flex justify-between text-muted-foreground border-b border-border pb-3">
                      <span>Table Reservation Deposit <span className="text-[10px] bg-orange-100 text-orange-700 px-1 py-0.5 rounded ml-1">Required</span></span>
                      <span>₹{deposit.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-1">
                    <span>To Pay</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP: PAYMENT OPTIONS */}
          {checkoutStep === "payment" && (
            <div className="p-4 space-y-6">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
                <div className="text-sm text-primary font-medium mb-1">Total Amount Payable</div>
                <div className="text-3xl font-black text-primary">₹{grandTotal.toFixed(2)}</div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Select Payment Method</h4>
                <div className="grid gap-3">
                  <button onClick={() => setPaymentMethod("pay_at_restaurant")} className={cn("flex items-center gap-4 p-4 rounded-xl border text-left transition-all", paymentMethod === "pay_at_restaurant" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/30")}>
                    <div className={cn("p-2.5 rounded-full shrink-0", paymentMethod === "pay_at_restaurant" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}><Receipt className="h-5 w-5" /></div>
                    <div>
                      <div className="font-bold text-foreground">Pay at Restaurant</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Settle entire bill after dining</div>
                    </div>
                  </button>

                  <button onClick={() => setPaymentMethod("upi")} className={cn("flex items-center gap-4 p-4 rounded-xl border text-left transition-all", paymentMethod === "upi" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/30")}>
                    <div className={cn("p-2.5 rounded-full shrink-0", paymentMethod === "upi" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}><Wallet className="h-5 w-5" /></div>
                    <div>
                      <div className="font-bold text-foreground">UPI / Wallets</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Google Pay, PhonePe, Paytm</div>
                    </div>
                  </button>

                  <button onClick={() => setPaymentMethod("card")} className={cn("flex items-center gap-4 p-4 rounded-xl border text-left transition-all", paymentMethod === "card" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/30")}>
                    <div className={cn("p-2.5 rounded-full shrink-0", paymentMethod === "card" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}><CreditCard className="h-5 w-5" /></div>
                    <div>
                      <div className="font-bold text-foreground">Credit / Debit Card</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Visa, MasterCard, Amex</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: PROCESSING */}
          {checkoutStep === "processing" && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-card">
              <div className="relative mb-8">
                <div className="h-24 w-24 rounded-full border-4 border-muted flex items-center justify-center"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
                <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-[spin_2s_linear_infinite]" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Processing Payment...</h3>
              <p className="text-muted-foreground text-sm max-w-[250px] mb-8">Please do not close this window or hit back.</p>
              
              <div className="space-y-3 w-full max-w-[250px] text-left">
                <div className="flex items-center gap-3 text-sm font-medium text-primary"><Check className="h-4 w-4" /> Locking table selection</div>
                <div className="flex items-center gap-3 text-sm font-medium text-primary"><Check className="h-4 w-4" /> Sending food order to kitchen</div>
                <div className="flex items-center gap-3 text-sm font-medium text-primary animate-pulse"><Loader2 className="h-4 w-4 animate-spin" /> Awaiting gateway response</div>
              </div>
            </div>
          )}

          {/* STEP: SUCCESS */}
          {checkoutStep === "success" && (
            <div className="flex flex-col h-full bg-card">
              <div className="bg-green-600 text-white p-8 text-center rounded-b-[40px] shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur ring-4 ring-white/10 mb-4 relative z-10"><Check className="h-8 w-8 text-white" /></div>
                <h3 className="text-2xl font-bold mb-1 relative z-10">Booking Confirmed!</h3>
                <p className="text-green-100 text-sm relative z-10">Your table and food are locked in.</p>
              </div>

              <div className="p-6 flex-1">
                <div className="bg-muted/50 rounded-xl border border-border p-5 text-sm space-y-4 shadow-inner">
                  <div className="flex justify-between items-center border-b border-border/50 pb-3">
                    <span className="text-muted-foreground font-medium">Booking ID</span>
                    <span className="font-mono font-bold">{bookingId}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/50 pb-3">
                    <span className="text-muted-foreground font-medium">Amount Paid</span>
                    <span className="font-bold text-green-600">₹{grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/50 pb-3">
                    <span className="text-muted-foreground font-medium">Payment Method</span>
                    <span className="font-bold capitalize">{paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Status</span>
                    <span className="font-bold text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Confirmed</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        {checkoutStep !== "processing" && (
          <div className="p-4 border-t border-border bg-card shrink-0 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
            {checkoutStep === "review" && (
              <Button onClick={handleProceedToPayment} disabled={!tableId || !date || !time} className="w-full h-14 text-base font-bold shadow-lg">
                Proceed to Payment <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            )}
            
            {checkoutStep === "payment" && (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCheckoutStep("review")} className="h-14 px-4"><ArrowLeft className="h-5 w-5" /></Button>
                <Button onClick={handleConfirmAndPay} className="flex-1 h-14 text-base font-bold shadow-lg">
                  Pay ₹{grandTotal.toFixed(2)}
                </Button>
              </div>
            )}

            {checkoutStep === "success" && (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-12"><Share2 className="h-4 w-4 mr-2" /> Share</Button>
                <Button onClick={handleClose} className="h-12">View Dashboard</Button>
              </div>
            )}
          </div>
        )}

      </SheetContent>
    </Sheet>
  );
}

// Ensure icons used above that weren't imported are added:
import { AlertCircle, ChevronRight, ArrowLeft } from "lucide-react";
