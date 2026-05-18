import { Star, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function MediaPreviewPanel({ logo, gallery, name, cuisines, address }) {
  const coverImage = gallery && gallery.length > 0 ? gallery[0] : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="sticky top-24">
      <h3 className="font-bold text-foreground mb-4">Live Preview</h3>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-[2rem] border border-border overflow-hidden shadow-xl"
      >
        <div className="relative h-48 w-full bg-muted overflow-hidden">
          <motion.img 
            key={coverImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {logo && (
            <div className="absolute -bottom-6 left-6 h-20 w-20 rounded-2xl border-4 border-card bg-white shadow-lg overflow-hidden">
              <img src={logo} alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
          )}
        </div>

        <div className="pt-10 pb-6 px-6">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-xl font-bold text-foreground line-clamp-1">{name || "Your Restaurant Name"}</h4>
            <div className="flex items-center gap-1 bg-green-500/10 text-green-600 px-2 py-1 rounded-md text-xs font-bold shrink-0">
              <Star className="h-3 w-3 fill-current" /> 4.5
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-1 mb-4">
            {cuisines?.length > 0 ? cuisines.join(", ") : "North Indian, Chinese"} • ₹₹
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="line-clamp-1">{address || "123 Main Street, City"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0 text-primary" />
              <span>Closes at 11:00 PM</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
