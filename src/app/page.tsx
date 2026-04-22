"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setIsSuccess(false);
        setMessage(data.message ?? "Sign in failed.");
        return;
      }

      setIsSuccess(true);
      setMessage(data.message ?? "Signed in successfully.");
      setPassword("");
    } catch {
      setIsSuccess(false);
      setMessage("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,#e0f2fe,transparent_40%),radial-gradient(circle_at_bottom_right,#dbeafe,transparent_45%)]" />

        <section className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/90 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.14)] backdrop-blur sm:p-10">
          <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-cyan-700 uppercase">
            Welcome Back
          </p>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
            Sign in to your account
          </h1>
          <p className="mb-8 text-sm text-slate-600">
            Use your email and password to continue.
          </p>

          <form className="space-y-5" method="post" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-800"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-800"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-cyan-700 hover:text-cyan-800"
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 focus:outline-none"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>

            <span
              className="sr-only"
              data-testid="client-ready"
              data-ready={isHydrated ? "true" : "false"}
            />

            {message ? (
              <p
                aria-live="polite"
                className={`text-sm ${isSuccess ? "text-emerald-700" : "text-rose-700"}`}
              >
                {message}
              </p>
            ) : null}
          </form>
        </section>
      </main>
    </>
  );
}
