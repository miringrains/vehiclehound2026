"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How does the 14-day free trial work?",
    a: "When you sign up, you get full access to all Professional plan features for 14 days. No credit card required. At the end of the trial, choose a plan that fits your dealership or your account pauses until you subscribe.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade at any time from the billing page in your portal. Changes take effect immediately and billing is prorated.",
  },
  {
    q: "How do the embeddable widgets work?",
    a: "You get a short JavaScript snippet from the Integrations page. Paste it into your existing website's HTML — WordPress, Squarespace, Wix, or any custom site. The widget renders your live inventory, vehicle details, or a credit application form with your branding.",
  },
  {
    q: "Is customer data secure?",
    a: "Yes. All sensitive data (SSNs) is encrypted at rest. Credit application submissions are logged with IP addresses and timestamps. We use Supabase for auth with row-level security and all traffic is encrypted via TLS.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your data is retained for 30 days after cancellation. During that time you can reactivate your account and pick up right where you left off. After 30 days, data is permanently deleted.",
  },
  {
    q: "Do you offer custom enterprise plans?",
    a: "Yes. For dealership groups or high-volume operations that need custom integrations, dedicated onboarding, or special terms, contact us and we'll build a plan that fits.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-border/30">
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between py-5 text-left"
          >
            <span className="pr-4 text-sm font-medium text-foreground">{faq.q}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                open === i ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
