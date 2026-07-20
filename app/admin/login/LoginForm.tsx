"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput } from "@/components/admin/ui";

const inputCls =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-fg outline-none transition-all duration-200 focus:border-neon/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-neon/20";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-line glass p-8">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-fg">Netlink Admin</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage site content</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-medium text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-medium text-muted">
            Password
          </label>
          <PasswordInput
            id="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            className="py-3"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-neon to-neon-soft px-6 py-3 text-sm font-semibold text-ink shadow-[0_10px_40px_-10px_rgba(13,253,209,0.55)] transition-shadow hover:shadow-[0_14px_50px_-8px_rgba(13,253,209,0.75)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
