import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShoppingBag, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function FloatingCartFooter({ forceShow = false }) {
  const { cartCount, cartTotal, reservationDetails } = useCart();
  const { slug: paramSlug } = useParams();
  const navigate = useNavigate();

  // Safely get slug if it's not in params for some reason
  const slug = paramSlug || window.location.pathname.split("/")[2];

  const shouldShow = cartCount > 0 || forceShow || (reservationDetails?.selectedTables && reservationDetails.selectedTables.length > 0);

  const totalTablePrice = reservationDetails?.selectedTables?.reduce((sum, t) => sum + (t.tablePrice || 0), 0) || 0;
  const numTables = reservationDetails?.selectedTables?.length || 0;

  const handleNavigate = () => {
    if (numTables === 0) {
      toast.warning("Table Required", {
        description: "Please select a table to proceed with your reservation."
      });
      return;
    }

    try {
      console.log("Navigating to checkout for slug:", slug);
      if (slug) {
        navigate(`/restaurant/${slug}/checkout`);
      } else {
        console.error("Slug is missing in FloatingCartFooter");
        // Fallback
        const fallbackSlug = window.location.pathname.split("/")[2];
        if (fallbackSlug) {
          navigate(`/restaurant/${fallbackSlug}/checkout`);
        }
      }
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none"
        >
          <div className="container max-w-5xl mx-auto flex justify-center lg:justify-start">
            <div className="pointer-events-auto w-full lg:w-2/3 bg-primary text-primary-foreground rounded-xl shadow-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {cartCount > 0 ? (
                  <>
                    <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-medium opacity-90">{cartCount} ITEM{cartCount !== 1 ? 'S' : ''} ADDED</div>
                      <div className="font-bold">₹{cartTotal + totalTablePrice} <span className="text-xs font-normal opacity-80 pl-1">plus taxes</span></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{numTables} Table{numTables !== 1 ? 's' : ''} Selected</div>
                      <div className="text-xs opacity-80">Ready to complete reservation</div>
                    </div>
                  </>
                )}
              </div>
              <Button 
                onClick={handleNavigate}
                className="bg-white text-primary hover:bg-white/90 font-bold px-6 h-11 cursor-pointer"
              >
                Proceed to Checkout <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
