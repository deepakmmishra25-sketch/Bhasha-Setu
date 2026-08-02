"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const languages = [
  {
    code: "hi",
    name: "Hindi",
    native: "हिन्दी",
    sample: "अपना व्यापार बढ़ाएं AI की मदद से",
    translation: "Grow your business with AI",
    speakers: "52 crore speakers",
    color: "border-orange-300 bg-orange-50",
    activeColor: "border-orange-500 bg-orange-100",
    dot: "bg-orange-500",
  },
  {
    code: "ta",
    name: "Tamil",
    native: "தமிழ்",
    sample: "AI உதவியுடன் உங்கள் வணிகத்தை வளர்க்கவும்",
    translation: "Grow your business with AI help",
    speakers: "8 crore speakers",
    color: "border-blue-300 bg-blue-50",
    activeColor: "border-blue-500 bg-blue-100",
    dot: "bg-blue-500",
  },
  {
    code: "te",
    name: "Telugu",
    native: "తెలుగు",
    sample: "AIతో మీ వ్యాపారాన్ని పెంచండి",
    translation: "Grow your business with AI",
    speakers: "9 crore speakers",
    color: "border-purple-300 bg-purple-50",
    activeColor: "border-purple-500 bg-purple-100",
    dot: "bg-purple-500",
  },
  {
    code: "mr",
    name: "Marathi",
    native: "मराठी",
    sample: "AI च्या मदतीने आपला व्यवसाय वाढवा",
    translation: "Grow your business with AI help",
    speakers: "8.3 crore speakers",
    color: "border-green-300 bg-green-50",
    activeColor: "border-green-500 bg-green-100",
    dot: "bg-green-500",
  },
  {
    code: "gu",
    name: "Gujarati",
    native: "ગુજરાતી",
    sample: "AI ની મદદથી તમારો વ્યવસાય વધારો",
    translation: "Grow your business with AI help",
    speakers: "5.5 crore speakers",
    color: "border-yellow-300 bg-yellow-50",
    activeColor: "border-yellow-500 bg-yellow-100",
    dot: "bg-yellow-500",
  },
  {
    code: "bn",
    name: "Bengali",
    native: "বাংলা",
    sample: "AI-এর সাহায্যে আপনার ব্যবসা বাড়ান",
    translation: "Grow your business with AI help",
    speakers: "10 crore speakers",
    color: "border-pink-300 bg-pink-50",
    activeColor: "border-pink-500 bg-pink-100",
    dot: "bg-pink-500",
  },
];

export function LanguageShowcase() {
  const [active, setActive] = useState(0);
  const lang = languages[active];

  return (
    <section id="languages" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Speak Your Language
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            BhashaSetu AI understands and responds in 13 Indian languages — so you never have to think in English again.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Language pills */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {languages.map((l, i) => (
              <button
                key={l.code}
                onClick={() => setActive(i)}
                className={cn(
                  "px-4 py-2.5 rounded-xl border-2 transition-all text-left",
                  i === active ? l.activeColor : l.color,
                  "hover:scale-105"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", l.dot)} />
                  <span className="font-medium text-sm">{l.native}</span>
                  <span className="text-xs text-muted-foreground">({l.name})</span>
                </div>
              </button>
            ))}
            <div className="px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-sm text-muted-foreground flex items-center">
              +7 more
            </div>
          </div>

          {/* Sample card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border-2", lang.activeColor)}>
                  <span className="text-sm font-bold">{lang.code.toUpperCase()}</span>
                </div>
                <div>
                  <div className="font-semibold">{lang.native} · {lang.name}</div>
                  <div className="text-xs text-muted-foreground">{lang.speakers}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xl font-medium text-gray-900 leading-relaxed">{lang.sample}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">EN</span>
                <span>{lang.translation}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
