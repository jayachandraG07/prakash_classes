import React, { useEffect, useRef, useState } from "react";
import { Bot, CircleCheck, MessageCircle, Mic, MicOff, Save, Send, Volume2, VolumeX, X } from "lucide-react";
import { COURSES, TIMINGS, formatTime, formatTimeObj, formatTiming, getCourse } from "../data/constants";
import { createLead, sendGuruTurn } from "../services/api";
import {
  DEFAULT_CHIPS,
  SpeechRec,
  TELUGU_PROMPTS,
  initConv,
  speakText,
  stopSpeech,
  welcomeMsg,
} from "../utils/guruEngine";

const mkMsg = (from, text, voice) => ({
  from,
  text,
  time: new Date().toISOString(),
  ...(voice ? { voice: true } : {}),
});

export function ChatBubble({ m }) {
  const isUser = m.from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser ? "rounded-br-md bg-[#1C1917] text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
        }`}
      >
        <p className="whitespace-pre-line">{m.text}</p>
        <p className="mt-1 text-[10px] text-slate-400">
          {m.voice && <Mic className="mr-1 inline h-2.5 w-2.5" aria-label="Spoken" />}
          {formatTime(m.time)}
        </p>
      </div>
    </div>
  );
}

export default function ChatWidget({ open, setOpen, request, onSaved, showToast }) {
  const [telugu, setTelugu] = useState(false);
  const [messages, setMessages] = useState(() => [mkMsg("guru", welcomeMsg(false))]);
  const [conv, setConv] = useState(initConv);
  const [typing, setTyping] = useState(false);
  const [thanks, setThanks] = useState("");
  const [input, setInput] = useState("");
  const [voiceOn, setVoiceOn] = useState(true);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");

  const endRef = useRef(null);
  const recRef = useRef(null);
  const spokenCount = useRef(messages.length);
  const stateRef = useRef({ messages, conv, telugu });
  stateRef.current = { messages, conv, telugu };

  const endAndSave = async (cState = stateRef.current.conv, mList = stateRef.current.messages) => {
    if (mList.some((m) => m.from === "user")) {
      const now = new Date();
      const afterHours = now.getHours() >= 20;
      const course = getCourse(cState.courseId);
      const label =
        cState.phone && cState.courseId && cState.timing
          ? "HOT"
          : cState.courseId || cState.askedFee
            ? "WARM"
            : "COLD";
      const parts = [
        `${cState.name || "A visitor"} enquired ${
          afterHours ? `after office closing at ${formatTimeObj(now)}` : `at ${formatTimeObj(now)}`
        } for ${course ? course.short : "general information"}.`,
        `${cState.timing ? `Selected ${cState.timing} batch` : "No batch timing selected"}${
          cState.phone ? " and shared phone for callback." : " and did not share a contact number."
        }`,
      ];
      if (cState.demo) parts.push("Requested a free demo class.");
      else if (cState.askedFee) parts.push("Checked fee details.");

      const lead = {
        id: `lead-${now.getTime()}`,
        name: cState.name || "Anonymous Visitor",
        phone: cState.phone || "Not shared",
        courseId: cState.courseId,
        timing: cState.timing ? formatTiming(cState.timing) : "Flexible",
        createdAt: now.toISOString(),
        afterHours,
        label,
        status: "Pending",
        voice: mList.some((m) => m.voice),
        summary: parts.join(" "),
        transcript: mList,
      };
      await createLead(lead);
      onSaved?.();
      setThanks(cState.name || "there");
    }
    setMessages([mkMsg("guru", welcomeMsg(stateRef.current.telugu))]);
    setConv(initConv());
    setTyping(false);
  };

  const send = async (raw, voice = false) => {
    if (!raw.trim() || typing) return;
    const nextMsgs = [...stateRef.current.messages, mkMsg("user", raw.trim(), voice)];
    setMessages(nextMsgs);
    setTyping(true);
    const res = await sendGuruTurn(stateRef.current.conv, raw);
    setTimeout(() => {
      const out = [...res.replies];
      if (stateRef.current.telugu) out[out.length - 1] += `\n${TELUGU_PROMPTS[res.state.step]}`;
      const finalMsgs = [...nextMsgs, ...out.map((t) => mkMsg("guru", t))];
      setMessages(finalMsgs);
      setConv(res.state);
      setTyping(false);
      if (res.complete) setTimeout(() => endAndSave(res.state, finalMsgs), 2200);
    }, 500);
  };

  const toggleTelugu = () => {
    const next = !stateRef.current.telugu;
    setTelugu(next);
    const cur = stateRef.current.messages;
    if (cur.length === 1) setMessages([mkMsg("guru", welcomeMsg(next))]);
    else if (next) setMessages([...cur, mkMsg("guru", TELUGU_PROMPTS.on)]);
  };

  const startMic = () => {
    if (!SpeechRec) return;
    stopSpeech();
    const r = new SpeechRec();
    r.lang = telugu ? "te-IN" : "en-IN";
    r.interimResults = true;
    r.onresult = (ev) => {
      const list = [...ev.results];
      const txt = list.map((x) => x[0].transcript).join(" ");
      setInterim(txt);
      if (list.some((x) => x.isFinal)) send(txt, true);
    };
    r.onerror = (ev) => {
      if (ev.error === "not-allowed") showToast("Please allow microphone access to talk to Guru.");
      else if (ev.error === "no-speech") showToast("Didn't catch that — tap the mic and try again.");
    };
    r.onend = () => {
      setListening(false);
      setInterim("");
    };
    recRef.current = r;
    r.start();
    setListening(true);
  };

  const stopMic = () => recRef.current?.stop();

  useEffect(() => {
    const fresh = messages.slice(Math.min(spokenCount.current, messages.length)).filter((m) => m.from === "guru");
    spokenCount.current = messages.length;
    if (voiceOn && messages.some((m) => m.from === "user")) fresh.forEach((m) => speakText(m.text));
  }, [messages, voiceOn]);

  useEffect(() => {
    if (request) send(request.text || `I'd like to know about the ${getCourse(request.courseId).title} batch.`);
  }, [request]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  const chips =
    conv.step === "course"
      ? COURSES.map((c) => c.short)
      : conv.step === "timing"
        ? TIMINGS
        : conv.step === "phone"
          ? []
          : DEFAULT_CHIPS;

  return (
    <>
      {!open && (
        <button
          data-testid="chat-fab-button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex min-h-[56px] items-center gap-2 rounded-full bg-yellow-400 px-5 font-semibold text-[#1C1917] shadow-[0_10px_30px_-8px_rgba(234,179,8,0.7)] transition-all duration-200 hover:-translate-y-1 hover:bg-yellow-300"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Chat with Guru</span>
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
          </span>
        </button>
      )}
      {open && (
        <div
          data-testid="chat-panel"
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[640px] sm:max-h-[calc(100vh-48px)] sm:w-[400px] sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-[0_24px_60px_-12px_rgba(11,21,40,0.35)]"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-400 px-4 py-3 text-stone-900">
            <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/30 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-stone-900 text-yellow-400">
                <Bot className="h-5 w-5" />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-yellow-400 bg-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display truncate text-sm font-bold leading-tight">
                  Guru • Prakash Classes AI Counselor
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Online 24/7
                </p>
              </div>
              <div
                data-testid="chat-lang-switch"
                role="group"
                aria-label="Chat language"
                className="relative grid shrink-0 grid-cols-2 rounded-full border border-white/60 bg-white/30 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_14px_-6px_rgba(120,53,15,0.35)] backdrop-blur-md"
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full border border-white/80 bg-white/80 shadow-[0_2px_8px_-2px_rgba(120,53,15,0.35)] backdrop-blur-sm transition-transform duration-300 ease-out ${
                    telugu ? "translate-x-full" : "translate-x-0"
                  }`}
                />
                <button
                  data-testid="chat-lang-en"
                  aria-pressed={!telugu}
                  onClick={() => telugu && toggleTelugu()}
                  className={`relative z-10 min-h-[32px] px-3 text-xs font-bold transition-colors ${
                    telugu ? "text-stone-700" : "text-stone-900"
                  }`}
                >
                  EN
                </button>
                <button
                  data-testid="chat-telugu-toggle"
                  aria-pressed={telugu}
                  onClick={() => !telugu && toggleTelugu()}
                  className={`relative z-10 min-h-[32px] px-3 text-xs font-bold transition-colors ${
                    telugu ? "text-stone-900" : "text-stone-700"
                  }`}
                >
                  తెలుగు
                </button>
              </div>
              <button
                data-testid="chat-close-button"
                aria-label="Close chat"
                onClick={() => {
                  stopSpeech();
                  stopMic();
                  setOpen(false);
                }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {thanks && (
            <div
              data-testid="chat-thanks-banner"
              className="flex items-start gap-2 border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1">
                Thank you, {thanks}! Your enquiry is saved and our team will reach out shortly. A fresh chat is ready
                below.
              </p>
              <button data-testid="chat-thanks-dismiss" onClick={() => setThanks("")} aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div data-testid="chat-messages" className="flex-1 space-y-3 overflow-y-auto bg-[#F8FAFC] px-4 py-4">
            {messages.map((m, idx) => (
              <ChatBubble key={idx} m={m} />
            ))}
            {typing && (
              <div
                data-testid="chat-typing-indicator"
                className="flex w-fit gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3"
              >
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="typing-dot h-2 w-2 rounded-full bg-slate-400"
                    style={{ animationDelay: `${0.15 * d}s` }}
                  />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-slate-200 bg-white px-3 pt-3">
            {chips.map((c) => (
              <button
                key={c}
                data-testid={`chat-chip-${c.replace(/\W+/g, "-").toLowerCase()}`}
                onClick={() => send(c)}
                className="min-h-[36px] shrink-0 rounded-full border border-amber-300 bg-amber-50 px-3 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100"
              >
                {c}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
              setInput("");
            }}
            className="flex gap-2 bg-white p-3"
          >
            {!!SpeechRec && (
              <button
                type="button"
                data-testid="chat-mic-button"
                aria-label={listening ? "Stop listening" : "Speak to Guru"}
                onClick={listening ? stopMic : startMic}
                className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-all active:scale-95 ${
                  listening
                    ? "border-red-300 bg-red-50 text-red-600"
                    : "border-yellow-300 bg-yellow-50 text-amber-700 hover:bg-yellow-100"
                }`}
              >
                {listening && <span className="absolute inset-0 rounded-xl bg-red-400/30 motion-safe:animate-ping" />}
                {listening ? <MicOff className="relative h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            )}
            <input
              data-testid="chat-input"
              value={listening ? interim : input}
              readOnly={listening}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                listening
                  ? telugu
                    ? "వింటున్నాను... Listening"
                    : "Listening... speak now"
                  : "Type or tap the mic..."
              }
              className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
            <button
              data-testid="chat-send-button"
              aria-label="Send"
              className="grid h-11 w-11 place-items-center rounded-xl bg-[#1C1917] text-white transition-colors hover:bg-slate-800"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-3 py-1.5">
            <button
              data-testid="chat-voice-toggle"
              aria-pressed={voiceOn}
              onClick={() => {
                if (voiceOn) stopSpeech();
                setVoiceOn(!voiceOn);
              }}
              className="flex min-h-[32px] items-center gap-1.5 rounded-full px-2 text-[11px] font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
            >
              {voiceOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              {voiceOn ? "Voice replies on" : "Voice muted"}
            </button>
            <button
              data-testid="chat-end-save-button"
              onClick={() => endAndSave()}
              className="flex min-h-[32px] items-center gap-1.5 rounded-full px-2 text-[11px] font-semibold text-amber-700 transition-colors hover:bg-amber-50"
            >
              <Save className="h-3.5 w-3.5" />
              End Chat &amp; Save
            </button>
          </div>
        </div>
      )}
    </>
  );
}
