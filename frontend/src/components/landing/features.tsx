"use client";

import { motion } from "framer-motion";
import { Mic, Languages, FileText, BookOpen, Landmark, Brain, MessageCircle, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Mic,
    title: "Voice-First AI",
    description: "Speak to your AI mentor in any Indian language. No typing needed — just talk.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Languages,
    title: "13 Indian Languages",
    description: "Hindi, Tamil, Telugu, Kannada, Malayalam, Gujarati, Marathi, and more.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: MessageCircle,
    title: "AI Business Mentor",
    description: "Get personalised business advice, marketing tips, and growth strategies in your language.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Landmark,
    title: "Govt. Scheme Finder",
    description: "Instantly discover the right government schemes for your business, farm, or education.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: FileText,
    title: "Document OCR",
    description: "Scan Aadhaar, land records, crop certificates — extract and translate instantly.",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: BookOpen,
    title: "Learning Modules",
    description: "Bite-sized lessons on business, finance, farming, and digital literacy in your language.",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    icon: Brain,
    title: "Gemini-Powered",
    description: "Built on Google Gemini 2.0 Flash — fast, accurate, and culturally aware AI.",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "See your learning journey, completed modules, and business milestones at a glance.",
    color: "bg-teal-100 text-teal-600",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            className="text-sm font-semibold text-primary uppercase tracking-wider mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Everything You Need
          </motion.p>
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Built for Bharat, by Bharat
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Every feature designed with India's rural and semi-urban entrepreneurs in mind.
          </motion.p>
        </div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={item}>
              <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow bg-gray-50/50 hover:bg-white">
                <CardContent className="pt-6">
                  <div className={`w-10 h-10 rounded-lg ${f.color} flex items-center justify-center mb-4`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
