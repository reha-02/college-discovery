// components/layout/Navbar.tsx
// Top navigation bar with logo, nav links, auth state, compare badge

"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useCompareStore } from "@/lib/compare-store";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Navbar() {
  const { data: session } = useSession();
  const { selectedIds, clearAll } = useCompareStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/colleges", label: "Colleges" },
    { href: "/compare", label: "Compare" },
    { href: "/saved", label: "Saved" },
  ];

  function handleSignOut() {
    clearAll();
    signOut({ callbackUrl: "/" });
  }

  const compareCount = session ? selectedIds.length : 0;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: "linear-gradient(135deg, #6470f3 0%, #4240cc 100%)" }}>
              CF
            </div>
            <span className="font-display font-semibold text-gray-900 text-lg tracking-tight">
              College<span className="text-brand-600">Finder</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-brand-700 hover:bg-brand-50 transition-all duration-150"
              >
                {link.label}
                {link.href === "/compare" && compareCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {compareCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Auth controls */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <div className="flex items-center gap-3">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "User"}
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-brand-100"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {session.user.name?.split(" ")[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link href="/auth/signin" className="btn-primary">
                Sign in / Sign up
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-brand-50 hover:text-brand-700"
              >
                {link.label}
                {link.href === "/compare" && compareCount > 0 && (
                  <span className="badge bg-brand-600 text-white">{compareCount}</span>
                )}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>
              {session ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-500 font-medium"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="w-full btn-primary justify-center"
                >
                  Sign in / Sign up
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
