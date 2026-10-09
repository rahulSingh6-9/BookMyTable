import { Button } from "@/components/ui/button";
import { Coffee, UtensilsCrossed, Wine, Building2 } from "lucide-react";

export function TablePresets({ onApply }) {
  const presets = [
    {
      id: "cafe",
      name: "Small Cafe",
      icon: Coffee,
      desc: "Small 2-seater tables, cozy.",
      generate: () => {
        return Array.from({ length: 8 }, (_, i) => ({
          id: Math.random().toString(36).substring(7),
          tableCode: `C${i + 1}`,
          capacity: 2,
          type: "indoor_dining",
          floor: "ground",
          floorLabel: "Ground Floor",
          section: "couple_zone",
          sectionLabel: "Couple Zone",
          price: 0,
          resolvedPrice: 0,
          priceSource: "none"
        }));
      }
    },
    {
      id: "casual",
      name: "Casual Dining",
      icon: UtensilsCrossed,
      desc: "Mix of 2, 4, and 6 seaters.",
      generate: () => {
        const t2 = Array.from({ length: 5 }, (_, i) => ({ 
          id: Math.random().toString(36).substring(7), 
          tableCode: `T${i + 1}`, 
          capacity: 2, 
          type: "indoor_dining",
          floor: "ground",
          floorLabel: "Ground Floor",
          section: "couple_zone",
          sectionLabel: "Couple Zone",
          price: 0,
          resolvedPrice: 0,
          priceSource: "none"
        }));
        const t4 = Array.from({ length: 10 }, (_, i) => ({ 
          id: Math.random().toString(36).substring(7), 
          tableCode: `T${i + 6}`, 
          capacity: 4, 
          type: "indoor_dining",
          floor: "ground",
          floorLabel: "Ground Floor",
          section: "family_zone",
          sectionLabel: "Family Zone",
          price: 0,
          resolvedPrice: 0,
          priceSource: "none"
        }));
        const t6 = Array.from({ length: 3 }, (_, i) => ({ 
          id: Math.random().toString(36).substring(7), 
          tableCode: `T${i + 16}`, 
          capacity: 6, 
          type: "indoor_dining",
          floor: "ground",
          floorLabel: "Ground Floor",
          section: "family_zone",
          sectionLabel: "Family Zone",
          price: 0,
          resolvedPrice: 0,
          priceSource: "none"
        }));
        return [...t2, ...t4, ...t6];
      }
    },
    {
      id: "fine",
      name: "Fine Dining",
      icon: Wine,
      desc: "Spacious 4-seaters + VIP.",
      generate: () => {
        const t4 = Array.from({ length: 12 }, (_, i) => ({ 
          id: Math.random().toString(36).substring(7), 
          tableCode: `D${i + 1}`, 
          capacity: 4, 
          type: "indoor_dining",
          floor: "ground",
          floorLabel: "Ground Floor",
          section: "family_zone",
          sectionLabel: "Family Zone",
          price: 0,
          resolvedPrice: 0,
          priceSource: "none"
        }));
        const vip = Array.from({ length: 2 }, (_, i) => ({ 
          id: Math.random().toString(36).substring(7), 
          tableCode: `V${i + 1}`, 
          capacity: 6, 
          type: "private_room",
          floor: "floor_1",
          floorLabel: "Floor 1",
          section: "family_zone",
          sectionLabel: "Family Zone",
          price: 0,
          resolvedPrice: 0,
          priceSource: "none"
        }));
        return [...t4, ...vip];
      }
    },
    {
      id: "large",
      name: "Large Restaurant",
      icon: Building2,
      desc: "Huge capacity, multiple types.",
      generate: () => {
        const in4 = Array.from({ length: 15 }, (_, i) => ({ 
          id: Math.random().toString(36).substring(7), 
          tableCode: `IN${i + 1}`, 
          capacity: 4, 
          type: "indoor_dining",
          floor: "ground",
          floorLabel: "Ground Floor",
          section: "family_zone",
          sectionLabel: "Family Zone",
          price: 0,
          resolvedPrice: 0,
          priceSource: "none"
        }));
        const out4 = Array.from({ length: 10 }, (_, i) => ({ 
          id: Math.random().toString(36).substring(7), 
          tableCode: `OUT${i + 1}`, 
          capacity: 4, 
          type: "outdoor_dining",
          floor: "ground",
          floorLabel: "Ground Floor",
          section: "family_zone",
          sectionLabel: "Family Zone",
          price: 0,
          resolvedPrice: 0,
          priceSource: "none"
        }));
        const bar = Array.from({ length: 8 }, (_, i) => ({ 
          id: Math.random().toString(36).substring(7), 
          tableCode: `B${i + 1}`, 
          capacity: 2, 
          type: "indoor_dining",
          floor: "ground",
          floorLabel: "Ground Floor",
          section: "couple_zone",
          sectionLabel: "Couple Zone",
          price: 0,
          resolvedPrice: 0,
          priceSource: "none"
        }));
        return [...in4, ...out4, ...bar];
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      {presets.map(preset => {
        const Icon = preset.icon;
        return (
          <div 
            key={preset.id} 
            className="border border-border rounded-2xl p-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
            onClick={() => onApply(preset.generate())}
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{preset.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{preset.desc}</p>
                <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity inline-block mt-2">Generate Setup →</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
