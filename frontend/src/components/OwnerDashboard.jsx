import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  IndianRupee,
  MessageSquareText,
  Mic,
  Moon,
  Search,
  Sunrise,
  Users,
  X,
} from "lucide-react";
import {
  ADDRESS,
  COURSES,
  STATUS_LIST,
  formatCourseShort,
  formatINR,
  formatTime,
  getCourse,
} from "../data/constants";
import { fetchLeads, getExportCsvUrl, updateLeadStatus } from "../services/api";
import { ChatBubble } from "./ChatWidget";

const CARD_CLS =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)]";

const STATUS_STYLES = {
  Pending: "bg-slate-100 text-slate-700 border-slate-200",
  Contacted: "bg-violet-50 text-violet-700 border-violet-200",
  Enrolled: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const TEMP_STYLES = {
  HOT: "bg-red-50 text-red-700 border-red-200",
  WARM: "bg-amber-50 text-amber-700 border-amber-200",
  COLD: "bg-blue-50 text-blue-700 border-blue-200",
};

const FILTER_TABS = [
  ["All", () => true],
  ["Hot", (l) => l.label === "HOT"],
  ["Warm", (l) => l.label === "WARM"],
  ["Cold", (l) => l.label === "COLD"],
  ["After-Hours (8 PM+)", (l) => l.afterHours],
];

export default function OwnerDashboard({ onBack, version, showToast }) {
  const [leads, setLeads] = useState([]);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchLeads().then(setLeads);
  }, [version]);

  const filtered = useMemo(() => {
    const pred = FILTER_TABS.find(([name]) => name === tab)[1];
    const q = query.trim().toLowerCase();
    return leads
      .filter(pred)
      .filter((l) => !q || `${l.name} ${l.phone} ${formatCourseShort(l.courseId)}`.toLowerCase().includes(q));
  }, [leads, tab, query]);

  const handleStatusChange = async (id, status) => {
    const updated = await updateLeadStatus(id, status);
    if (updated) {
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
    }
  };

  const exportCsv = async () => {
    try {
      const res = await fetch(getExportCsvUrl());
      if (res.ok) {
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `prakash-leads-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
        return;
      }
    } catch {
      // Fallback to client-side CSV generation if backend is offline
    }
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["Name", "Phone", "Course", "Annual Fee (INR)", "Preferred Batch", "Enquiry Time", "After 8 PM", "Temperature", "Status", "Summary"],
      ...filtered.map((l) => [
        l.name,
        l.phone,
        formatCourseShort(l.courseId),
        getCourse(l.courseId)?.annual || 0,
        l.timing,
        new Date(l.createdAt).toLocaleString("en-IN"),
        l.afterHours ? "Yes" : "No",
        l.label,
        l.status || "Pending",
        l.summary,
      ]),
    ];
    const csv = "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `prakash-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const now = Date.now();
  const hotWeek = leads.filter((l) => l.label === "HOT" && now - new Date(l.createdAt) < 604800000).length;
  const pipeline = leads.reduce((sum, l) => sum + (getCourse(l.courseId)?.annual || 0), 0);
  const activeLead = leads.find((l) => l.id === selectedId);
  const maxCourseCount = Math.max(1, ...COURSES.map((c) => leads.filter((l) => l.courseId === c.id).length));
  const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="mr-auto flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1C1917] text-amber-400">
              <Sunrise className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-base font-bold tracking-tight text-[#1C1917] sm:text-lg">
                Prakash Classes • Morning Lead Brief
              </p>
              <p className="text-xs text-slate-500">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
          <label className="relative order-last w-full md:order-none md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              data-testid="dashboard-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone or course"
              className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </label>
          <button
            data-testid="dashboard-export-csv-button"
            onClick={exportCsv}
            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-[#1C1917] px-4 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <button
            data-testid="dashboard-back-button"
            onClick={onBack}
            className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-amber-400 hover:text-amber-600"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Website</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { tid: "kpi-total", icon: Users, label: "Total Enquiries", value: leads.length, tone: "bg-slate-100 text-slate-700" },
            { tid: "kpi-hot-week", icon: Flame, label: "Hot Leads This Week", value: hotWeek, tone: "bg-rose-50 text-rose-600" },
            {
              tid: "kpi-after-hours",
              icon: Moon,
              label: "After-Hours Captured (8 PM+)",
              value: leads.filter((l) => l.afterHours).length,
              sub: "+Saved from competitors",
              tone: "bg-emerald-50 text-emerald-600",
            },
            { tid: "kpi-pipeline", icon: IndianRupee, label: "Est. Revenue Pipeline", value: formatINR(pipeline), tone: "bg-amber-50 text-amber-600" },
          ].map((k) => {
            const KIcon = k.icon;
            return (
              <div key={k.tid} data-testid={k.tid} className={`${CARD_CLS} transition-all duration-200 hover:-translate-y-1`}>
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${k.tone}`}>
                  <KIcon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-slate-500">{k.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-[#1C1917] sm:text-3xl">{k.value}</p>
                {k.sub && <p className="mt-1 text-xs font-medium text-emerald-600">{k.sub}</p>}
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div data-testid="analytics-temperature-split" className={CARD_CLS}>
            <p className="font-display text-sm font-bold text-[#1C1917]">Lead Temperature Split</p>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
              {[
                ["HOT", "bg-red-500"],
                ["WARM", "bg-amber-500"],
                ["COLD", "bg-blue-500"],
              ].map(([k, bg]) => (
                <div
                  key={k}
                  className={`${bg} transition-all duration-500`}
                  style={{ width: `${pct(leads.filter((l) => l.label === k).length, leads.length)}%` }}
                />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ["HOT", "Hot", "bg-red-500"],
                ["WARM", "Warm", "bg-amber-500"],
                ["COLD", "Cold", "bg-blue-500"],
              ].map(([k, lbl, bg]) => {
                const cnt = leads.filter((l) => l.label === k).length;
                return (
                  <div key={k}>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className={`h-2 w-2 rounded-full ${bg}`} />
                      {lbl}
                    </p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-[#1C1917]">
                      {cnt} <span className="text-xs font-medium text-slate-400">{pct(cnt, leads.length)}%</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div data-testid="analytics-course-demand" className={CARD_CLS}>
            <p className="font-display text-sm font-bold text-[#1C1917]">Course Demand Breakdown</p>
            <div className="mt-4 space-y-3">
              {COURSES.map((c) => {
                const cnt = leads.filter((l) => l.courseId === c.id).length;
                return (
                  <div key={c.id} className="grid grid-cols-[120px_1fr_24px] items-center gap-3 text-xs sm:grid-cols-[150px_1fr_24px]">
                    <span className="truncate font-medium text-slate-600">{c.short}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <span
                        className="block h-full rounded-full bg-[#1C1917] transition-all duration-500"
                        style={{ width: `${(cnt / maxCourseCount) * 100}%` }}
                      />
                    </span>
                    <span className="text-right font-bold tabular-nums text-[#1C1917]">{cnt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#1C1917]">
            Leads <span className="text-base font-medium tabular-nums text-slate-400">({filtered.length})</span>
            <span className="mt-2 block h-1 w-12 rounded-full bg-amber-500" />
          </h2>
          <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
            {FILTER_TABS.map(([name]) => (
              <button
                key={name}
                data-testid={`filter-tab-${name.split(" ")[0].toLowerCase()}`}
                onClick={() => setTab(name)}
                className={`min-h-[40px] shrink-0 rounded-lg px-4 text-sm font-semibold transition-colors ${
                  tab === name ? "bg-[#1C1917] text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {filtered.length ? (
          <>
            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_-12px_rgba(15,23,42,0.12)] md:block">
              <table data-testid="leads-table" className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    {["Student / Parent", "Course & Value", "Batch & Enquiry", "Temp", "Follow-up", ""].map((h) => (
                      <th key={h} className="px-5 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => {
                    const c = getCourse(l.courseId);
                    const st = l.status || "Pending";
                    return (
                      <tr
                        key={l.id}
                        data-testid={`lead-row-${l.id}`}
                        onClick={() => setSelectedId(l.id)}
                        className="cursor-pointer border-t border-slate-100 transition-colors hover:bg-amber-50/40"
                      >
                        <td className="px-5 py-4">
                          <p className="flex flex-wrap items-center gap-2 font-semibold text-[#1C1917]">
                            {l.name}
                            {l.voice && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                                <Mic className="h-3 w-3" />
                                Voice
                              </span>
                            )}
                          </p>
                          <p className="text-xs tabular-nums text-slate-500">{l.phone}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700">{c ? c.short : "Not selected"}</p>
                          <p className="text-xs tabular-nums text-slate-500">{c ? `${formatINR(c.annual)}/yr` : "—"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700">{l.timing}</p>
                          <p className="flex flex-wrap items-center gap-1.5 text-xs tabular-nums text-slate-500">
                            {new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })},{" "}
                            {formatTime(l.createdAt)}
                            {l.afterHours && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                                <Moon className="h-3 w-3" />
                                After 8 PM
                              </span>
                            )}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${TEMP_STYLES[l.label]}`}>
                            {l.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            data-testid={`lead-status-${l.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(l.id, STATUS_LIST[(STATUS_LIST.indexOf(st) + 1) % STATUS_LIST.length]);
                            }}
                            className={`inline-flex min-h-[32px] items-center rounded-full border px-3 text-xs font-semibold transition-all hover:brightness-95 active:scale-95 ${STATUS_STYLES[st]}`}
                          >
                            {st}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(l.id);
                            }}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-amber-400 hover:text-amber-600"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-3 md:hidden">
              {filtered.map((l) => {
                const c = getCourse(l.courseId);
                const st = l.status || "Pending";
                return (
                  <div
                    key={l.id}
                    onClick={() => setSelectedId(l.id)}
                    className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[#1C1917]">{l.name}</p>
                        <p className="text-xs tabular-nums text-slate-500">{l.phone}</p>
                      </div>
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${TEMP_STYLES[l.label]}`}>
                        {l.label}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-medium text-slate-700">{c ? c.short : "Not selected"}</p>
                        <p className="text-xs text-slate-500">{c ? `${formatINR(c.annual)}/yr` : "—"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">{l.timing}</p>
                        <p className="text-xs text-slate-500">{formatTime(l.createdAt)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(l.id, STATUS_LIST[(STATUS_LIST.indexOf(st) + 1) % STATUS_LIST.length]);
                        }}
                        className={`inline-flex min-h-[32px] items-center rounded-full border px-3 text-xs font-semibold ${STATUS_STYLES[st]}`}
                      >
                        {st}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(l.id);
                        }}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p data-testid="leads-empty" className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            No leads match this view.
          </p>
        )}
      </main>

      {activeLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70" onClick={() => setSelectedId(null)}>
          <div
            data-testid="lead-drawer"
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full overflow-y-auto bg-[#F8FAFC] p-6 shadow-2xl sm:max-w-lg"
          >
            <button
              onClick={() => setSelectedId(null)}
              aria-label="Close"
              className="float-right rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 pr-8">
                <h3 className="font-display text-xl font-bold text-[#1C1917]">{activeLead.name}</h3>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${TEMP_STYLES[activeLead.label]}`}>
                  {activeLead.label}
                </span>
              </div>
              <p className="text-sm tabular-nums text-slate-500">
                {activeLead.phone} • {formatCourseShort(activeLead.courseId)} • {activeLead.timing}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-bold tabular-nums text-amber-700">
                  <IndianRupee className="h-4 w-4" />
                  {getCourse(activeLead.courseId)
                    ? `${formatINR(getCourse(activeLead.courseId).annual).slice(1)} / year`
                    : "No course"}
                </span>
                <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
                  {STATUS_LIST.map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(activeLead.id, st)}
                      className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold transition-colors ${
                        (activeLead.status || "Pending") === st ? "bg-[#1C1917] text-white" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
                  <FileText className="h-4 w-4" />
                  AI Summary
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-800">{activeLead.summary}</p>
              </div>

              {(() => {
                const waText = `Namaste ${activeLead.name.replace(/\s*\(.*\)\s*/, "").trim()} ji! Greetings from Prakash Classes, Madhapur. Thank you for speaking with Guru regarding our ${
                  getCourse(activeLead.courseId)?.title || "courses"
                } (${
                  activeLead.timing === "Flexible" ? "flexible timing" : `${activeLead.timing} batch`
                }). We have noted your interest and would be happy to reserve a FREE demo class for you — our academic team will call you shortly. Address: ${ADDRESS}.`;
                const validPhone = /^[6-9]\d{9}$/.test(activeLead.phone);
                return (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                      <MessageSquareText className="h-4 w-4" />
                      WhatsApp Follow-Up
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-900">{waText}</p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(waText).catch(() => {});
                          showToast("Copied to clipboard!", "success");
                        }}
                        className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-[0.98]"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Message
                      </button>
                      <a
                        href={validPhone ? `https://wa.me/91${activeLead.phone}?text=${encodeURIComponent(waText)}` : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => !validPhone && e.preventDefault()}
                        className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] ${
                          validPhone ? "bg-emerald-600 hover:bg-emerald-700" : "cursor-not-allowed bg-emerald-300"
                        }`}
                      >
                        <ExternalLink className="h-4 w-4" />
                        {validPhone ? "Open in WhatsApp" : "No phone shared"}
                      </a>
                    </div>
                  </div>
                );
              })()}

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Full Transcript</p>
                <div className="space-y-3">
                  {activeLead.transcript.map((m, i) => (
                    <ChatBubble key={i} m={m} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
