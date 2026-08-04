"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Crown, Zap, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app.store";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Plan {
  id: number; name: string; nameHindi: string;
  priceMonthly: number; priceYearly: number; features: string[];
}

const PLAN_ICONS = [Sparkles, Zap, Crown];
const PLAN_COLORS = ["bg-gray-100 text-gray-600", "bg-blue-100 text-blue-600", "bg-orange-100 text-orange-600"];
const PLAN_HIGHLIGHT = [false, false, true];

export default function SubscriptionPage() {
  const { language } = useAppStore();
  const isHindi = language === "Hindi";

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["subscription-plans"],
    queryFn: () => apiClient.get("/payments/plans").then(r => r.data),
  });

  const { data: mySubscription } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => apiClient.get("/payments/my-subscription").then(r => r.data),
  });

  const handleSubscribe = (plan: Plan) => {
    if (plan.priceMonthly === 0) {
      toast.info("You are already on the Free plan.");
      return;
    }
    // TODO: integrate Razorpay checkout
    toast.info("Payment gateway integration coming soon! This is a demo.");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          {isHindi ? "अपनी योजना चुनें" : "Choose Your Plan"}
        </h1>
        <p className="text-muted-foreground">
          {isHindi
            ? "BhashaSetu के साथ अपने व्यापार को नई ऊंचाइयों पर ले जाएं"
            : "Take your business to new heights with BhashaSetu AI"}
        </p>
        {mySubscription && (
          <Badge variant="secondary" className="text-xs">
            {isHindi ? "वर्तमान योजना: " : "Current plan: "}
            <span className="font-semibold ml-1">{mySubscription.plan}</span>
          </Badge>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, i) => {
          const Icon = PLAN_ICONS[i] ?? Sparkles;
          const colorClass = PLAN_COLORS[i] ?? PLAN_COLORS[0];
          const highlighted = PLAN_HIGHLIGHT[i] ?? false;
          const isCurrent = mySubscription?.plan === plan.name;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className={cn(
                "border-0 shadow-sm relative flex flex-col h-full",
                highlighted && "ring-2 ring-primary shadow-lg scale-[1.02]"
              )}>
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="text-xs px-3 py-0.5">
                      {isHindi ? "सबसे लोकप्रिय" : "Most Popular"}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2", colorClass)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">
                    {isHindi && plan.nameHindi ? plan.nameHindi : plan.name}
                  </CardTitle>
                  <div className="mt-1">
                    {plan.priceMonthly === 0 ? (
                      <p className="text-2xl font-bold">{isHindi ? "मुफ्त" : "Free"}</p>
                    ) : (
                      <div>
                        <span className="text-2xl font-bold">₹{plan.priceMonthly}</span>
                        <span className="text-muted-foreground text-sm">/{isHindi ? "माह" : "mo"}</span>
                        <p className="text-xs text-muted-foreground">
                          ₹{plan.priceYearly}/{isHindi ? "वर्ष" : "yr"} (
                          {Math.round(100 - (plan.priceYearly / (plan.priceMonthly * 12)) * 100)}% {isHindi ? "बचत" : "off"})
                        </p>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col flex-1 justify-between gap-4">
                  <ul className="space-y-2">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={highlighted ? "default" : "outline"}
                    disabled={isCurrent}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {isCurrent
                      ? (isHindi ? "वर्तमान योजना" : "Current Plan")
                      : plan.priceMonthly === 0
                        ? (isHindi ? "मुफ्त शुरू करें" : "Get Started Free")
                        : (isHindi ? "अभी शुरू करें" : "Upgrade Now")}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground">
        {isHindi
          ? "सभी योजनाओं में 7-दिन की मनी-बैक गारंटी। कोई छिपा हुआ शुल्क नहीं।"
          : "All paid plans include a 7-day money-back guarantee. No hidden charges."}
      </p>
    </div>
  );
}
