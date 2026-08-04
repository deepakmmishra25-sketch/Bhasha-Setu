import Link from "next/link";
import { Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Product: ["Features", "Pricing", "Languages", "API"],
  "For Users": ["Farmers", "MSMEs", "Students", "Women Entrepreneurs"],
  Company: ["About", "Blog", "Careers", "Press"],
  Legal: ["Privacy", "Terms", "Security"],
};

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">
                Bhasha<span className="text-saffron-400">Setu</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              India's multilingual AI platform for rural entrepreneurs and small businesses.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="bg-gray-800 mb-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2026 BhashaSetu AI. Made with ❤️ for Bharat.</p>
          <div className="flex items-center gap-1 text-xs">
            <span className="w-3 h-3 rounded-full bg-india-saffron inline-block" />
            <span className="w-3 h-3 rounded-full bg-white border border-gray-600 inline-block" />
            <span className="w-3 h-3 rounded-full bg-india-green inline-block" />
            <span className="ml-2">Jai Hind 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
