import React from "react";
import { BookOpen, MessageCircle, Phone, Sparkles } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL, TRUST_ITEMS } from "../data/constants";

const MATH_ITEMS = [
  ["π", "8%", "12%", "text-5xl", "text-amber-500", 0.16, 14, 0],
  ["∑", "80%", "18%", "text-6xl", "text-yellow-600", 0.1, 18, 2],
  ["√", "22%", "70%", "text-5xl", "text-stone-400", 0.14, 16, 1],
  ["∫", "62%", "80%", "text-7xl", "text-amber-500", 0.12, 20, 3],
  ["∞", "45%", "8%", "text-4xl", "text-yellow-600", 0.12, 13, 4],
  ["Δ", "90%", "60%", "text-5xl", "text-stone-400", 0.15, 17, 1.5],
  ["θ", "35%", "45%", "text-4xl", "text-amber-500", 0.1, 22, 5],
  ["x²", "70%", "40%", "text-3xl", "text-yellow-600", 0.14, 15, 2.5],
  ["sin θ", "52%", "25%", "text-2xl", "text-amber-500", 0.13, 16, 3.5],
  ["%", "95%", "35%", "text-4xl", "text-yellow-600", 0.11, 14, 5.5],
];

function HeroMathBg() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      <div className="hero-grid absolute inset-0" />
      {MATH_ITEMS.map(([sym, left, top, size, color, op, dur, delay], idx) => (
        <span
          key={sym}
          className={`math-float font-display absolute font-bold ${size} ${color} ${idx % 2 ? "hidden sm:block" : ""}`}
          style={{ left, top, opacity: op, "--dur": `${dur}s`, "--delay": `${-delay}s` }}
        >
          {sym}
        </span>
      ))}
    </div>
  );
}

export default function Hero({ onChat }) {
  return (
    <section
      id="top"
      className="relative -mt-[65px] overflow-hidden bg-gradient-to-b from-[#FFFBEB] via-[#FFFDF5] to-white pt-[65px] text-stone-900"
    >
      <HeroMathBg />
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <div className="fade-up">
          <span
            data-testid="hero-live-badge"
            className="shimmer-border inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Office Closed After 8 PM • Guru AI Counselor Live 24/7
          </span>
          <h1 className="font-display mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Clear concepts.
            <br />
            <span className="text-amber-500">Confident results.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-stone-600 sm:text-lg">
            Small batches of max 25 students for Class 8–12, NEET &amp; IIT-JEE Foundation with personal doubt-solving
            in Madhapur, Hyderabad.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              data-testid="hero-chat-button"
              onClick={onChat}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 font-semibold text-[#1C1917] shadow-[0_10px_30px_-10px_rgba(234,179,8,0.8)] transition-all duration-200 hover:-translate-y-1 hover:bg-yellow-300"
            >
              <MessageCircle className="h-5 w-5" />
              Chat with Guru (24/7 AI)
            </button>
            <a
              data-testid="hero-call-button"
              href={`tel:${PHONE_TEL}`}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-6 font-semibold text-stone-800 transition-all duration-200 hover:-translate-y-1 hover:border-amber-400 hover:text-amber-600"
            >
              <Phone className="h-5 w-5" />
              Call {PHONE_DISPLAY}
            </a>
          </div>
          <div
            data-testid="hero-trust-strip"
            className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-yellow-200 bg-yellow-200 shadow-sm sm:grid-cols-4"
          >
            {TRUST_ITEMS.map((item) => (
              <div key={item} className="bg-white px-4 py-4 text-xs font-medium text-stone-600 sm:text-sm">
                <span className="font-display block text-lg font-bold text-stone-900">{item.split(" ")[0]}</span>
                {item.split(" ").slice(1).join(" ")}
              </div>
            ))}
          </div>
        </div>
        <div className="fade-up relative mt-6 lg:mt-0" style={{ animationDelay: "0.15s" }}>
          <div className="relative rounded-[28px] border border-yellow-200 bg-white p-3 shadow-[0_40px_80px_-30px_rgba(180,83,9,0.35)]">
            <div className="flex aspect-[4/3] w-full flex-col justify-between rounded-[20px] bg-gradient-to-br from-[#1C1917] via-stone-900 to-amber-950 p-8 text-white">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-semibold text-yellow-300">
                  <BookOpen className="h-4 w-4" />
                  Madhapur Classroom
                </span>
                <span className="text-xs text-stone-400">Max 25 / Batch</span>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-yellow-400 sm:text-3xl">
                  1-on-1 Doubt Clearing
                </p>
                <p className="mt-2 text-sm text-stone-300">
                  Daily DPP sheets, NCERT mastery, and weekly OMR &amp; CBT mock tests with parent reports.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-xs">
                <div>
                  <span className="block font-bold text-white">Class 8–10</span>
                  <span className="text-stone-400">₹1,500/mo</span>
                </div>
                <div>
                  <span className="block font-bold text-white">Class 11–12</span>
                  <span className="text-stone-400">₹2,500/mo</span>
                </div>
                <div>
                  <span className="block font-bold text-white">NEET / IIT</span>
                  <span className="text-stone-400">₹3,000+/mo</span>
                </div>
              </div>
            </div>
          </div>
          <div
            data-testid="hero-admissions-card"
            className="absolute -top-6 left-4 right-4 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/75 p-4 text-stone-900 shadow-xl backdrop-blur-md sm:right-auto sm:left-[-12px] sm:max-w-xs"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-yellow-400 text-[#1C1917]">
              <Sparkles className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold leading-snug">
              2026 Admissions Open
              <span className="block font-normal text-amber-700">Evening 8 PM Batch Filling Fast</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
