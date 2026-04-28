import { motion } from "framer-motion";

export default function Terms() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground text-lg">Effective Date: April 10, 2026</p>
        </div>

        <div className="prose prose-stone dark:prose-invert max-w-none space-y-8 text-foreground/80">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using BookMyTable, you agree to be bound by these Terms of Service.
              If you do not agree with any part of these terms, you must not use our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. User Accounts</h2>
            <p>
              To use certain features, you may be required to register for an account. You are responsible
              for maintaining the confidentiality of your account credentials and for all activities that
              occur under your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Booking and Reservations</h2>
            <p>
              Bookings are subject to the restaurant's availability and specific terms. BookMyTable
              acts as an intermediary to facilitate these bookings. Any disputes regarding the booking
              itself should be resolved with the restaurant directly.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Acceptable Use</h2>
            <p>
              You agree not to use the service for any unlawful purposes or in any way that could
              damage, disable, or impair our servers or networks.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any
              material changes by posting the new terms on this site.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
