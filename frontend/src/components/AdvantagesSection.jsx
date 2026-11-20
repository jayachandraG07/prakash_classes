import React, { useEffect, useRef, useState } from "react";
import { Award, BookOpenCheck, Bot, ChevronLeft, ChevronRight, ClipboardCheck, MessageCircle, Users } from "lucide-react";
import { ADVANTAGES } from "../data/constants";
import { Reveal, SectionHeading } from "./Reveal";

const ICON_MAP = {
  "batch-size": Users,
  "mock-tests": ClipboardCheck,
  "daily-dpp": BookOpenCheck,
  experience: Award,
  "guru-ai": Bot,
};

export default function AdvantagesSection({ onAsk }) {
  const trackRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [paused, setPaused] = useState(false);

  const goTo = (idx) => {
    const el = trackRef.current;
    if (!el) return;
    const target = (idx + ADVANTAGES.length) % ADVANTAGES.length;
    el.scrollTo({ left: el.children[target].offsetLeft - el.children[0].offsetLeft, behavior: "smooth" });
  };

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => goTo(activeIdx + 1), 4500);
    return () => clearInterval(timer);
  }, [activeIdx, paused]);

  return (
    <Reveal id="advantage" className="mx-auto max-w-7xl px-4 pt-20 pb-8 sm:px-6 lg:px-8 lg:pt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="The Prakash Advantage" title="Why Madhapur Parents Trust Us" />
        <div className="mb-12 flex gap-3">
          <button
            data-testid="advantage-prev-button"
            aria-label="Previous"
            onClick={() => goTo(activeIdx - 1)}
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-[#1C1917] shadow-sm transition-all duration-200 hover:border-amber-400 hover:text-amber-600 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            data-testid="advantage-next-button"
            aria-label="Next"
            onClick={() => goTo(activeIdx + 1)}
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-[#1C1917] shadow-sm transition-all duration-200 hover:border-amber-400 hover:text-amber-600 active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div
        data-testid="advantage-carousel"
        ref={trackRef}
        onScroll={() => {
          const el = trackRef.current;
          const base = el.children[0].offsetLeft;
          const kids = [...el.children];
          const idx =
            el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
              ? kids.length - 1
              : kids.reduce(
                  (best, k, i) =>
                    Math.abs(k.offsetLeft - base - el.scrollLeft) < Math.abs(kids[best].offsetLeft - base - el.scrollLeft)
                      ? i
                      : best,
                  0
                );
          setActiveIdx(idx);
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 py-4 scroll-px-4 sm:-mx-6 sm:px-6 sm:scroll-px-6 lg:mx-0 lg:px-0 lg:scroll-px-0"
      >
        {ADVANTAGES.map((c, i) => {
          const IconComp = ICON_MAP[c.id];
          const isSel = selected === i;
          return (
            <div
              key={c.title}
              data-testid={`advantage-card-${i}`}
              onClick={() => setSelected(isSel ? null : i)}
              className={`spot-card group relative w-[85%] shrink-0 snap-start cursor-pointer overflow-hidden rounded-2xl border bg-white p-6 text-stone-900 transition-all duration-300 hover:-translate-y-1 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] sm:p-8 ${
                isSel
                  ? "border-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.6),0_20px_50px_-15px_rgba(245,158,11,0.45)]"
                  : "border-stone-200 shadow-[0_20px_40px_-24px_rgba(28,25,23,0.25)] hover:border-amber-400/50 hover:shadow-[0_0_30px_-6px_rgba(245,158,11,0.35)]"
              }`}
            >
              <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-yellow-300/50 blur-3xl opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative grid h-12 w-12 place-items-center rounded-xl border border-yellow-300 bg-yellow-100 text-amber-600">
                <IconComp className="h-6 w-6" />
              </span>
              <h3 className="font-display relative mt-6 text-xl font-bold tracking-tight sm:text-2xl">{c.title}</h3>
              <p className="relative mt-3 min-h-[3rem] text-sm leading-relaxed text-stone-600">{c.text}</p>
              <div
                className={`relative grid transition-all duration-300 ${
                  isSel ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <button
                    data-testid={`advantage-ask-guru-${i}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAsk(c.prompt);
                    }}
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 text-sm font-semibold text-[#1C1917] transition-colors hover:bg-yellow-300 active:scale-[0.98]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Ask Guru About This
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {ADVANTAGES.map((c, i) => (
          <button
            key={c.title}
            data-testid={`advantage-dot-${i}`}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className="grid h-6 min-w-6 place-items-center"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${
                activeIdx === i ? "w-8 bg-yellow-400" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          </button>
        ))}
      </div>
    </Reveal>
  );
}
