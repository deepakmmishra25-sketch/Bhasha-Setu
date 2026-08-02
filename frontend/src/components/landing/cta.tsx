"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-saffron-500 to-orange-600 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ready to Grow in Your Language?
        </motion.h2>
        <motion.p
          className="text-lg text-orange-100 mb-8 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Join 50,000+ entrepreneurs, farmers, and students already using BhashaSetu AI to build their future.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Button size="xl" variant="secondary" asChild className="group bg-white text-primary hover:bg-orange-50">
            <Link href="/register">
              Get Started — It&apos;s Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild className="border-white/40 text-white hover:bg-white/10 hover:text-white">
            <Link href="#features">Learn More</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
