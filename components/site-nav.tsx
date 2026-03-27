import Link from "next/link";
import { GroveLogo } from "@/components/grove-logo";

export function SiteNav() {
  return (
    <nav className="w-full flex justify-between items-center px-8 py-4 border-b border-grove-dark/[0.08] bg-grove-base">
      <GroveLogo />
      <div className="hidden md:flex gap-7 text-sm font-normal text-grove-text-muted">
        <Link
          href="/marketplace"
          className="hover:text-grove-dark transition-colors"
        >
          Marketplace
        </Link>
        <Link
          href="/sellers"
          className="hover:text-grove-dark transition-colors"
        >
          Sellers
        </Link>
        <Link href="/about" className="hover:text-grove-dark transition-colors">
          About
        </Link>
      </div>
      <div className="flex gap-3 items-center">
        <Link
          href="/auth/login"
          className="text-xs font-normal text-grove-dark px-4 py-2 border border-grove-dark/25 rounded-[3px] hover:border-grove-dark/50 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/auth/sign-up"
          className="text-xs font-medium text-grove-base bg-grove-dark px-4 py-2 rounded-[3px] hover:bg-grove-dark-hover transition-colors"
        >
          Start selling
        </Link>
      </div>
    </nav>
  );
}
