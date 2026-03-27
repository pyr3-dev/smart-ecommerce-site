"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { GroveLogo } from "@/components/grove-logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "buyer" | "seller";

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [role, setRole] = useState<Role>("buyer");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const passwordStrength = getPasswordStrength(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
          data: { role },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
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
              &ldquo;I opened my Grove shop in{" "}
              <span className="not-italic font-medium text-grove-sage">
                20 minutes.
              </span>{" "}
              First sale came three days later.&rdquo;
            </p>
            <div className="flex gap-1.5 mt-5">
              <span className="w-[5px] h-[5px] rounded-full bg-grove-sage" />
              <span className="w-[5px] h-[5px] rounded-full bg-white/20" />
              <span className="w-[5px] h-[5px] rounded-full bg-white/20" />
            </div>
            <p className="text-[10px] text-grove-text-muted font-light mt-2">
              — Theo, leather goods
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="aspect-square rounded-[4px] bg-gradient-to-br from-[#7C9A78] to-[#5C7A58]" />
            <div className="aspect-square rounded-[4px] bg-gradient-to-br from-[#D4C5A9] to-[#C4B49A]" />
            <div className="aspect-square rounded-[4px] bg-gradient-to-br from-[#B8A898] to-[#A09080]" />
            <div className="aspect-square rounded-[4px] bg-grove-dark-hover" />
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-grove-sage mb-3">
              Get started free
            </p>
            <h1 className="text-2xl font-medium tracking-[-0.02em] text-grove-dark mb-1.5">
              Create your account
            </h1>
            <p className="text-[13px] font-light text-grove-text-muted leading-relaxed mb-5">
              Joining as a…
            </p>

            {/* Role toggle */}
            <div className="grid grid-cols-2 gap-1.5 mb-6">
              {(["buyer", "seller"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={role === r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "py-2.5 rounded-[3px] text-xs capitalize transition-colors",
                    role === r
                      ? "bg-grove-base border border-grove-dark text-grove-dark font-medium"
                      : "bg-grove-muted border border-transparent text-grove-text-muted hover:text-grove-dark font-normal"
                  )}
                >
                  {r === "buyer" ? "Buyer" : "Seller"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
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
                <label
                  htmlFor="password"
                  className="block text-[11px] font-medium tracking-[0.08em] uppercase text-grove-text-muted mb-1.5"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  className="bg-grove-muted border-transparent focus:border-grove-sage focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[4px]"
                />
                {password.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-[3px] flex-1 rounded-full transition-colors",
                          i <= passwordStrength
                            ? "bg-grove-sage"
                            : "bg-grove-muted"
                        )}
                      />
                    ))}
                  </div>
                )}
                <span className="sr-only" role="status" aria-live="polite">
                  {password.length > 0 && `Password strength: ${passwordStrength} of 4`}
                </span>
              </div>
              <div>
                <label
                  htmlFor="repeat-password"
                  className="block text-[11px] font-medium tracking-[0.08em] uppercase text-grove-text-muted mb-1.5"
                >
                  Confirm password
                </label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => { setRepeatPassword(e.target.value); setError(null); }}
                  className="bg-grove-muted border-transparent focus:border-grove-sage focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[4px]"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-grove-dark text-grove-base text-sm font-medium py-3 rounded-[3px] hover:bg-grove-dark-hover transition-colors disabled:opacity-50 mt-2"
              >
                {isLoading ? "Creating account…" : "Create account →"}
              </button>
            </form>

            <p className="text-xs font-light text-grove-text-muted text-center mt-5">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-grove-dark font-medium border-b border-grove-dark/30 pb-px hover:border-grove-dark"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
