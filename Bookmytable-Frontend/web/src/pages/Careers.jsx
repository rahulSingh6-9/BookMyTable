import { motion } from "framer-motion";
import { Briefcase, MapPin, Zap, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Careers() {
  const jobs = [
    { title: "Senior Product Designer", location: "Remote / Bangalore", type: "Full-time" },
    { title: "Full Stack Engineer (React/Node)", location: "Bangalore", type: "Full-time" },
    { title: "Regional Growth Manager", location: "Mumbai", type: "Full-time" },
    { title: "Restaurant Success Associate", location: "Remote", type: "Part-time" },
  ];

  return (
    <div className="container mx-auto max-w-4xl py-20 px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
        <div className="text-center space-y-4">
          <Badge className="mb-2">We're Hiring!</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">Join the BookMyTable Team</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Help us redefine the future of dining. We're looking for passionate individuals who love food and technology.
          </p>
        </div>

        <div className="grid gap-6">
          <h2 className="text-2xl font-bold text-foreground">Open Positions</h2>
          {jobs.map((job, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow gap-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{job.title}</h3>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.type}</span>
                </div>
              </div>
              <Button variant="outline" className="rounded-full px-6">Apply Now</Button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Simple Badge component if not imported
function Badge({ children, className }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ${className}`}>
      {children}
    </span>
  );
}
