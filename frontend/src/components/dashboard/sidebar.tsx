"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MessageCircle, BookOpen, Landmark,
  FileText, Languages, Bell, Settings, Globe, LogOut,
  ChevronLeft, ChevronRight, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore } from "@/store/app.store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/chat", label: "AI Mentor", icon: MessageCircle },
  { href: "/dashboard/lessons", label: "Learn", icon: BookOpen },
  { href: "/dashboard/schemes", label: "Gov. Schemes", icon: Landmark },
  { href: "/dashboard/translate", label: "Translate", icon: Languages },
  { href: "/dashboard/ocr", label: "Scan Document", icon: FileText },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col bg-gray-900 text-white shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron-500 to-orange-600 flex items-center justify-center shrink-0">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="ml-2 font-bold text-sm whitespace-nowrap"
            >
              BhashaSetu AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors group",
                active ? "bg-saffron-500/20 text-saffron-400" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
        {user?.role === "admin" && (
          <Link
            href="/dashboard/admin"
            className={cn(
              "flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors",
              pathname.startsWith("/dashboard/admin") ? "bg-purple-500/20 text-purple-400" : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
          >
            <ShieldCheck className="w-5 h-5 shrink-0" />
            {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Admin</motion.span>}
          </Link>
        )}
      </nav>

      {/* User + logout */}
      <div className="border-t border-gray-800 p-3 space-y-2">
        {sidebarOpen && user && (
          <div className="flex items-center gap-2 px-1">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="bg-saffron-500 text-white text-xs">{user.name[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.language}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 -right-3 w-6 h-6 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors z-10"
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3 text-gray-300" /> : <ChevronRight className="w-3 h-3 text-gray-300" />}
      </button>
    </motion.aside>
  );
}
