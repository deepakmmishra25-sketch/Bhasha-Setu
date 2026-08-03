"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plus, Loader2, Bot, User, Mic } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore } from "@/store/app.store";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message { id: number; role: "user" | "assistant"; content: string; createdAt?: string; }
interface Session { id: string; title: string; language: string; updatedAt: string; }

export default function ChatPage() {
  const { user } = useAuthStore();
  const { language } = useAppStore();
  const qc = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ["chat-sessions"],
    queryFn: () => apiClient.get("/chat/sessions").then(r => r.data),
  });

  const sendMutation = useMutation({
    mutationFn: (msg: string) =>
      apiClient.post("/chat/send", { message: msg, session_id: sessionId, language }),
    onSuccess: (res) => {
      const { sessionId: sid, userMessage, aiMessage } = res.data;
      if (!sessionId) setSessionId(sid);
      setMessages(prev => [...prev, userMessage, aiMessage]);
      qc.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
    onError: () => toast.error("Failed to send message"),
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadSession = async (sid: string) => {
    setSessionId(sid);
    const res = await apiClient.get(`/chat/sessions/${sid}/messages`);
    setMessages(res.data);
  };

  const newChat = () => { setSessionId(null); setMessages([]); };

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || sendMutation.isPending) return;
    setInput("");
    // Optimistic user message
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: msg }]);
    sendMutation.mutate(msg);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sessions sidebar */}
      <div className="w-56 shrink-0 flex flex-col gap-2">
        <Button size="sm" onClick={newChat} className="w-full gap-2">
          <Plus className="w-4 h-4" /> New Chat
        </Button>
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => loadSession(s.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors truncate",
                  sessionId === s.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-100 text-gray-600"
                )}
              >
                {s.title}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-saffron-500 to-orange-600 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">BhashaSetu AI Mentor</p>
            <p className="text-xs text-muted-foreground">Responding in {language}</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-saffron-100 to-orange-100 rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-saffron-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">Ask me anything</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Business tips, farming advice, government schemes, finance — in your language.
                </p>
              </div>
              {[
                "मुझे मुद्रा लोन कैसे मिलेगा?",
                "My crop prices are low — what should I do?",
                "How to start a small business with ₹10,000?",
              ].map(s => (
                <button key={s} onClick={() => { setInput(s); }} className="block mt-2 text-xs text-primary hover:underline">
                  &ldquo;{s}&rdquo;
                </button>
              ))}
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={m.id ?? i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-2 mb-4", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 bg-gradient-to-br from-saffron-500 to-orange-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                )}>
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {sendMutation.isPending && (
            <div className="flex gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-to-br from-saffron-500 to-orange-600 rounded-full flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </ScrollArea>

        {/* Input */}
        <div className="px-4 py-3 border-t flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={language === "Hindi" ? "अपना सवाल लिखें..." : "Ask your question..."}
            className="flex-1"
            disabled={sendMutation.isPending}
          />
          <Button size="icon" variant="ghost" className="shrink-0">
            <Mic className="w-4 h-4 text-gray-400" />
          </Button>
          <Button size="icon" onClick={handleSend} disabled={!input.trim() || sendMutation.isPending} className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
