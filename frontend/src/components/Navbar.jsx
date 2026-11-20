import React from "react";
import { GraduationCap, LayoutDashboard } from "lucide-react";

const NAV_LINKS = [
  ["Courses", "courses"],
  ["Toppers", "toppers"],
  ["Batch Timings", "courses"],
];

export default function Navbar({ onDashboard }) {
  return (
    <header className="sticky top-0 z-40 border-b border-yellow-100 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#top" data-testid="nav-logo" className="flex items-center gap-3 text-stone-900">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-400 text-[#1C1917]">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="font-display block text-base font-bold tracking-tight">Prakash Classes</span>
            <span className="block text-xs text-stone-500">Madhapur • Est. 2012</span>
          </span>
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(([label, id]) => (
            <button
              key={label}
              data-testid={`nav-link-${label.replace(/\s/g, "-").toLowerCase()}`}
              onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
              className="min-h-[44px] rounded-lg px-4 text-sm font-medium text-stone-600 transition-colors hover:text-amber-600"
            >
              {label}
            </button>
          ))}
        </nav>
        <button
          data-testid="nav-owner-dashboard-button"
          onClick={onDashboard}
          className="flex min-h-[44px] items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-800 transition-colors hover:border-amber-400 hover:text-amber-600"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Owner Dashboard</span>
          <span className="sm:hidden">Owner</span>
        </button>
      </div>
    </header>
  );
}
