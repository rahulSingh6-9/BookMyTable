import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, MapPin, Phone, Camera, Clock, LayoutDashboard, Settings, Edit2 } from "lucide-react";

export function Step8Review({ watch, onEdit }) {
  const data = watch();

  const sections = [
    { title: "Basic Info", icon: Store, step: 1, fields: [
      { label: "Name", value: data.restaurantName },
      { label: "Cuisines", value: (data.cuisines || []).join(", ") },
      { label: "Price Range", value: data.priceRange },
    ]},
    { title: "Location", icon: MapPin, step: 2, fields: [
      { label: "Address", value: `${data.address}, ${data.city}, ${data.state} - ${data.pincode}` },
    ]},
    { title: "Contact", icon: Phone, step: 3, fields: [
      { label: "Phone", value: data.phone },
      { label: "Email", value: data.email },
    ]},
    { title: "Settings", icon: Settings, step: 7, fields: [
      { label: "Slot Duration", value: `${data.slotDuration || 60} mins` },
      { label: "Auto-confirm", value: data.autoConfirm ? "Yes" : "No" },
    ]},
  ];

  return (
    <div className="space-y-8">
      <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl mb-8">
        <h3 className="text-lg font-bold text-primary mb-2">Almost there!</h3>
        <p className="text-sm text-muted-foreground opacity-90">Please review your restaurant details. Once submitted, our team will verify the information before going live.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, i) => (
          <div key={i} className="group relative p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                 <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center text-primary">
                    <section.icon className="h-4 w-4" />
                 </div>
                 <h4 className="font-bold text-sm uppercase tracking-wide">{section.title}</h4>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onEdit(section.step)}
              >
                <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
            <div className="space-y-3">
              {section.fields.map((field, fi) => (
                <div key={fi}>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">{field.label}</p>
                  <p className="text-sm font-medium text-foreground leading-relaxed">{field.value || "Not provided"}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center text-primary">
                <LayoutDashboard className="h-4 w-4" />
             </div>
             <h4 className="font-bold text-sm uppercase tracking-wide">Table Configuration</h4>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={() => onEdit(6)}>Edit</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(data.tables || []).length === 0 ? (
             <p className="text-sm text-muted-foreground italic">No tables configured</p>
          ) : (
            data.tables.map((t, i) => (
              <Badge key={i} variant="secondary" className="px-3 py-1 font-bold">
                {t.name} ({t.capacity}p - {t.type})
              </Badge>
            ))
          )}
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center text-primary">
                <Clock className="h-4 w-4" />
             </div>
             <h4 className="font-bold text-sm uppercase tracking-wide">Opening Hours</h4>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={() => onEdit(5)}>Edit</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(data.hours || []).filter(h => h.isOpen).slice(0, 4).map((h, i) => (
            <div key={i}>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">{h.day}</p>
              <p className="text-xs font-medium text-foreground">{h.open} - {h.close}</p>
            </div>
          ))}
          {(data.hours || []).filter(h => h.isOpen).length > 4 && (
            <div className="flex items-center">
              <span className="text-xs text-primary font-bold">+{data.hours.filter(h => h.isOpen).length - 4} more days</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
