import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RestaurantGallery({ images = [], name = "Restaurant" }) {
  const [selected, setSelected] = useState(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {images.slice(0, 4).map((img, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`relative overflow-hidden rounded-lg ${i === 0 ? "col-span-2 row-span-2" : ""}`}
          >
            <img src={img} alt={`${name} photo ${i + 1}`} className="h-full w-full object-cover aspect-square hover:scale-105 transition-transform duration-300" />
            {i === 3 && images.length > 4 && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
                <span className="text-lg font-semibold text-primary-foreground">+{images.length - 4}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4"
            onClick={() => setSelected(null)}
          >
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-primary-foreground" onClick={() => setSelected(null)}>
              <X className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute left-4 text-primary-foreground" onClick={(e) => { e.stopPropagation(); setSelected((s) => (s > 0 ? s - 1 : images.length - 1)); }}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <img src={images[selected]} alt="" className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
            <Button variant="ghost" size="icon" className="absolute right-4 text-primary-foreground" onClick={(e) => { e.stopPropagation(); setSelected((s) => (s < images.length - 1 ? s + 1 : 0)); }}>
              <ChevronRight className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
