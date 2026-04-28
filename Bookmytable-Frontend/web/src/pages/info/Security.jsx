import { motion } from "framer-motion";
import { Shield, Lock, Eye, CheckCircle } from "lucide-react";

export default function Security() {
  const securityFeatures = [
    {
      title: "Data Encryption",
      description: "All sensitive data is encrypted at rest and in transit using industry-standard protocols.",
      icon: Lock,
    },
    {
      title: "Secure Access",
      description: "We implement multi-factor authentication and strict access controls for our internal systems.",
      icon: Shield,
    },
    {
      title: "Privacy by Design",
      description: "Security is integrated into every stage of our software development lifecycle.",
      icon: Eye,
    },
    {
      title: "Regular Audits",
      description: "We conduct frequent security audits and penetration testing to identify and fix vulnerabilities.",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Security at BookMyTable</h1>
          <p className="text-muted-foreground text-lg">
            We are committed to providing a secure booking platform for our users and partners.
            Your data security is our top priority.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {securityFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl bg-muted/50 p-8">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Responsible Disclosure</h2>
          <p className="text-foreground/80 leading-relaxed">
            If you believe you've discovered a security vulnerability on BookMyTable, please let us know
            immediately. We evaluate all reports and do our best to fix issues promptly.
            Please send your reports to <span className="font-semibold text-primary">security@bookmytable.com</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
