"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { GroveLogo } from "@/components/grove-logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn("flex flex-col min-h-screen bg-grove-base", className)}
      {...props}
    >
      {/* Brand strip */}
      <div className="px-7 py-5 border-b border-grove-dark/[0.07]">
        <GroveLogo />
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1">
        {/* Left ambient panel */}
        <div className="hidden md:flex w-[42%] bg-grove-dark flex-col justify-between p-10">
          <div>
            <p className="text-[15px] font-light text-grove-base leading-[1.65] italic">
              &ldquo;The best thing I ever did for my craft was find a platform
              that{" "}
              <span className="not-italic font-medium text-grove-sage">
                gets out of the way.
              </span>
              &rdquo;
            </p>
            <div className="flex gap-1.5 mt-5">
              <span className="w-[5px] h-[5px] rounded-full bg-grove-sage" />
              <span className="w-[5px] h-[5px] rounded-full bg-white/20" />
              <span className="w-[5px] h-[5px] rounded-full bg-white/20" />
            </div>
            <p className="text-[10px] text-grove-text-muted font-light mt-2">
              — Mara, ceramics seller
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="aspect-square rounded-[4px] bg-gradient-to-br from-[#D4C5A9] to-[#C4B49A]" />
            <div className="aspect-square rounded-[4px] bg-gradient-to-br from-[#7C9A78] to-[#5C7A58]" />
            <div className="aspect-square rounded-[4px] bg-[#3D3D35]" />
            <div className="aspect-square rounded-[4px] bg-gradient-to-br from-[#B8A898] to-[#A09080]" />
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-grove-sage mb-3">
              Welcome back
            </p>
            <h1 className="text-2xl font-medium tracking-[-0.02em] text-grove-dark mb-1.5">
              Sign in to Grove
            </h1>
            <p className="text-[13px] font-light text-grove-text-muted leading-relaxed mb-7">
              Continue to your shop or your orders.
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-medium tracking-[0.08em] uppercase text-grove-text-muted mb-1.5"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-grove-muted border-transparent focus:border-grove-sage focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[4px]"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="password"
                    className="text-[11px] font-medium tracking-[0.08em] uppercase text-grove-text-muted"
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[11px] text-grove-sage hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-grove-muted border-transparent focus:border-grove-sage focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[4px]"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-grove-dark text-grove-base text-sm font-medium py-3 rounded-[3px] hover:bg-[#3D3D35] transition-colors disabled:opacity-50 mt-2"
              >
                {isLoading ? "Signing in…" : "Sign in →"}
              </button>
            </form>

            <p className="text-xs font-light text-grove-text-muted text-center mt-5">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="text-grove-dark font-medium border-b border-grove-dark/30 pb-px hover:border-grove-dark"
              >
                Join Grove
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
