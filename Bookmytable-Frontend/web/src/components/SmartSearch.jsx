import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

function SmartSearch() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/search");
    }
  };

  return <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.5 }}
    className="glass shadow-elevated rounded-lg p-2"
  >
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        {
    /* Location */
  }
        <div className="flex flex-1 items-center gap-2 rounded-md bg-background px-3 py-2.5">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <input
            type="text"
            placeholder="Restaurant name, cuisine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        <div className="hidden h-8 w-px bg-border md:block" />

        {
    /* Date */
  }
        <div className="flex flex-1 items-center gap-2 rounded-md bg-background px-3 py-2.5">
          <Calendar className="h-4 w-4 shrink-0 text-primary" />
          <input
    type="text"
    placeholder="Tonight, 7:00 PM"
    value={date}
    onChange={(e) => setDate(e.target.value)}
    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
  />
        </div>

        <div className="hidden h-8 w-px bg-border md:block" />

        {
    /* Guests */
  }
        <div className="flex items-center gap-2 rounded-md bg-background px-3 py-2.5 md:w-36">
          <Users className="h-4 w-4 shrink-0 text-primary" />
          <select
    value={guests}
    onChange={(e) => setGuests(e.target.value)}
    className="w-full bg-transparent text-sm text-foreground outline-none"
  >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>
                {n} {n === 1 ? "Guest" : "Guests"}
              </option>)}
          </select>
        </div>

        <Button onClick={handleSearch} className="shrink-0 gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </div>
    </motion.div>;
}
export {
  SmartSearch
};
