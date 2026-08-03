import Link from "next/link";
import { Globe } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-saffron-500 via-orange-500 to-orange-600 p-12 text-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">BhashaSetu AI</span>
        </Link>

        <div>
          <blockquote className="text-2xl font-medium leading-relaxed mb-6">
            &ldquo;अपनी भाषा में, अपना भविष्य बनाएं&rdquo;
          </blockquote>
          <p className="text-orange-100 text-lg">
            Build your future in your own language.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { v: "13", l: "Languages" },
              { v: "50K+", l: "Entrepreneurs" },
              { v: "200+", l: "Gov. Schemes" },
              { v: "Free", l: "Forever Plan" },
            ].map((s) => (
              <div key={s.l} className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold">{s.v}</div>
                <div className="text-orange-100 text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-orange-200 text-sm">© 2026 BhashaSetu AI · Made for Bharat 🇮🇳</p>
      </div>

      {/* Right — form */}
      <div className="flex flex-col items-center justify-center p-8">
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron-500 to-orange-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">BhashaSetu<span className="text-primary"> AI</span></span>
          </Link>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
