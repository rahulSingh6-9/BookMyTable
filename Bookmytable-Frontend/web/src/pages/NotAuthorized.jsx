import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function NotAuthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-destructive/10 p-6 rounded-full mb-6"
      >
        <ShieldAlert className="w-16 h-16 text-destructive" />
      </motion.div>
      <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        You do not have the required permissions to access this page. 
        If you believe this is an error, please contact your restaurant owner or administrator.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link to="/">Go Home</Link>
        </Button>
        <Button asChild>
          <Link to="/discover">Browse Restaurants</Link>
        </Button>
      </div>
    </div>
  );
}
