"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Languages", href: "#languages" },
  { label: "For Farmers", href: "#farmers" },
  { label: "Schemes", href: "#schemes" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">
              Bhasha<span className="text-primary">Setu</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-white"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/register">Get Started Free</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
