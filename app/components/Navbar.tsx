"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : session?.user?.email
    ? session.user.email.charAt(0).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-white transition hover:text-zinc-200"
          >
            GitHub Repository Explainer
          </Link>
          <span className="hidden rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 sm:inline-block">
            AI Developer Tool
          </span>
        </div>

        {/* Auth controls */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-800" />
            </div>
          ) : session ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/30 text-xs font-bold text-blue-400 ring-1 ring-blue-500/50">
                  {userInitial}
                </div>
                <div className="hidden flex-col text-left text-xs sm:flex">
                  <span className="font-medium text-white truncate max-w-[140px]">
                    {session.user?.name || "Developer"}
                  </span>
                  <span className="text-zinc-400 truncate max-w-[140px]">
                    {session.user?.email}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                disabled={loggingOut}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
              >
                {loggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-zinc-300 transition hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
