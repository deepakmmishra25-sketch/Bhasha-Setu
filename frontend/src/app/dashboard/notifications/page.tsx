"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api";

interface Notif { id: number; title: string; message: string; type: string; isRead: boolean; createdAt: string; }

const TYPE_ICON: Record<string, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: "text-blue-500" },
  success: { icon: CheckCircle, color: "text-green-500" },
  warning: { icon: AlertTriangle, color: "text-yellow-500" },
  error: { icon: XCircle, color: "text-red-500" },
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery<Notif[]>({
    queryKey: ["notifications"],
    queryFn: () => apiClient.get("/notifications").then(r => r.data),
    refetchInterval: 30000,
  });

  const readMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const readAllMutation = useMutation({
    mutationFn: () => apiClient.post("/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Notifications
          </h1>
          {unreadCount > 0 && <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => readAllMutation.mutate()} className="gap-1.5">
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const { icon: Icon, color } = TYPE_ICON[n.type] ?? TYPE_ICON.info;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border transition-colors",
                  n.isRead ? "bg-white border-gray-100" : "bg-blue-50/50 border-blue-100"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", color)} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", n.isRead ? "text-gray-700" : "text-gray-900")}>{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                {!n.isRead && (
                  <button onClick={() => readMutation.mutate(n.id)} className="p-1 hover:bg-gray-200 rounded transition-colors shrink-0">
                    <Check className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
