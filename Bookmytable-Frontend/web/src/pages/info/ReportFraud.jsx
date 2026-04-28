import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, Flag, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportFraud() {
  const steps = [
    { title: "Identify the Issue", description: "Collect all relevant details, including screenshots and emails.", icon: AlertTriangle },
    { title: "Report Immediately", description: "Use our dedicated reporting form to notify our security team.", icon: Flag },
    { title: "Review Process", description: "Our team will investigate the report and take necessary action.", icon: ShieldAlert },
    { title: "Resolution", description: "We will update you on the outcome of the investigation.", icon: Scale },
  ];

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive text-3xl font-bold">
            !
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Report a Fraud</h1>
          <p className="text-muted-foreground text-lg">
            Protecting our community is our shared responsibility. Report any suspicious activity.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Suspicious Activity Form</h2>
          <p className="text-foreground/80 max-w-lg mx-auto">
            If you've encountered a suspicious restaurant listing, fraudulent booking request, or any other
            suspicious behavior, please use the button below to fill out our secure reporting form.
          </p>
          <Button variant="destructive" size="lg" className="rounded-full px-8">
            Access Reporting Form
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Your report will be handled confidentially. We may contact you for further information.
        </div>
      </motion.div>
    </div>
  );
}
