// components/layout/Footer.tsx

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #4f52e7 0%, #323382 100%)" }}>
              CF
            </div>
            <span className="font-display font-semibold text-gray-800">
              College<span className="text-brand-600">Finder</span>
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/colleges" className="hover:text-brand-600 transition-colors">Colleges</Link>
            <Link href="/compare" className="hover:text-brand-600 transition-colors">Compare</Link>
            <Link href="/saved" className="hover:text-brand-600 transition-colors">Saved</Link>
          </nav>

          <p className="text-sm text-gray-400">
            Copyright {new Date().getFullYear()} CollegeFinder India
          </p>
        </div>
      </div>
    </footer>
  );
}
