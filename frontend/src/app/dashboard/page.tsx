"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MessageCircle,
  BookOpen,
  Landmark,
  FileText,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore } from "@/store/app.store";
import apiClient from "@/lib/api";

const QUICK_ACTIONS = [
  {
    label: "Ask AI Mentor",
    labelHi: "AI मेंटर से पूछें",
    href: "/dashboard/chat",
    icon: MessageCircle,
    color: "bg-blue-500",
  },
  {
    label: "Start Learning",
    labelHi: "सीखना शुरू करें",
    href: "/dashboard/lessons",
    icon: BookOpen,
    color: "bg-green-500",
  },
  {
    label: "Find Schemes",
    labelHi: "योजनाएं खोजें",
    href: "/dashboard/schemes",
    icon: Landmark,
    color: "bg-purple-500",
  },
  {
    label: "Scan Document",
    labelHi: "दस्तावेज़ स्कैन करें",
    href: "/dashboard/ocr",
    icon: FileText,
    color: "bg-orange-500",
  },
];

const ACTIVITY_ICONS: Record<string, { icon: typeof BookOpen; color: string }> = {
  lesson: { icon: BookOpen, color: "bg-green-100 text-green-600" },
  chat: { icon: MessageCircle, color: "bg-blue-100 text-blue-600" },
  scheme: { icon: Landmark, color: "bg-purple-100 text-purple-600" },
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { language } = useAppStore();
  const isHindi = language === "Hindi";

  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiClient.get("/dashboard/summary").then((r) => r.data),
  });

  const stats = summary?.stats ?? {
    completedLessons: 0,
    totalLessons: 0,
    progressPercent: 0,
    chatSessions: 0,
    schemesViewed: 0,
    documentsScanned: 0,
  };
  const recentActivity: Array<{ type: string; title: string; subtitle: string; timestamp: string }> =
    summary?.recentActivity ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900">
          {isHindi
            ? `नमस्ते, ${user?.name?.split(" ")[0]} 👋`
            : `Hello, ${user?.name?.split(" ")[0]} 👋`}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isHindi
            ? "आज आप क्या सीखना या करना चाहते हैं?"
            : "What would you like to learn or do today?"}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: isHindi ? "पाठ पूरे किए" : "Lessons Done",
            value: stats.completedLessons,
            color: "text-green-600",
          },
          {
            label: isHindi ? "AI बातचीत" : "AI Chats",
            value: stats.chatSessions,
            color: "text-blue-600",
          },
          {
            label: isHindi ? "योजनाएं देखी" : "Schemes Viewed",
            value: stats.schemesViewed,
            color: "text-purple-600",
          },
          {
            label: isHindi ? "दस्तावेज़" : "Docs Scanned",
            value: stats.documentsScanned,
            color: "text-orange-600",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 pb-4">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Learning progress */}
      {stats.totalLessons > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {isHindi ? "सीखने की प्रगति" : "Learning Progress"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>
                  {stats.completedLessons} / {stats.totalLessons}{" "}
                  {isHindi ? "पाठ" : "lessons"}
                </span>
                <span className="font-semibold text-primary">{stats.progressPercent}%</span>
              </div>
              <Progress value={stats.progressPercent} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {isHindi ? "त्वरित कार्य" : "Quick Actions"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link href={action.href}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                  <CardContent className="pt-5 pb-4 text-center">
                    <div
                      className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      {isHindi ? action.labelHi : action.label}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Prompt banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-saffron-500 to-orange-600 rounded-2xl p-5 text-white flex flex-col justify-between gap-4 min-h-[120px]"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold text-sm">
                {isHindi ? "AI मेंटर तैयार है" : "AI Mentor is ready"}
              </span>
            </div>
            <p className="text-orange-100 text-sm">
              {isHindi
                ? "अपनी भाषा में व्यापार, खेती, या सरकारी योजनाओं के बारे में पूछें।"
                : "Ask about business, farming, or government schemes in your language."}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="self-start bg-white text-primary hover:bg-orange-50"
          >
            <Link href="/dashboard/chat">
              {isHindi ? "बात करें" : "Chat Now"}{" "}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {isHindi ? "हाल की गतिविधि" : "Recent Activity"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {isHindi
                    ? "कोई हाल की गतिविधि नहीं। कुछ सीखना शुरू करें!"
                    : "No recent activity yet. Start learning!"}
                </p>
              ) : (
                <ul className="space-y-2">
                  {recentActivity.map((item, i) => {
                    const cfg = ACTIVITY_ICONS[item.type] ?? ACTIVITY_ICONS.lesson;
                    const Icon = cfg.icon;
                    return (
                      <li key={i} className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                        </div>
                        {item.timestamp && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {timeAgo(item.timestamp)}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
