"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Clock, CheckCircle, Bookmark, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAppStore } from "@/store/app.store";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";

interface Category { id: number; slug: string; name: string; nameHindi?: string; icon: string; color: string; }
interface Lesson { id: number; categoryId: number; title: string; titleHindi?: string; description: string; level: string; durationMinutes: number; completed: boolean; bookmarked: boolean; }

const LEVEL_COLOR: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

export default function LessonsPage() {
  const { language } = useAppStore();
  const isHindi = language === "Hindi";
  const qc = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<number | undefined>();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiClient.get("/lessons/categories").then(r => r.data),
  });

  const { data: lessons = [], isLoading } = useQuery<Lesson[]>({
    queryKey: ["lessons", activeCategory],
    queryFn: () => apiClient.get("/lessons", { params: { category_id: activeCategory, limit: 50 } }).then(r => r.data),
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/lessons/${id}/complete`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lessons"] }); toast.success("Lesson completed! 🎉"); },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">{isHindi ? "सीखें" : "Learn"}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isHindi ? "अपनी गति से, अपनी भाषा में सीखें" : "Learn at your own pace, in your language"}
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(undefined)}
          className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors", !activeCategory ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
        >
          All
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors", activeCategory === c.id ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
          >
            {isHindi && c.nameHindi ? c.nameHindi : c.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{isHindi ? "कोई पाठ नहीं मिला" : "No lessons found"}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className={cn("border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group", l.completed && "ring-1 ring-green-300")}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className={cn("text-xs font-medium", LEVEL_COLOR[l.level])}>
                      {l.level}
                    </Badge>
                    {l.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {isHindi && l.titleHindi ? l.titleHindi : l.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{l.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> {l.durationMinutes} min
                    </div>
                    {!l.completed && (
                      <button
                        onClick={() => completeMutation.mutate(l.id)}
                        className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5"
                      >
                        Complete <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
