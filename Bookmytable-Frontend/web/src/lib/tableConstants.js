export const FLOOR_OPTIONS = [
  { value: "ground", label: "Ground Floor" },
  { value: "floor_1", label: "Floor 1" },
  { value: "floor_2", label: "Floor 2" },
  { value: "floor_3", label: "Floor 3" },
  { value: "floor_4", label: "Floor 4" },
  { value: "floor_5", label: "Floor 5" },
  { value: "basement", label: "Basement" },
  { value: "mezzanine", label: "Mezzanine" },
  { value: "rooftop", label: "Rooftop" },
  { value: "custom", label: "Custom Floor" },
];

export const SECTION_OPTIONS = [
  { value: "family_zone", label: "Family Zone" },
  { value: "couple_zone", label: "Couple Zone" },
];

export const SECTION_AREA_PRESETS = [
  { value: "family_zone", label: "Family Area", color: "bg-blue-500/5 backdrop-blur-sm", border: "border-blue-500/30", icon: "users" },
  { value: "couple_zone", label: "Couple Area", color: "bg-pink-500/5 backdrop-blur-sm", border: "border-pink-500/30", icon: "heart" },
];

export const DINING_AREA_PRESETS = [
  { value: "indoor", label: "Indoor Room", color: "bg-card/70 backdrop-blur-sm", border: "border-border/80", icon: "box", elements: [{type: 'entrance', count: 1, pos: 'bottom'}, {type: 'window', count: 2, pos: 'top'}] },
  { value: "outdoor", label: "Outdoor Area", color: "bg-green-500/10 backdrop-blur-sm", border: "border-green-500/50", icon: "sun", elements: [{type: 'entrance', count: 1, pos: 'bottom'}, {type: 'railing', count: 3, pos: 'top,left,right'}] },
  { value: "private_room", label: "Private Room", color: "bg-amber-500/10 backdrop-blur-sm", border: "border-amber-500/50", icon: "lock", elements: [{type: 'door', count: 1, pos: 'bottom'}, {type: 'window', count: 1, pos: 'top'}] },
  { value: "rooftop", label: "Rooftop", color: "bg-blue-500/10 backdrop-blur-sm", border: "border-blue-500/50", icon: "cloud", elements: [{type: 'stairs', count: 1, pos: 'left'}, {type: 'railing', count: 2, pos: 'top,right'}, {type: 'view_marker', count: 1, pos: 'bottom'}] },
  { value: "balcony", label: "Balcony", color: "bg-sky-500/10 backdrop-blur-sm", border: "border-sky-500/50", icon: "layout", elements: [{type: 'door', count: 1, pos: 'bottom'}, {type: 'open_side', count: 1, pos: 'top'}, {type: 'railing', count: 2, pos: 'left,right'}] },
  { value: "garden", label: "Garden", color: "bg-emerald-500/10 backdrop-blur-sm", border: "border-emerald-500/50", icon: "leaf", elements: [{type: 'entrance', count: 1, pos: 'bottom'}] },
  { value: "poolside", label: "Poolside", color: "bg-cyan-500/10 backdrop-blur-sm", border: "border-cyan-500/50", icon: "droplets", elements: [{type: 'entrance', count: 1, pos: 'bottom'}] },
  { value: "vip_hall", label: "VIP Hall", color: "bg-purple-500/10 backdrop-blur-sm", border: "border-purple-500/50", icon: "star", elements: [{type: 'door', count: 1, pos: 'bottom'}, {type: 'window', count: 2, pos: 'top'}] },
  { value: "family_hall", label: "Family Hall", color: "bg-orange-500/10 backdrop-blur-sm", border: "border-orange-500/50", icon: "users", elements: [{type: 'entrance', count: 1, pos: 'bottom'}, {type: 'window', count: 2, pos: 'top'}] },
];
