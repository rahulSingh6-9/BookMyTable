import { motion } from "framer-motion";
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  Utensils, 
  ShieldCheck, 
  Briefcase,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function BusinessProfileCard({ branch, brand, membership }) {
  if (!branch) return null;

  const addressString = branch.address ? 
    `${branch.address.addressLine1}, ${branch.address.city}, ${branch.address.state}` : 
    "Address not configured";

  const contactString = branch.contact?.primaryPhone?.e164 || branch.contact?.email || "No contact info";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-border bg-card overflow-hidden shadow-card h-full flex flex-col"
    >
      <div className="bg-primary/5 p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden shadow-sm">
              {brand?.logo ? (
                <img src={brand.logo} alt={brand.name} className="h-full w-full object-cover" />
              ) : (
                <Store className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground leading-none">{branch.branchName}</h3>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                Part of <span className="font-semibold text-primary">{brand?.name || "Independent Brand"}</span>
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "capitalize",
              branch.status === 'approved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
            )}
          >
            {branch.status || 'Draft'}
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem 
            icon={MapPin} 
            label="Location" 
            value={addressString} 
          />
          <InfoItem 
            icon={Phone} 
            label="Contact" 
            value={contactString} 
          />
          <InfoItem 
            icon={Utensils} 
            label="Cuisine" 
            value={branch.cuisines?.join(", ") || "Multi-cuisine"} 
          />
          <InfoItem 
            icon={Briefcase} 
            label="Ownership" 
            value={branch.branchType?.replace('_', ' ') || "Standard Branch"} 
            className="capitalize"
          />
          <InfoItem 
            icon={ShieldCheck} 
            label="Your Role" 
            value={membership?.role?.replace('_', ' ') || "Owner"} 
            className="capitalize font-semibold text-primary"
          />
          <InfoItem 
            icon={Clock} 
            label="Operating Hours" 
            value="View Schedule" 
            isAction
          />
        </div>
      </div>

      <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
        <button className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
          Manage Business Settings <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}

function InfoItem({ icon: Icon, label, value, className, isAction = false }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{label}</p>
        <p className={cn("text-sm text-foreground truncate", className, isAction && "text-primary cursor-pointer hover:underline")}>
          {value}
        </p>
      </div>
    </div>
  );
}
