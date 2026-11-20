import React from "react";
import { Trophy } from "lucide-react";
import { TOPPERS } from "../data/constants";
import { Reveal, SectionHeading } from "./Reveal";

export default function ToppersSection() {
  return (
    <Reveal id="toppers" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading eyebrow="Hall of Fame" title="Our 2025 Toppers" />
      <div className="grid gap-6 md:grid-cols-3">
        {TOPPERS.map((t, i) => (
          <Reveal
            key={t.name}
            as="div"
            delay={120 * i}
            data-testid={`topper-card-${i}`}
            className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-1"
          >
            <span className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-sm font-bold text-[#1C1917] shadow-md">
              #{i + 1}
            </span>
            <Trophy className="h-6 w-6 text-amber-500" />
            <p className="font-display mt-4 text-3xl font-extrabold tracking-tight text-[#1C1917]">{t.score}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {t.exam} <span className="font-normal text-slate-500">({t.note})</span>
            </p>
            <p className="mt-4 border-t border-slate-100 pt-4 text-sm font-medium text-slate-600">{t.name}</p>
          </Reveal>
        ))}
      </div>
    </Reveal>
  );
}
