import restaurant1 from "@/assets/restaurant-1.jpg";
import restaurant2 from "@/assets/restaurant-2.jpg";
import restaurant3 from "@/assets/restaurant-3.jpg";
import restaurant4 from "@/assets/restaurant-4.jpg";
import restaurant5 from "@/assets/restaurant-5.jpg";
import restaurant6 from "@/assets/restaurant-6.jpg";
const restaurants = [
  {
    id: "1",
    name: "Sakura Omakase",
    cuisine: "Japanese",
    rating: 4.8,
    reviewCount: 342,
    priceRange: "$$$",
    image: restaurant1,
    address: "123 Cherry Blossom Lane",
    distance: "0.3 mi",
    availableSlots: ["6:00 PM", "7:15 PM", "8:30 PM", "9:00 PM"],
    tags: ["Omakase", "Sushi Bar", "Sake"],
    description: "An intimate omakase experience with Chef Tanaka's seasonal selections flown in daily from Tsukiji Market.",
    openHours: "5:30 PM \u2013 11:00 PM",
    phone: "(555) 123-4567"
  },
  {
    id: "2",
    name: "Trattoria Bella",
    cuisine: "Italian",
    rating: 4.6,
    reviewCount: 518,
    priceRange: "$$",
    image: restaurant2,
    address: "45 Vine Street",
    distance: "0.5 mi",
    availableSlots: ["6:30 PM", "7:00 PM", "8:00 PM"],
    tags: ["Pasta", "Wine Bar", "Rustic"],
    description: "Authentic Italian trattoria with handmade pasta, wood-fired pizzas, and an extensive Tuscan wine selection.",
    openHours: "12:00 PM \u2013 10:30 PM",
    phone: "(555) 234-5678"
  },
  {
    id: "3",
    name: "The Capital Grill",
    cuisine: "Steakhouse",
    rating: 4.7,
    reviewCount: 421,
    priceRange: "$$$$",
    image: restaurant3,
    address: "789 Oak Avenue",
    distance: "0.8 mi",
    availableSlots: ["7:00 PM", "8:15 PM", "9:30 PM"],
    tags: ["Prime Steak", "Cocktails", "Fine Dining"],
    description: "Premium dry-aged steaks, craft cocktails, and an award-winning wine program in an upscale atmosphere.",
    openHours: "5:00 PM \u2013 11:30 PM",
    phone: "(555) 345-6789"
  },
  {
    id: "4",
    name: "Le Petit Bistro",
    cuisine: "French",
    rating: 4.5,
    reviewCount: 289,
    priceRange: "$$",
    image: restaurant4,
    address: "12 Rue de Paris",
    distance: "1.2 mi",
    availableSlots: ["12:00 PM", "1:30 PM", "7:00 PM", "8:30 PM"],
    tags: ["Brunch", "Terrace", "Wine"],
    description: "Charming Parisian-style bistro with a sun-drenched terrace, perfect for leisurely brunch and aperitifs.",
    openHours: "10:00 AM \u2013 10:00 PM",
    phone: "(555) 456-7890"
  },
  {
    id: "5",
    name: "Sky Lounge",
    cuisine: "Contemporary",
    rating: 4.9,
    reviewCount: 156,
    priceRange: "$$$$",
    image: restaurant5,
    address: "1 Tower Plaza, 42nd Floor",
    distance: "1.5 mi",
    availableSlots: ["7:30 PM", "9:00 PM"],
    tags: ["Rooftop", "Cocktails", "City Views"],
    description: "Elevated dining with panoramic skyline views, molecular gastronomy, and an award-winning cocktail program.",
    openHours: "6:00 PM \u2013 1:00 AM",
    phone: "(555) 567-8901"
  },
  {
    id: "6",
    name: "Siam Garden",
    cuisine: "Thai",
    rating: 4.4,
    reviewCount: 634,
    priceRange: "$",
    image: restaurant6,
    address: "88 Spice Market Road",
    distance: "0.6 mi",
    availableSlots: ["5:30 PM", "6:00 PM", "7:00 PM", "7:30 PM", "8:00 PM"],
    tags: ["Authentic", "Spicy", "Family Style"],
    description: "Vibrant Thai flavors with recipes passed down through generations. Bold, authentic, and unforgettable.",
    openHours: "11:30 AM \u2013 10:00 PM",
    phone: "(555) 678-9012"
  }
];
const menuItems = [
  { id: "m1", name: "Edamame", description: "Steamed soybeans with sea salt", price: 8, category: "Starters" },
  { id: "m2", name: "Miso Soup", description: "Traditional dashi broth with tofu and wakame", price: 6, category: "Starters" },
  { id: "m3", name: "Salmon Sashimi", description: "6 pieces of fresh Atlantic salmon", price: 18, category: "Sashimi" },
  { id: "m4", name: "Tuna Tataki", description: "Seared tuna with ponzu and ginger", price: 22, category: "Sashimi" },
  { id: "m5", name: "Dragon Roll", description: "Eel, avocado, cucumber with unagi sauce", price: 16, category: "Rolls" },
  { id: "m6", name: "Rainbow Roll", description: "California roll topped with assorted sashimi", price: 18, category: "Rolls" },
  { id: "m7", name: "Wagyu Nigiri", description: "A5 Japanese wagyu beef over sushi rice", price: 28, category: "Premium" },
  { id: "m8", name: "Uni", description: "Fresh sea urchin from Hokkaido", price: 32, category: "Premium" },
  { id: "m9", name: "Matcha Tiramisu", description: "Green tea twist on the Italian classic", price: 12, category: "Desserts" },
  { id: "m10", name: "Mochi Ice Cream", description: "Assorted flavors, 3 pieces", price: 10, category: "Desserts" }
];
const cuisineFilters = [
  "All",
  "Japanese",
  "Italian",
  "Steakhouse",
  "French",
  "Contemporary",
  "Thai",
  "Mexican",
  "Indian",
  "Chinese"
];
export {
  cuisineFilters,
  menuItems,
  restaurants
};
