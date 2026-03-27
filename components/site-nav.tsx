import Link from "next/link";
import { GroveLogo } from "@/components/grove-logo";

export function SiteNav() {
  return (
    <nav className="w-full flex justify-between items-center px-8 py-4 border-b border-[#2C2C2C]/[0.08] bg-[#F5F2ED]">
      <GroveLogo />
      <div className="hidden md:flex gap-7 text-sm font-normal text-[#6B6B5E]">
        <Link
          href="/marketplace"
          className="hover:text-[#2C2C2C] transition-colors"
        >
          Marketplace
        </Link>
        <Link
          href="/sellers"
          className="hover:text-[#2C2C2C] transition-colors"
        >
          Sellers
        </Link>
        <Link href="/about" className="hover:text-[#2C2C2C] transition-colors">
          About
        </Link>
      </div>
      <div className="flex gap-3 items-center">
        <Link
          href="/auth/login"
          className="text-xs font-normal text-[#2C2C2C] px-4 py-2 border border-[#2C2C2C]/25 rounded-[3px] hover:border-[#2C2C2C]/50 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/auth/sign-up"
          className="text-xs font-medium text-[#F5F2ED] bg-[#2C2C2C] px-4 py-2 rounded-[3px] hover:bg-[#3D3D35] transition-colors"
        >
          Start selling
        </Link>
      </div>
    </nav>
  );
}
