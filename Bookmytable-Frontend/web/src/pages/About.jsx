import { motion } from "framer-motion";
import { CheckCircle2, Star, Users, Globe } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto max-w-4xl py-20 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">About BookMyTable</h1>
          <p className="text-xl text-muted-foreground mx-auto max-w-2xl">
            We're on a mission to make dining out as easy as a single tap.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-4 text-lg text-foreground/80 leading-relaxed">
            <p>
              Founded in 2026, BookMyTable started with a simple idea: diners shouldn't have to call multiple restaurants or wait in long lines just to get a table.
            </p>
            <p>
              Our platform connects thousands of high-quality restaurants with millions of foodies, providing a seamless, real-time booking experience that benefits both diners and owners.
            </p>
          </div>
          <div className="bg-primary/5 rounded-3xl p-8 flex flex-col justify-center">
             <div className="grid grid-cols-2 gap-6 text-center">
               <div>
                 <p className="text-3xl font-bold text-primary">150K+</p>
                 <p className="text-sm text-muted-foreground">Active Diners</p>
               </div>
               <div>
                 <p className="text-3xl font-bold text-primary">2.5K+</p>
                 <p className="text-sm text-muted-foreground">Partners</p>
               </div>
               <div>
                 <p className="text-3xl font-bold text-primary">1M+</p>
                 <p className="text-sm text-muted-foreground">Seats Filled</p>
               </div>
               <div>
                 <p className="text-3xl font-bold text-primary">45</p>
                 <p className="text-sm text-muted-foreground">Cities</p>
               </div>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
