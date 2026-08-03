"use client";

import { Bell, Search } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore, SUPPORTED_LANGUAGES } from "@/store/app.store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopBar() {
  const { user } = useAuthStore();
  const { language, setLanguage } = useAppStore();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-4 px-6 shrink-0">
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search lessons, schemes..." className="pl-9 h-8 text-sm" />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Language selector */}
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.name} className="text-xs">
                {l.native} · {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-4 h-4 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarFallback className="bg-saffron-500 text-white text-xs font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
