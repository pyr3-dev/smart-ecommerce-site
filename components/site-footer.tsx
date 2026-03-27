import Link from "next/link";
import { GroveLogo } from "@/components/grove-logo";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-[#2C2C2C]/[0.08] px-8 py-7 flex flex-col sm:flex-row justify-between items-center gap-4">
      <GroveLogo size="sm" />
      <div className="flex gap-6 text-xs text-[#6B6B5E]">
        <Link href="/privacy" className="hover:text-[#2C2C2C] transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-[#2C2C2C] transition-colors">
          Terms
        </Link>
        <Link href="/help" className="hover:text-[#2C2C2C] transition-colors">
          Help
        </Link>
      </div>
      <p className="text-xs font-light text-[#A8A89A] italic">
        Shop with intention.
      </p>
    </footer>
  );
}
