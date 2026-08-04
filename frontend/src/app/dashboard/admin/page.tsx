"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ShieldCheck, Users, MessageCircle, BookOpen, TrendingUp,
  Landmark, BarChart2, CheckCircle, XCircle, Search,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminUser {
  id: string; name: string; email: string; language: string;
  role: string; occupation?: string; isActive: boolean; createdAt: string;
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [userSearch, setUserSearch] = useState("");
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => { if (user && user.role !== "admin") router.replace("/dashboard"); }, [user, router]);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiClient.get("/admin/stats").then(r => r.data),
    enabled: user?.role === "admin",
  });

  const { data: users = [] } = useQuery<AdminUser[]>({
    queryKey: ["admin-users", searchQ],
    queryFn: () => apiClient.get("/admin/users", { params: { q: searchQ || undefined, limit: 50 } }).then(r => r.data),
    enabled: user?.role === "admin",
  });

  const { data: analytics } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => apiClient.get("/analytics/overview", { params: { days: 30 } }).then(r => r.data),
    enabled: user?.role === "admin",
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: { is_active?: boolean; role?: string } }) =>
      apiClient.patch(`/admin/users/${userId}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated");
    },
    onError: () => toast.error("Failed to update user"),
  });

  const statCards = [
    { label: "Total Users", value: stats?.users?.total ?? "—", icon: Users, color: "text-blue-500" },
    { label: "Active Users", value: stats?.users?.active ?? "—", icon: TrendingUp, color: "text-green-500" },
    { label: "Chat Sessions", value: stats?.chats?.total ?? "—", icon: MessageCircle, color: "text-purple-500" },
    { label: "Lesson Completions", value: stats?.lessons?.completions ?? "—", icon: BookOpen, color: "text-orange-500" },
    { label: "Total Lessons", value: stats?.lessons?.total ?? "—", icon: BookOpen, color: "text-indigo-500" },
    { label: "Schemes", value: stats?.schemes?.total ?? "—", icon: Landmark, color: "text-pink-500" },
    { label: "Analytics Events", value: stats?.analytics?.totalEvents ?? "—", icon: BarChart2, color: "text-teal-500" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-purple-500" /> Admin Panel
      </h1>

      {/* Platform stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.slice(0, 4).map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color} opacity-80`} />
                <div>
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {statCards.slice(4).map((s, i) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <s.icon className={`w-7 h-7 ${s.color} opacity-80`} />
              <div>
                <div className="text-lg font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics: top features + languages */}
      {analytics && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Top Features (30d)</CardTitle></CardHeader>
            <CardContent>
              {analytics.byFeature?.length === 0 ? (
                <p className="text-xs text-muted-foreground">No events yet</p>
              ) : (
                <ul className="space-y-1.5">
                  {(analytics.byFeature || []).slice(0, 6).map((f: { feature: string; count: number }) => (
                    <li key={f.feature} className="flex items-center justify-between text-xs">
                      <span className="capitalize text-gray-700">{f.feature}</span>
                      <Badge variant="secondary" className="text-xs">{f.count}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Top Languages (30d)</CardTitle></CardHeader>
            <CardContent>
              {analytics.byLanguage?.length === 0 ? (
                <p className="text-xs text-muted-foreground">No events yet</p>
              ) : (
                <ul className="space-y-1.5">
                  {(analytics.byLanguage || []).slice(0, 6).map((l: { language: string; count: number }) => (
                    <li key={l.language} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700">{l.language}</span>
                      <Badge variant="secondary" className="text-xs">{l.count}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* User list with search + actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Users</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-8 text-xs w-48"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && setSearchQ(userSearch)}
                />
              </div>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setSearchQ(userSearch)}>Search</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left pb-2 font-medium">Name</th>
                  <th className="text-left pb-2 font-medium">Email</th>
                  <th className="text-left pb-2 font-medium">Language</th>
                  <th className="text-left pb-2 font-medium">Role</th>
                  <th className="text-left pb-2 font-medium">Status</th>
                  <th className="text-left pb-2 font-medium">Joined</th>
                  <th className="text-left pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 font-medium">{u.name}</td>
                    <td className="py-2.5 text-muted-foreground text-xs">{u.email}</td>
                    <td className="py-2.5 text-xs">{u.language}</td>
                    <td className="py-2.5">
                      <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">{u.role}</Badge>
                    </td>
                    <td className="py-2.5">
                      {u.isActive
                        ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3 h-3" />Active</span>
                        : <span className="flex items-center gap-1 text-xs text-red-500"><XCircle className="w-3 h-3" />Inactive</span>
                      }
                    </td>
                    <td className="py-2.5 text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="py-2.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs px-2"
                        disabled={updateUserMutation.isPending}
                        onClick={() => updateUserMutation.mutate({ userId: u.id, payload: { is_active: !u.isActive } })}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-6">No users found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
