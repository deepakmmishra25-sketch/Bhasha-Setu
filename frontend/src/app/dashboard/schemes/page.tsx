"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, ExternalLink, Landmark, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app.store";
import apiClient from "@/lib/api";

interface Scheme { id: number; name: string; nameHindi?: string; category: string; ministry: string; description: string; eligibility: string; benefits: string; websiteUrl?: string; targetAudience: string; }

const CATEGORIES = ["All", "finance", "farming", "business", "education", "health"];

export default function SchemesPage() {
  const { language } = useAppStore();
  const isHindi = language === "Hindi";
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const { data: schemes = [], isLoading } = useQuery<Scheme[]>({
    queryKey: ["schemes", search, category],
    queryFn: () => apiClient.get("/schemes", { params: { q: search || undefined, category: category === "All" ? undefined : category, limit: 50 } }).then(r => r.data),
    staleTime: 30000,
  });

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

      {/* Search + filter */}
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
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c === "All" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setSearch(q)}>Search</Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Landmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No schemes found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schemes.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all">
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
                  <p className="text-sm text-gray-700">{s.description}</p>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-gray-500 mb-0.5">Eligibility</p>
                      <p className="text-gray-600">{s.eligibility}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-500 mb-0.5">Benefits</p>
                      <p className="text-gray-600">{s.benefits}</p>
                    </div>
                  </div>
                  {s.websiteUrl && (
                    <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                      Apply Now <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
