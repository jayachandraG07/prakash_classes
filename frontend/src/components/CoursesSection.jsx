import React from "react";
import { Check, Clock, Flame, MessageCircle } from "lucide-react";
import { COURSES, TIMINGS, formatINR } from "../data/constants";
import { Reveal, SectionHeading } from "./Reveal";

const COURSE_FEATURES = ["NCERT + Exemplar", "Daily DPP Sheets", "Weekly Parent Report"];
const COURSE_SPANS = { neet: "lg:col-span-2", foundation: "", pcm: "", iit: "lg:col-span-2" };

export default function CoursesSection({ onAsk }) {
  return (
    <Reveal id="courses" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading eyebrow="Courses & Batch Timings" title="Find the right batch for your child" />
      <div className="grid gap-6 lg:grid-cols-3">
        {COURSES.map((c) => (
          <div
            key={c.id}
            data-testid={`course-card-${c.id}`}
            className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 sm:p-8 ${COURSE_SPANS[c.id]} ${
              c.popular
                ? "shimmer-border border-yellow-300 bg-gradient-to-br from-yellow-50 via-white to-amber-50 text-stone-900 shadow-[0_24px_48px_-16px_rgba(234,179,8,0.45)]"
                : "border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)]"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  c.popular ? "bg-yellow-200 text-amber-900" : "bg-slate-100 text-slate-600"
                }`}
              >
                {c.tag}
              </span>
              {c.popular && (
                <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-[#1C1917]">
                  MOST POPULAR
                </span>
              )}
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                <Flame className="h-3 w-3" />
                Few Seats Left
              </span>
            </div>
            <h3 className="font-display mt-5 text-2xl font-bold tracking-tight">{c.title}</h3>
            <p className="mt-1 text-sm text-stone-500">{c.subjects}</p>
            <ul className="mt-5 space-y-2">
              {COURSE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {TIMINGS.map((t) => (
                <span
                  key={t}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium ${
                    c.popular ? "border-yellow-300 bg-white text-stone-700" : "border-slate-200 text-slate-600"
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-4 pt-8">
              <p data-testid={`course-fee-${c.id}`}>
                <span className="font-display text-3xl font-extrabold">{formatINR(c.monthly)}</span>
                <span className="text-sm text-stone-500">/month</span>
                <span className="block text-xs text-stone-500">{formatINR(c.annual)}/year</span>
              </p>
              <button
                data-testid={`course-ask-guru-${c.id}`}
                onClick={() => onAsk(c.id)}
                className={`flex min-h-[48px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                  c.popular
                    ? "bg-yellow-400 text-[#1C1917] hover:bg-yellow-300"
                    : "bg-[#1C1917] text-white hover:bg-slate-800"
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                Ask Guru About This Batch
              </button>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
