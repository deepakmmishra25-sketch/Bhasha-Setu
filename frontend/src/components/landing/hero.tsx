"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mic, Languages, Sparkles, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const floatingLanguages = [
  { text: "नमस्ते", lang: "Hindi", color: "bg-orange-100 text-orange-700" },
  { text: "வணக்கம்", lang: "Tamil", color: "bg-green-100 text-green-700" },
  { text: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ", lang: "Punjabi", color: "bg-blue-100 text-blue-700" },
  { text: "నమస్కారం", lang: "Telugu", color: "bg-purple-100 text-purple-700" },
  { text: "ಹಲೋ", lang: "Kannada", color: "bg-pink-100 text-pink-700" },
  { text: "হ্যালো", lang: "Bengali", color: "bg-yellow-100 text-yellow-700" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-saffron-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-6 border-saffron-200 text-saffron-700 bg-saffron-50">
                <Sparkles className="w-3 h-3 mr-1" />
                India's #1 Multilingual AI Platform
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Grow Your Business in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-500 to-orange-600">
                Your Language
              </span>
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              BhashaSetu AI helps farmers, MSMEs, rural entrepreneurs, and students access AI-powered mentorship, government schemes, and business tools — in 13 Indian languages.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button size="xl" asChild className="group">
                <Link href="/register">
                  Start for Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="#demo">
                  <Mic className="w-4 h-4 mr-2" />
                  Try Voice Demo
                </Link>
              </Button>
            </motion.div>

            <motion.div
              className="flex items-center gap-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Free forever plan
              </div>
              <div className="flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-primary" />
                13 Indian languages
              </div>
              <div className="flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-primary" />
                Voice-first AI
              </div>
            </motion.div>
          </div>

          {/* Right — floating language cards */}
          <div className="relative hidden lg:flex items-center justify-center h-[480px]">
            {/* Central orb */}
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-saffron-400 to-orange-500 shadow-2xl flex items-center justify-center z-10"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Globe className="w-12 h-12 text-white" />
            </motion.div>

            {/* Language pills orbiting */}
            {floatingLanguages.map((item, i) => {
              const angle = (i / floatingLanguages.length) * 360;
              const rad = (angle * Math.PI) / 180;
              const radius = 180;
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;
              return (
                <motion.div
                  key={item.lang}
                  className={`absolute px-3 py-2 rounded-xl shadow-md ${item.color} border border-white/50`}
                  style={{ left: `calc(50% + ${x}px - 56px)`, top: `calc(50% + ${y}px - 20px)` }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="text-base font-semibold">{item.text}</div>
                  <div className="text-xs opacity-70">{item.lang}</div>
                </motion.div>
              );
            })}

            {/* Dashed orbit ring */}
            <div className="absolute w-[380px] h-[380px] rounded-full border-2 border-dashed border-saffron-200 opacity-40" />
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            { value: "13", label: "Indian Languages" },
            { value: "50K+", label: "Entrepreneurs Helped" },
            { value: "200+", label: "Govt. Schemes" },
            { value: "4.9★", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
