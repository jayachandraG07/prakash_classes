import React from "react";
import { Briefcase, GraduationCap } from "lucide-react";
import { ALUMNI } from "../data/constants";

function AlumniCard({ a, dup }) {
  return (
    <div
      aria-hidden={dup}
      className="flex w-[300px] shrink-0 items-center gap-4 rounded-2xl border border-yellow-200 bg-white p-4 shadow-[0_12px_30px_-18px_rgba(180,83,9,0.35)] transition-all duration-200 hover:-translate-y-1 hover:border-amber-400 sm:w-[340px]"
    >
      <span className="font-display grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-lg font-bold text-stone-900">
        {a.name
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")}
      </span>
      <div className="min-w-0">
        <p className="font-display truncate font-bold text-stone-900">{a.name}</p>
        <p className="mt-0.5 flex items-start gap-1.5 text-sm leading-snug text-stone-600">
          {a.role ? (
            <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          ) : (
            <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          )}
          <span className="line-clamp-2">{a.place}</span>
        </p>
        <p className="mt-1.5 inline-flex rounded-full bg-yellow-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
          {a.feat} • Batch {a.year}
        </p>
      </div>
    </div>
  );
}

export default function AlumniMarquee() {
  return (
    <section data-testid="alumni-marquee" id="alumni" className="py-16 lg:py-20">
      <div className="mx-auto mb-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Alumni Achievements</p>
        <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Where our students are today
        </h2>
        <span className="mt-4 block h-1 w-16 rounded-full bg-yellow-400" />
      </div>
      <div className="marquee-mask relative overflow-hidden">
        <div className="marquee-track flex w-max gap-5 py-3">
          {[...ALUMNI, ...ALUMNI].map((a, idx) => (
            <AlumniCard key={idx} a={a} dup={idx >= ALUMNI.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
