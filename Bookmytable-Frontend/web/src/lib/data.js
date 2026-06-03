import restaurant1 from "@/assets/restaurant-1.jpg";
import restaurant2 from "@/assets/restaurant-2.jpg";
import restaurant3 from "@/assets/restaurant-3.jpg";
import restaurant4 from "@/assets/restaurant-4.jpg";
import restaurant5 from "@/assets/restaurant-5.jpg";
import restaurant6 from "@/assets/restaurant-6.jpg";

const indianCities = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", 
  "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", 
  "Indore", "Bhopal", "Visakhapatnam", "Patna", "Vadodara"
];

const globalCities = [
  "New York", "London", "Dubai", "Singapore", "Sydney", 
  "Tokyo", "Paris", "Toronto", "Los Angeles", "Chicago", "Miami"
];

const restaurants = [
  {
    id: "1",
    name: "Sakura Omakase",
    cuisine: "Japanese",
    city: "Mumbai",
    rating: 4.8,
    reviewCount: 342,
    priceRange: "$$$",
    image: restaurant1,
    address: "123 Cherry Blossom Lane",
    distance: "0.3 mi",
    availableSlots: ["6:00 PM", "7:15 PM", "8:30 PM", "9:00 PM"],
    tags: ["Omakase", "Sushi Bar", "Sake"],
    description: "An intimate omakase experience with Chef Tanaka's seasonal selections flown in daily from Tsukiji Market.",
    openHours: "5:30 PM – 11:00 PM",
    phone: "(555) 123-4567"
  },
  {
    id: "2",
    name: "Trattoria Bella",
    cuisine: "Italian",
    city: "Mumbai",
    rating: 4.6,
    reviewCount: 518,
    priceRange: "$$",
    image: restaurant2,
    address: "45 Vine Street",
    distance: "0.5 mi",
    availableSlots: ["6:30 PM", "7:00 PM", "8:00 PM"],
    tags: ["Pasta", "Wine Bar", "Rustic"],
    description: "Authentic Italian trattoria with handmade pasta, wood-fired pizzas, and an extensive Tuscan wine selection.",
    openHours: "12:00 PM – 10:30 PM",
    phone: "(555) 234-5678"
  },
  {
    id: "3",
    name: "The Capital Grill",
    cuisine: "Steakhouse",
    city: "Delhi",
    rating: 4.7,
    reviewCount: 421,
    priceRange: "$$$$",
    image: restaurant3,
    address: "789 Oak Avenue",
    distance: "0.8 mi",
    availableSlots: ["7:00 PM", "8:15 PM", "9:30 PM"],
    tags: ["Prime Steak", "Cocktails", "Fine Dining"],
    description: "Premium dry-aged steaks, craft cocktails, and an award-winning wine program in an upscale atmosphere.",
    openHours: "5:00 PM – 11:30 PM",
    phone: "(555) 345-6789"
  },
  {
    id: "4",
    name: "Le Petit Bistro",
    cuisine: "French",
    city: "Bengaluru",
    rating: 4.5,
    reviewCount: 289,
    priceRange: "$$",
    image: restaurant4,
    address: "12 Rue de Paris",
    distance: "1.2 mi",
    availableSlots: ["12:00 PM", "1:30 PM", "7:00 PM", "8:30 PM"],
    tags: ["Brunch", "Terrace", "Wine"],
    description: "Charming Parisian-style bistro with a sun-drenched terrace, perfect for leisurely brunch and aperitifs.",
    openHours: "10:00 AM – 10:00 PM",
    phone: "(555) 456-7890"
  },
  {
    id: "5",
    name: "Sky Lounge",
    cuisine: "Contemporary",
    city: "Dubai",
    rating: 4.9,
    reviewCount: 156,
    priceRange: "$$$$",
    image: restaurant5,
    address: "1 Tower Plaza, 42nd Floor",
    distance: "1.5 mi",
    availableSlots: ["7:30 PM", "9:00 PM"],
    tags: ["Rooftop", "Cocktails", "City Views"],
    description: "Elevated dining with panoramic skyline views, molecular gastronomy, and an award-winning cocktail program.",
    openHours: "6:00 PM – 1:00 AM",
    phone: "(555) 567-8901"
  },
  {
    id: "6",
    name: "Siam Garden",
    cuisine: "Thai",
    city: "Hyderabad",
    rating: 4.4,
    reviewCount: 634,
    priceRange: "$",
    image: restaurant6,
    address: "88 Spice Market Road",
    distance: "0.6 mi",
    availableSlots: ["5:30 PM", "6:00 PM", "7:00 PM", "7:30 PM", "8:00 PM"],
    tags: ["Authentic", "Spicy", "Family Style"],
    description: "Vibrant Thai flavors with recipes passed down through generations. Bold, authentic, and unforgettable.",
    openHours: "11:30 AM – 10:00 PM",
    phone: "(555) 678-9012"
  },
  {
    id: "7",
    name: "Kyoto Sushi Kitchen",
    cuisine: "Japanese",
    city: "Bengaluru",
    rating: 4.5,
    reviewCount: 215,
    priceRange: "$$",
    image: restaurant1,
    address: "44 Ramen Street",
    distance: "1.1 mi",
    availableSlots: ["5:00 PM", "6:30 PM", "8:00 PM"],
    tags: ["Sushi", "Casual", "Authentic"],
    description: "Casual yet authentic sushi bar serving fresh rolls and traditional bentos.",
    openHours: "11:00 AM – 10:00 PM",
    phone: "(555) 789-0123"
  },
  {
    id: "8",
    name: "Luigi's Oven",
    cuisine: "Italian",
    city: "Pune",
    rating: 4.3,
    reviewCount: 890,
    priceRange: "$",
    image: restaurant2,
    address: "10 Napoli Blvd",
    distance: "2.0 mi",
    availableSlots: ["6:00 PM", "7:00 PM", "9:00 PM"],
    tags: ["Pizza", "Family", "Lively"],
    description: "Lively family-friendly pizzeria famous for its 24-inch wood-fired pies.",
    openHours: "11:00 AM – 11:00 PM",
    phone: "(555) 890-1234"
  },
  {
    id: "9",
    name: "El Camino Real",
    cuisine: "Mexican",
    city: "Mumbai",
    rating: 4.7,
    reviewCount: 432,
    priceRange: "$$",
    image: restaurant3,
    address: "220 Fiesta Lane",
    distance: "1.3 mi",
    availableSlots: ["5:30 PM", "7:30 PM", "8:30 PM"],
    tags: ["Tacos", "Margaritas", "Patio"],
    description: "Vibrant Mexican eatery serving street tacos, fresh guacamole, and signature margaritas.",
    openHours: "4:00 PM – 12:00 AM",
    phone: "(555) 901-2345"
  },
  {
    id: "10",
    name: "Spice Route",
    cuisine: "Indian",
    city: "Delhi",
    rating: 4.6,
    reviewCount: 310,
    priceRange: "$$",
    image: restaurant4,
    address: "88 Curry House Rd",
    distance: "0.9 mi",
    availableSlots: ["6:00 PM", "6:30 PM", "8:00 PM"],
    tags: ["Curry", "Tandoori", "Spicy"],
    description: "Aromatic curries and tandoori specialties cooked in traditional clay ovens.",
    openHours: "12:00 PM – 10:30 PM",
    phone: "(555) 012-3456"
  },
  {
    id: "11",
    name: "Golden Dragon",
    cuisine: "Chinese",
    city: "Kolkata",
    rating: 4.2,
    reviewCount: 654,
    priceRange: "$",
    image: restaurant5,
    address: "15 Chinatown Square",
    distance: "0.4 mi",
    availableSlots: ["5:00 PM", "7:00 PM", "8:30 PM"],
    tags: ["Dim Sum", "Noodles", "Fast"],
    description: "Bustling dim sum house and noodle bar perfect for quick and delicious meals.",
    openHours: "10:00 AM – 11:00 PM",
    phone: "(555) 123-9999"
  },
  {
    id: "12",
    name: "Bavette's Cut",
    cuisine: "Steakhouse",
    city: "Chicago",
    rating: 4.8,
    reviewCount: 512,
    priceRange: "$$$$",
    image: restaurant6,
    address: "33 Meatpacking Dist",
    distance: "2.5 mi",
    availableSlots: ["7:00 PM", "9:30 PM"],
    tags: ["Ribeye", "Wine", "Date Night"],
    description: "Classic American steakhouse with dark wood interiors and premium cuts of meat.",
    openHours: "5:00 PM – 11:00 PM",
    phone: "(555) 234-8888"
  },
  {
    id: "13",
    name: "Cafe Amelie",
    cuisine: "French",
    city: "Paris",
    rating: 4.4,
    reviewCount: 220,
    priceRange: "$$$",
    image: restaurant1,
    address: "99 Boulevarde",
    distance: "1.8 mi",
    availableSlots: ["6:30 PM", "8:00 PM", "9:00 PM"],
    tags: ["Crepes", "Wine", "Romantic"],
    description: "A cozy spot for classic French onion soup, savory crepes, and curated wines.",
    openHours: "11:00 AM – 10:00 PM",
    phone: "(555) 345-7777"
  },
  {
    id: "14",
    name: "Sushi Nakazawa",
    cuisine: "Japanese",
    city: "Tokyo",
    rating: 4.9,
    reviewCount: 890,
    priceRange: "$$$$",
    image: restaurant2,
    address: "11 Sushi Way",
    distance: "3.0 mi",
    availableSlots: ["6:00 PM", "8:30 PM"],
    tags: ["Michelin", "Omakase", "Premium"],
    description: "A high-end sushi experience led by world-class chefs.",
    openHours: "5:00 PM – 11:00 PM",
    phone: "(555) 456-6666"
  },
  {
    id: "15",
    name: "Pasta Paradiso",
    cuisine: "Italian",
    city: "London",
    rating: 4.5,
    reviewCount: 340,
    priceRange: "$$",
    image: restaurant3,
    address: "77 Roma Place",
    distance: "0.7 mi",
    availableSlots: ["5:30 PM", "7:00 PM", "8:30 PM"],
    tags: ["Pasta", "Cozy", "Wine"],
    description: "Delicious daily hand-rolled pasta and a casual dining atmosphere.",
    openHours: "12:00 PM – 10:00 PM",
    phone: "(555) 567-5555"
  },
  {
    id: "16",
    name: "Mango Tree",
    cuisine: "Thai",
    city: "London",
    rating: 4.6,
    reviewCount: 430,
    priceRange: "$$",
    image: restaurant4,
    address: "125 Bangkok Blvd",
    distance: "1.4 mi",
    availableSlots: ["6:00 PM", "7:30 PM", "9:00 PM"],
    tags: ["Pad Thai", "Curry", "Vibrant"],
    description: "Upscale Thai cuisine blending traditional spices with modern techniques.",
    openHours: "11:30 AM – 10:30 PM",
    phone: "(555) 678-4444"
  },
  {
    id: "17",
    name: "El Patron",
    cuisine: "Mexican",
    city: "Miami",
    rating: 4.3,
    reviewCount: 560,
    priceRange: "$",
    image: restaurant5,
    address: "44 Tequila Ave",
    distance: "1.0 mi",
    availableSlots: ["5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"],
    tags: ["Burritos", "Casual", "Drinks"],
    description: "The neighborhood's favorite spot for packed burritos and cold drinks.",
    openHours: "11:00 AM – 1:00 AM",
    phone: "(555) 789-3333"
  },
  {
    id: "18",
    name: "Modern Gastronomy",
    cuisine: "Contemporary",
    city: "Mumbai",
    rating: 4.8,
    reviewCount: 190,
    priceRange: "$$$$",
    image: restaurant6,
    address: "1 Art District",
    distance: "2.2 mi",
    availableSlots: ["7:00 PM", "8:30 PM"],
    tags: ["Experimental", "Courses", "Trendy"],
    description: "An avant-garde dining experience featuring 12-course tasting menus.",
    openHours: "6:00 PM – 11:30 PM",
    phone: "(555) 890-2222"
  },
  {
    id: "19", name: "Tokyo Drift Sushi", cuisine: "Japanese", city: "Tokyo", rating: 4.6, reviewCount: 540, priceRange: "$$$", image: restaurant1, address: "77 neon st", distance: "0.2 mi", availableSlots: ["6:00 PM", "7:00 PM"], tags: ["Sushi", "Modern"], description: "Cyberpunk themed authentic sushi bar.", openHours: "5:00 PM – 12:00 AM", phone: "(555) 111-2222"
  },
  {
    id: "20", name: "Osaka Street Food", cuisine: "Japanese", city: "Tokyo", rating: 4.8, reviewCount: 890, priceRange: "$", image: restaurant2, address: "88 Dotonbori", distance: "1.4 mi", availableSlots: ["5:30 PM", "6:30 PM"], tags: ["Takoyaki", "Casual"], description: "Real streetside flavors of Osaka.", openHours: "12:00 PM – 10:00 PM", phone: "(555) 222-3333"
  },
  {
    id: "21", name: "Zen Noodles", cuisine: "Japanese", city: "Bengaluru", rating: 4.5, reviewCount: 302, priceRange: "$$", image: restaurant3, address: "12 Monk Path", distance: "2.1 mi", availableSlots: ["6:00 PM"], tags: ["Ramen", "Udon"], description: "Peaceful atmosphere for perfect noodle bowls.", openHours: "11:00 AM – 9:00 PM", phone: "(555) 333-4444"
  },
  {
    id: "22", name: "Sapporo Grill", cuisine: "Japanese", city: "Chennai", rating: 4.9, reviewCount: 1020, priceRange: "$$$", image: restaurant4, address: "9 Snow Festival Blvd", distance: "3.5 mi", availableSlots: ["7:00 PM", "9:00 PM"], tags: ["Teppanyaki", "Grill"], description: "Live cooking theater at your table.", openHours: "5:30 PM – 11:00 PM", phone: "(555) 444-5555"
  },
  {
    id: "23", name: "Venice Canals", cuisine: "Italian", city: "Hyderabad", rating: 4.7, reviewCount: 450, priceRange: "$$$", image: restaurant5, address: "1 Waterway", distance: "1.0 mi", availableSlots: ["6:00 PM", "8:00 PM"], tags: ["Seafood", "Pasta"], description: "Venetian seafood pastas and romantic lighting.", openHours: "5:00 PM – 10:00 PM", phone: "(555) 555-6666"
  },
  {
    id: "24", name: "Nonna's Kitchen", cuisine: "Italian", city: "Ahmedabad", rating: 4.9, reviewCount: 1200, priceRange: "$$", image: restaurant6, address: "44 Family Rd", distance: "0.5 mi", availableSlots: ["5:30 PM", "7:30 PM"], tags: ["Authentic", "Cozy"], description: "Recipes straight from grandma's cookbook.", openHours: "11:00 AM – 9:30 PM", phone: "(555) 666-7777"
  },
  {
    id: "25", name: "Roma Classics", cuisine: "Italian", city: "Surat", rating: 4.4, reviewCount: 320, priceRange: "$$", image: restaurant1, address: "2 Colosseum Sq", distance: "2.2 mi", availableSlots: ["6:30 PM", "8:30 PM"], tags: ["Pizza", "Wine"], description: "Classic roman style thin-crust pizzas.", openHours: "12:00 PM – 11:00 PM", phone: "(555) 777-8888"
  },
  {
    id: "26", name: "The Sicilian", cuisine: "Italian", city: "Jaipur", rating: 4.6, reviewCount: 600, priceRange: "$$$", image: restaurant2, address: "99 Mafia Ave", distance: "1.8 mi", availableSlots: ["7:00 PM", "9:00 PM"], tags: ["Steak", "Pasta"], description: "Hearty southern Italian meals.", openHours: "5:00 PM – 11:00 PM", phone: "(555) 888-9999"
  },
  {
    id: "27", name: "Parisian Nights", cuisine: "French", city: "Paris", rating: 4.8, reviewCount: 880, priceRange: "$$$$", image: restaurant3, address: "1 Tour Eiffel", distance: "3.0 mi", availableSlots: ["7:00 PM", "8:00 PM"], tags: ["Fine Dining", "Wine"], description: "A luxurious escape to Paris.", openHours: "6:00 PM – 12:00 AM", phone: "(555) 999-0000"
  },
  {
    id: "28", name: "Baguette Boys", cuisine: "French", city: "Paris", rating: 4.3, reviewCount: 210, priceRange: "$", image: restaurant4, address: "14 Baker St", distance: "0.4 mi", availableSlots: ["8:00 AM", "12:00 PM"], tags: ["Bakery", "Cafe"], description: "Freshly baked goods and morning coffee.", openHours: "7:00 AM – 4:00 PM", phone: "(555) 000-1111"
  },
  {
    id: "29", name: "Lyon House", cuisine: "French", city: "Paris", rating: 4.7, reviewCount: 450, priceRange: "$$$", image: restaurant5, address: "55 Gastronomy Lane", distance: "1.5 mi", availableSlots: ["6:30 PM", "8:30 PM"], tags: ["Classic", "Cozy"], description: "Traditional Lyonnaise cuisine.", openHours: "5:00 PM – 10:30 PM", phone: "(555) 112-2233"
  },
  {
    id: "30", name: "Texas Roadhouse", cuisine: "Steakhouse", city: "Lucknow", rating: 4.5, reviewCount: 1500, priceRange: "$$", image: restaurant6, address: "100 Highway Rd", distance: "4.0 mi", availableSlots: ["5:00 PM", "6:00 PM", "7:00 PM"], tags: ["Steak", "BBQ"], description: "Lively chain steakhouse serving American fare with a Southwestern spin.", openHours: "4:00 PM – 10:00 PM", phone: "(555) 223-3344"
  },
  {
    id: "31", name: "The Prime Cut", cuisine: "Steakhouse", city: "Kanpur", rating: 4.9, reviewCount: 780, priceRange: "$$$$", image: restaurant1, address: "20 Reserve St", distance: "2.8 mi", availableSlots: ["7:30 PM", "9:00 PM"], tags: ["Wagyu", "Fine Dining"], description: "The city's premier destination for A5 Wagyu.", openHours: "6:00 PM – 11:30 PM", phone: "(555) 334-4455"
  },
  {
    id: "32", name: "Chop House Grille", cuisine: "Steakhouse", city: "Nagpur", rating: 4.6, reviewCount: 410, priceRange: "$$$", image: restaurant2, address: "88 Butcher Block", distance: "1.1 mi", availableSlots: ["6:00 PM", "8:00 PM"], tags: ["Chops", "Wine Bar"], description: "Excellent pork and lamb chops alongside classic steaks.", openHours: "5:00 PM – 11:00 PM", phone: "(555) 445-5566"
  },
  {
    id: "33", name: "Bangkok Street", cuisine: "Thai", city: "Indore", rating: 4.4, reviewCount: 560, priceRange: "$", image: restaurant3, address: "44 Khao San Rd", distance: "0.8 mi", availableSlots: ["12:00 PM", "6:00 PM", "7:00 PM"], tags: ["Pad Thai", "Street Food"], description: "Authentic Thai street food flavors.", openHours: "11:00 AM – 11:00 PM", phone: "(555) 556-6677"
  },
  {
    id: "34", name: "Lotus Thai", cuisine: "Thai", city: "Bhopal", rating: 4.8, reviewCount: 320, priceRange: "$$", image: restaurant4, address: "12 River View", distance: "1.6 mi", availableSlots: ["6:30 PM", "8:30 PM"], tags: ["Curry", "Riverside"], description: "Beautiful riverside dining with upscale Thai curries.", openHours: "5:00 PM – 10:00 PM", phone: "(555) 667-7788"
  },
  {
    id: "35", name: "Chiang Mai Kitchen", cuisine: "Thai", city: "Visakhapatnam", rating: 4.6, reviewCount: 400, priceRange: "$$", image: restaurant5, address: "3 Northern Way", distance: "2.4 mi", availableSlots: ["5:30 PM", "7:30 PM"], tags: ["Northern", "Spicy"], description: "Specializing in the vibrant, spicy dishes of Northern Thailand.", openHours: "12:00 PM – 9:30 PM", phone: "(555) 778-8899"
  },
  {
    id: "36", name: "Cactus Club", cuisine: "Mexican", city: "Patna", rating: 4.5, reviewCount: 890, priceRange: "$$", image: restaurant6, address: "99 Desert Path", distance: "1.9 mi", availableSlots: ["6:00 PM", "8:00 PM", "10:00 PM"], tags: ["Tacos", "Tequila"], description: "Massive tequila selection and gourmet tacos.", openHours: "4:00 PM – 1:00 AM", phone: "(555) 889-9900"
  },
  {
    id: "37", name: "Pueblo Viejo", cuisine: "Mexican", city: "Vadodara", rating: 4.7, reviewCount: 510, priceRange: "$$", image: restaurant1, address: "45 Old Town", distance: "0.6 mi", availableSlots: ["5:00 PM", "7:00 PM"], tags: ["Authentic", "Margaritas"], description: "Traditional Mexican dishes in a colorful setting.", openHours: "11:00 AM – 10:00 PM", phone: "(555) 990-0011"
  },
  {
    id: "38", name: "La Taqueria", cuisine: "Mexican", city: "New York", rating: 4.8, reviewCount: 1300, priceRange: "$", image: restaurant2, address: "1 Mission St", distance: "3.2 mi", availableSlots: ["12:00 PM", "1:00 PM", "6:00 PM"], tags: ["Burritos", "Fast"], description: "Award-winning Mission-style burritos.", openHours: "10:00 AM – 9:00 PM", phone: "(555) 001-1122"
  },
  {
    id: "39", name: "New Delhi Diner", cuisine: "Indian", city: "Dubai", rating: 4.3, reviewCount: 420, priceRange: "$", image: restaurant3, address: "77 Spice Market", distance: "1.2 mi", availableSlots: ["6:00 PM", "7:30 PM"], tags: ["Mughlai", "Casual"], description: "Rich Mughlai curries in a casual diner environment.", openHours: "11:30 AM – 10:30 PM", phone: "(555) 112-2233"
  },
  {
    id: "40", name: "Taj Mahal Palace", cuisine: "Indian", city: "Singapore", rating: 4.9, reviewCount: 670, priceRange: "$$$", image: restaurant4, address: "1 Palace Gates", distance: "2.7 mi", availableSlots: ["7:00 PM", "9:00 PM"], tags: ["Fine Dining", "Authentic"], description: "A luxurious experience of Indian royalty cuisines.", openHours: "5:30 PM – 11:00 PM", phone: "(555) 223-3344"
  },
  {
    id: "41", name: "Bombay Chaat", cuisine: "Indian", city: "Sydney", rating: 4.6, reviewCount: 310, priceRange: "$", image: restaurant5, address: "33 Street Food Ln", distance: "0.5 mi", availableSlots: ["12:00 PM", "2:00 PM", "6:00 PM"], tags: ["Street Food", "Vegetarian"], description: "The best vegetarian street food and chaat in the city.", openHours: "11:00 AM – 9:00 PM", phone: "(555) 334-4455"
  },
  {
    id: "42", name: "Peking Duck House", cuisine: "Chinese", city: "Toronto", rating: 4.8, reviewCount: 950, priceRange: "$$$", image: restaurant6, address: "8 Roasting Ave", distance: "1.7 mi", availableSlots: ["6:30 PM", "8:30 PM"], tags: ["Duck", "Authentic"], description: "World-famous crispy Peking duck carved tableside.", openHours: "5:00 PM – 10:30 PM", phone: "(555) 445-5566"
  },
  {
    id: "43", name: "Shanghai Nights", cuisine: "Chinese", city: "Los Angeles", rating: 4.5, reviewCount: 440, priceRange: "$$", image: restaurant1, address: "55 Neon District", distance: "2.1 mi", availableSlots: ["7:00 PM", "9:00 PM"], tags: ["Dumplings", "Cocktails"], description: "Soup dumplings and craft cocktails in a modern lounge.", openHours: "5:30 PM – 12:00 AM", phone: "(555) 556-6677"
  },
  {
    id: "44", name: "Sichuan Spice", cuisine: "Chinese", city: "Miami", rating: 4.7, reviewCount: 620, priceRange: "$$", image: restaurant2, address: "12 Peppercorn Rd", distance: "1.3 mi", availableSlots: ["6:00 PM", "7:30 PM", "9:00 PM"], tags: ["Spicy", "Authentic"], description: "Numbing and spicy authentic Sichuan cuisine.", openHours: "11:30 AM – 10:00 PM", phone: "(555) 667-7788"
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

const navLinks = [
  { label: "Discover", href: "/discover" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "For Restaurants", href: "/brand" },
];

export {
  cuisineFilters,
  menuItems,
  restaurants,
  indianCities,
  globalCities,
  navLinks
};
