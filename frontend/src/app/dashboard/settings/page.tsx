"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, User, Globe, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore, SUPPORTED_LANGUAGES } from "@/store/app.store";
import apiClient from "@/lib/api";

const OCCUPATIONS = ["Farmer", "MSME Owner", "Student", "Woman Entrepreneur", "Trader", "Artisan", "Other"];
const INDIAN_STATES = ["Andhra Pradesh","Bihar","Gujarat","Haryana","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal","Other"];

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { language: appLang, setLanguage } = useAppStore();

  const [name, setName] = useState(user?.name ?? "");
  const [occupation, setOccupation] = useState(user?.occupation ?? "");
  const [state, setState] = useState(user?.state ?? "");
  const [language, setLang] = useState(user?.language ?? "English");

  const mutation = useMutation({
    mutationFn: () => apiClient.patch("/users/me", { name, occupation, state, language }),
    onSuccess: (res) => {
      setUser(res.data);
      setLanguage(language);
      toast.success("Profile updated!");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" />Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Occupation</Label>
              <Select value={occupation} onValueChange={setOccupation}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{OCCUPATIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4" />Language Preference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label>Preferred Language</Label>
            <Select value={language} onValueChange={setLang}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map(l => <SelectItem key={l.code} value={l.name}>{l.native} · {l.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">The AI will respond in this language by default.</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="gap-2">
        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Changes
      </Button>
    </div>
  );
}
