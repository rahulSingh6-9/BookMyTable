import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";

function Footer() {
  return (
    <footer className="border-t bg-background pt-16 pb-8 border-border/40 px-6 sm:px-12 mt-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 grid-cols-2 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <BrandLogo className="h-8 w-auto max-w-[120px] rounded-md" />
                <span className="text-xl font-bold tracking-tight text-foreground">
                  Book<span className="text-primary">My</span>Table
                </span>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tables found, not searched. The fastest way to discover and book restaurants.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Discover</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/discover" className="hover:text-foreground transition-colors">All Restaurants</Link></li>
              <li><Link to="/near-me" className="hover:text-foreground transition-colors">Near Me</Link></li>
              <li><Link to="/top-rated" className="hover:text-foreground transition-colors">Top Rated</Link></li>
              <li><Link to="/new-openings" className="hover:text-foreground transition-colors">New Openings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">For Restaurants</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/partner-with-us" className="hover:text-foreground transition-colors">Partner With Us</Link></li>
              <li><Link to="/brand" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Learn More</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link to="/security" className="hover:text-foreground transition-colors">Security</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/support" className="hover:text-foreground transition-colors">Help & Support</Link></li>
              <li><Link to="/report-fraud" className="hover:text-foreground transition-colors">Report a Fraud</Link></li>
              <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h4 className="mb-3 text-sm font-semibold text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © 2026 BookMyTable. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export { Footer };
