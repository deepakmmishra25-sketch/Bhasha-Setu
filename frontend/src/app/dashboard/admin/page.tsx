"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Users, MessageCircle, BookOpen, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => { if (user && user.role !== "admin") router.replace("/dashboard"); }, [user, router]);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiClient.get("/admin/stats").then(r => r.data),
    enabled: user?.role === "admin",
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiClient.get("/admin/users").then(r => r.data),
    enabled: user?.role === "admin",
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-purple-500" />Admin Panel</h1>

      {/* Platform stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats?.users?.total ?? "—", icon: Users, color: "text-blue-500" },
          { label: "Active Users", value: stats?.users?.active ?? "—", icon: TrendingUp, color: "text-green-500" },
          { label: "Chat Sessions", value: stats?.chats?.total ?? "—", icon: MessageCircle, color: "text-purple-500" },
          { label: "Lesson Completions", value: stats?.lessons?.completions ?? "—", icon: BookOpen, color: "text-orange-500" },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <s.icon className={`w-8 h-8 ${s.color} opacity-80`} />
              <div>
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User list */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base">Recent Users</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left pb-2 font-medium">Name</th>
                  <th className="text-left pb-2 font-medium">Email</th>
                  <th className="text-left pb-2 font-medium">Language</th>
                  <th className="text-left pb-2 font-medium">Role</th>
                  <th className="text-left pb-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u: { id: string; name: string; email: string; language: string; role: string; isActive: boolean; createdAt: string }) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 font-medium">{u.name}</td>
                    <td className="py-2.5 text-muted-foreground">{u.email}</td>
                    <td className="py-2.5">{u.language}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                    </td>
                    <td className="py-2.5 text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
