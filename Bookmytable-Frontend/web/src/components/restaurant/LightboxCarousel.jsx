import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function LightboxCarousel({ images, isOpen, onClose, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);

  // Sync state if initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Navigation handlers
  const handlePrevious = useCallback((e) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleJump = useCallback((index, e) => {
    e?.stopPropagation();
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrevious();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrevious, handleNext, onClose]);

  // Swipe handlers
  const handleDragEnd = (e, { offset, velocity }) => {
    const swipeThreshold = 50;
    if (offset.x < -swipeThreshold) {
      handleNext();
    } else if (offset.x > swipeThreshold) {
      handlePrevious();
    }
  };

  // Animation variants
  const slideVariants = {
    hiddenRight: { x: "100%", opacity: 0 },
    hiddenLeft: { x: "-100%", opacity: 0 },
    visible: { x: "0%", opacity: 1 },
    exitRight: { x: "-100%", opacity: 0 },
    exitLeft: { x: "100%", opacity: 0 },
  };

  if (!isOpen || !images || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm touch-none"
        onClick={onClose}
      >
        {/* Top Bar: Counter & Close */}
        <div className="absolute top-0 left-0 w-full p-4 lg:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
          <div className="text-white/80 font-medium tracking-widest text-sm bg-black/40 px-4 py-1.5 rounded-full border border-white/10">
            {currentIndex + 1} / {images.length}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white/70 hover:text-white bg-black/40 hover:bg-white/20 p-2 rounded-full transition-colors border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Image Area */}
        <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
          
          {/* Previous Button (Desktop) */}
          {images.length > 1 && (
            <button
              onClick={handlePrevious}
              className="hidden md:flex absolute left-4 lg:left-8 z-50 text-white/50 hover:text-white bg-black/20 hover:bg-black/60 p-3 rounded-full transition-all hover:scale-110 border border-white/10 hover:border-white/30 backdrop-blur-md"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              custom={direction}
              variants={slideVariants}
              initial={direction > 0 ? "hiddenRight" : "hiddenLeft"}
              animate="visible"
              exit={direction > 0 ? "exitRight" : "exitLeft"}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              onClick={(e) => e.stopPropagation()}
              className="absolute max-w-full max-h-[80vh] object-contain cursor-grab active:cursor-grabbing select-none"
              alt={`Gallery image ${currentIndex + 1}`}
            />
          </AnimatePresence>

          {/* Next Button (Desktop) */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="hidden md:flex absolute right-4 lg:right-8 z-50 text-white/50 hover:text-white bg-black/20 hover:bg-black/60 p-3 rounded-full transition-all hover:scale-110 border border-white/10 hover:border-white/30 backdrop-blur-md"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>

        {/* Thumbnails Strip */}
        {images.length > 1 && (
          <div 
            className="w-full pb-6 pt-4 px-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-2 lg:gap-3 overflow-x-auto max-w-4xl scrollbar-hide px-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleJump(idx, e)}
                  className={cn(
                    "relative flex-shrink-0 h-16 w-16 lg:h-20 lg:w-20 rounded-md overflow-hidden transition-all duration-300",
                    idx === currentIndex 
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-black opacity-100 scale-105" 
                      : "opacity-40 hover:opacity-100 hover:scale-105"
                  )}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
