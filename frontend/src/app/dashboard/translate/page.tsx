"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeftRight, Copy, Loader2, Languages } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/store/app.store";
import apiClient from "@/lib/api";

export default function TranslatePage() {
  const [sourceText, setSourceText] = useState("");
  const [targetLang, setTargetLang] = useState("Hindi");
  const [result, setResult] = useState("");

  const mutation = useMutation({
    mutationFn: () => apiClient.post("/translate", { text: sourceText, target_language: targetLang }),
    onSuccess: (res) => setResult(res.data.translatedText),
    onError: () => toast.error("Translation failed"),
  });

  const swap = () => { setSourceText(result); setResult(sourceText); };
  const copy = () => { navigator.clipboard.writeText(result); toast.success("Copied!"); };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Languages className="w-6 h-6 text-primary" /> Translate
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Translate any text into 13 Indian languages</p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* Language selector */}
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-gray-50">
          <span className="text-sm text-muted-foreground">Auto-detect</span>
          <button onClick={swap} className="p-1.5 rounded-md hover:bg-gray-200 transition-colors">
            <ArrowLeftRight className="w-4 h-4 text-gray-500" />
          </button>
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map(l => (
                <SelectItem key={l.code} value={l.name}>{l.native} · {l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 divide-x">
          <div className="p-4">
            <textarea
              className="w-full h-48 text-sm resize-none outline-none placeholder:text-muted-foreground"
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={e => setSourceText(e.target.value)}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">{sourceText.length} chars</span>
              <Button size="sm" onClick={() => mutation.mutate()} disabled={!sourceText.trim() || mutation.isPending}>
                {mutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                Translate
              </Button>
            </div>
          </div>

          <div className="p-4 bg-gray-50/50 relative">
            <div className="w-full h-48 text-sm text-gray-700 overflow-y-auto leading-relaxed">
              {mutation.isPending ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Translating...
                </div>
              ) : result || <span className="text-muted-foreground">Translation will appear here</span>}
            </div>
            {result && (
              <button onClick={copy} className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-gray-200 transition-colors">
                <Copy className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
