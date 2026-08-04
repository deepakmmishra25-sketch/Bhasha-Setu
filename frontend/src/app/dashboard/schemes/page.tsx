"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ExternalLink, Landmark, Filter, Sparkles, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app.store";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";

interface Scheme {
  id: number; name: string; nameHindi?: string; category: string;
  ministry: string; description: string; eligibility: string;
  benefits: string; websiteUrl?: string; targetAudience: string; reason?: string;
}

const CATEGORIES = ["All", "finance", "farming", "business", "education", "digital", "health"];

function SchemeCard({ s, isHindi, featured }: { s: Scheme; isHindi: boolean; featured?: boolean }) {
  return (
    <Card className={cn("border-0 shadow-sm hover:shadow-md transition-all", featured && "ring-2 ring-primary/30 bg-primary/5")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{isHindi && s.nameHindi ? s.nameHindi : s.name}</CardTitle>
            {isHindi && s.nameHindi && <p className="text-xs text-muted-foreground mt-0.5">{s.name}</p>}
          </div>
          <Badge variant="outline" className="shrink-0 capitalize">{s.category}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{s.ministry}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {s.reason && (
          <div className="flex items-start gap-2 bg-primary/10 rounded-lg px-3 py-2 text-xs text-primary">
            <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
            <p>{s.reason}</p>
          </div>
        )}
        <p className="text-sm text-gray-700">{s.description}</p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div>
            <p className="font-semibold text-gray-500 mb-0.5">{isHindi ? "पात्रता" : "Eligibility"}</p>
            <p className="text-gray-600">{s.eligibility}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500 mb-0.5">{isHindi ? "लाभ" : "Benefits"}</p>
            <p className="text-gray-600">{s.benefits}</p>
          </div>
        </div>
        {s.websiteUrl && (
          <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
            {isHindi ? "अभी आवेदन करें" : "Apply Now"} <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}

export default function SchemesPage() {
  const { language } = useAppStore();
  const isHindi = language === "Hindi";
  const [q, setQ] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [aiResults, setAiResults] = useState<{ schemes: Scheme[]; aiSummary: string } | null>(null);

  const { data: schemes = [], isLoading } = useQuery<Scheme[]>({
    queryKey: ["schemes", search, category],
    queryFn: () =>
      apiClient.get("/schemes", {
        params: { q: search || undefined, category: category === "All" ? undefined : category, limit: 50 },
      }).then(r => r.data),
    staleTime: 30000,
  });

  const aiMutation = useMutation({
    mutationFn: (query: string) =>
      apiClient.post("/schemes/recommend", { query, language }).then(r => r.data),
    onSuccess: (data) => setAiResults(data),
  });

  const handleAiSearch = () => {
    const q = aiQuery.trim();
    if (!q) return;
    aiMutation.mutate(q);
  };

  const clearAi = () => { setAiResults(null); setAiQuery(""); };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Landmark className="w-6 h-6 text-primary" />
          {isHindi ? "सरकारी योजनाएं" : "Government Schemes"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isHindi ? "आपके लिए सही सरकारी योजना खोजें" : "Find the right government scheme for you"}
        </p>
      </div>

      {/* AI Recommendation search */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-orange-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-primary">
              {isHindi ? "AI से सही योजना खोजें" : "Find your scheme with AI"}
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAiSearch()}
              placeholder={isHindi
                ? "जैसे: मैं एक महिला हूं और छोटा व्यापार शुरू करना चाहती हूं"
                : "e.g. I'm a farmer with 1 acre and want to grow vegetables"}
              className="flex-1 bg-white"
            />
            <Button onClick={handleAiSearch} disabled={!aiQuery.trim() || aiMutation.isPending} className="gap-2">
              {aiMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isHindi ? "खोजें" : "Ask AI"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Results */}
      <AnimatePresence>
        {aiResults && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {isHindi ? "AI की सिफारिश" : "AI Recommendations"}
              </p>
              <Button variant="ghost" size="sm" onClick={clearAi} className="h-7 gap-1 text-xs">
                <X className="w-3 h-3" /> {isHindi ? "साफ करें" : "Clear"}
              </Button>
            </div>
            {aiResults.aiSummary && (
              <div className="bg-primary/5 rounded-xl px-4 py-3 text-sm text-gray-700 border border-primary/10">
                {aiResults.aiSummary}
              </div>
            )}
            {aiResults.schemes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No matching schemes found for your query.</p>
            ) : (
              <div className="space-y-3">
                {aiResults.schemes.map(s => <SchemeCard key={s.id} s={s} isHindi={isHindi} featured />)}
              </div>
            )}
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-3">
                {isHindi ? "सभी योजनाएं देखें" : "Browse all schemes"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isHindi ? "योजना खोजें..." : "Search schemes..."}
            className="pl-9"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && setSearch(q)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>
                {c === "All" ? (isHindi ? "सभी" : "All Categories") : c.charAt(0).toUpperCase() + c.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setSearch(q)}>{isHindi ? "खोजें" : "Search"}</Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Landmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{isHindi ? "कोई योजना नहीं मिली" : "No schemes found"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schemes.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <SchemeCard s={s} isHindi={isHindi} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
