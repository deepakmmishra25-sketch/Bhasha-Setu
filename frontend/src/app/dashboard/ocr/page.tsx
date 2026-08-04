"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileText, Upload, Copy, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/store/app.store";
import apiClient from "@/lib/api";

export default function OCRPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState("Hindi");
  const [result, setResult] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append("file", file!);
      form.append("language", targetLang);
      return apiClient.post("/ocr/extract", form, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: (res) => { setResult(res.data.extractedText); toast.success("Text extracted!"); },
    onError: () => toast.error("OCR failed — check file format or API key"),
  });

  const handleFile = (f: File) => {
    setFile(f);
    setResult("");
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const clear = () => { setFile(null); setPreview(null); setResult(""); };
  const copy = () => { navigator.clipboard.writeText(result); toast.success("Copied!"); };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6 text-primary" /> Scan Document</h1>
        <p className="text-muted-foreground text-sm mt-1">Extract text from images and documents — Aadhaar, land records, crop certificates</p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        {/* Target language */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Extract in:</span>
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="w-40 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map(l => <SelectItem key={l.code} value={l.name}>{l.native} · {l.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Drop zone */}
        {!file ? (
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">Drop a file or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP, or PDF — max 10MB</p>
            <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                <span className="text-muted-foreground text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button onClick={clear}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
            </div>
            {preview && <img src={preview} alt="preview" className="max-h-48 rounded-lg object-contain mx-auto" />}
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Extracting...</> : "Extract Text"}
            </Button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-gray-50 rounded-xl p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Extracted Text</span>
              <button onClick={copy} className="p-1 hover:bg-gray-200 rounded transition-colors"><Copy className="w-3.5 h-3.5 text-gray-500" /></button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
