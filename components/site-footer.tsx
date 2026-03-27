import Link from "next/link";
import { GroveLogo } from "@/components/grove-logo";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-grove-dark/[0.08] px-8 py-7 flex flex-col sm:flex-row justify-between items-center gap-4">
      <GroveLogo size="sm" />
      <div className="flex gap-6 text-xs text-grove-text-muted">
        <Link href="/privacy" className="hover:text-grove-dark transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-grove-dark transition-colors">
          Terms
        </Link>
        <Link href="/help" className="hover:text-grove-dark transition-colors">
          Help
        </Link>
      </div>
      <p className="text-xs font-light text-grove-text-dim italic">
        Shop with intention.
      </p>
    </footer>
  );
}
