import { motion } from "framer-motion";

export default function Privacy() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">Last updated: April 10, 2026</p>
        </div>

        <div className="prose prose-stone dark:prose-invert max-w-none space-y-6 text-foreground/80">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>
              We collect information to provide better services to all our users. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Information you give us (e.g., name, email address, telephone number).</li>
              <li>Information we get from your use of our services (e.g., device info, location data).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. How We Use Information</h2>
            <p>
              We use the information we collect from all of our services to provide, maintain, protect and improve them, to develop new ones, and to protect BookMyTable and our users.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Transparency and Choice</h2>
            <p>
              People have different privacy concerns. Our goal is to be clear about what information we collect, so that you can make meaningful choices about how it is used.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Information Security</h2>
            <p>
              We work hard to protect BookMyTable and our users from unauthorized access to or unauthorized alteration, disclosure or destruction of information we hold.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
