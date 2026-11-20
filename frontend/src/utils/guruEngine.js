import { ADDRESS, COURSES, PHONE_DISPLAY, formatINR, formatTiming, getCourse } from "../data/constants";

export const SpeechRec =
  typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

export function speakText(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  text
    .split("\n")
    .filter(Boolean)
    .forEach((line) => {
      const lang = /[\u0C00-\u0C7F]/.test(line) ? "te-IN" : "en-IN";
      const u = new SpeechSynthesisUtterance(
        line.replace(/₹/g, "Rs ").replace(/\/mo\b/g, " per month").replace(/\/yr\b/g, " per year")
      );
      u.lang = lang;
      const voices = window.speechSynthesis.getVoices();
      const match =
        voices.find((v) => v.lang === lang) || voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
      if (match) u.voice = match;
      window.speechSynthesis.speak(u);
    });
}

export const stopSpeech = () => window.speechSynthesis?.cancel();

export const GURU_WELCOME =
  "Namaste! Welcome to Prakash Classes, Madhapur. Even after our classroom office closes at 8 PM, I'm here 24/7 to help parents and students check exact fees, batch timings, or reserve a free demo class. May I know your name, please?";

export const GURU_FALLBACK =
  "That's a great question—our academic head at the institute will call you back shortly with exact details.";

export const TELUGU_PROMPTS = {
  greet: "నమస్కారం! ప్రకాష్ క్లాసెస్‌కు స్వాగతం.",
  name: "దయచేసి మీ పేరు చెప్పండి.",
  phone: "దయచేసి మీ 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి.",
  course: "మీకు ఏ కోర్సు కావాలి?",
  timing: "మీకు ఏ బ్యాచ్ టైమింగ్ సరిపోతుంది?",
  done: "ధన్యవాదాలు! మా టీమ్ త్వరలో మీకు కాల్ చేస్తుంది.",
  on: "సరే! ఇకపై ప్రతి జవాబుతో తెలుగులో కూడా చెబుతాను.",
};

export const welcomeMsg = (telugu) => (telugu ? `${TELUGU_PROMPTS.greet}\n${GURU_WELCOME}` : GURU_WELCOME);

export const DEFAULT_CHIPS = [
  "NEET Foundation (₹3,000/mo)",
  "Class 11–12 PCM",
  "8 PM Evening Batch",
  "Book Free Demo",
];

export const initConv = () => ({
  step: "name",
  name: "",
  phone: "",
  courseId: "",
  timing: "",
  askedFee: false,
  demo: false,
});

const coursePitch = (c) =>
  `${c.title} covers ${c.subjects}. Fee: ${formatINR(c.monthly)}/month (${formatINR(
    c.annual
  )}/year), with NCERT + Exemplar, Daily DPP Sheets and a Weekly Parent Report. Batches at 11 AM, 4 PM, 6 PM & 8 PM — few seats left!`;

const cleanName = (s) =>
  s
    .replace(/^(my name is|name is|i am|i'm|this is|myself|it's|its|నా పేరు)\s+/i, "")
    .replace(/\s*(అండి|నా పేరు)$/, "")
    .replace(/[.!,]/g, "")
    .trim();

const TELUGU_MAP = [
  [/ఫీజు|ఫీస్|ఖర్చు|ఎంత/g, " fee "],
  [/టైమింగ్|సమయం|టైం|బ్యాచ్/g, " timing "],
  [/డెమో|ట్రయల్/g, " demo "],
  [/అడ్రస్|చిరునామా|ఎక్కడ/g, " address "],
  [/నీట్/g, " neet "],
  [/ఐఐటి|జేఈఈ|జెఈఈ/g, " iit "],
  [/స్కాలర్‌షిప్|డిస్కౌంట్|తగ్గింపు/g, " scholarship "],
  [/ఉదయం\s*11|11\s*గంటలకు/g, " 11 am "],
  [/సాయంత్రం\s*([468])/g, " $1 pm "],
  [/రాత్రి\s*8/g, " 8 pm "],
];

export function processGuruTurn(prevState, rawInput) {
  const state = { ...prevState };
  const raw = rawInput.trim();
  let norm = TELUGU_MAP.reduce((acc, [re, rep]) => acc.replace(re, rep), raw.toLowerCase());
  const replies = [];
  let handled = false;
  let badPhone = false;

  const phoneMatch = raw.match(/\+?\d[\d\s-]{6,}\d/);
  if (phoneMatch) {
    let digits = phoneMatch[0].replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    if (/^[6-9]\d{9}$/.test(digits)) {
      state.phone = digits;
    } else {
      badPhone = true;
      replies.push(
        "Hmm, that doesn't look like a valid 10-digit mobile number. Could you please share it once more? (e.g., 98490 45210)"
      );
    }
    handled = true;
    norm = norm.replace(phoneMatch[0].toLowerCase(), " ");
  }

  const timeMatch = (() => {
    const m11 = norm.match(/\b11\s*(:00)?\s*a\.?m\b/);
    if (m11) return { slot: "11 AM", match: m11[0] };
    const mPm = norm.match(/\b([468])\s*(:00)?\s*p\.?m\b/);
    return mPm ? { slot: `${mPm[1]} PM`, match: mPm[0] } : null;
  })();
  if (timeMatch) norm = norm.replace(timeMatch.match, " ");

  const courseId = /neet|biology|medical/.test(norm)
    ? "neet"
    : /iit|jee|olympiad|engineering/.test(norm)
      ? "iit"
      : /pcm|\b1[12](th)?\b|inter(mediate)?\b|eleven|twelve/.test(norm)
        ? "pcm"
        : /class\s*(8|9|10)\b|\b(8|9|10)(th)?\s*(class|std|standard)|8\s*[–-]\s*10|strong foundation|\b(8th|9th|10th)\b/.test(
              norm
            )
          ? "foundation"
          : "";

  const askedFee = /fee|cost|price|charge|how much|₹|rupee|amount|per month|monthly/.test(norm);
  if (courseId) {
    state.courseId = courseId;
    replies.push(coursePitch(getCourse(courseId)));
    handled = true;
  }
  if (askedFee) {
    state.askedFee = true;
    if (!courseId) {
      replies.push(
        state.courseId
          ? coursePitch(getCourse(state.courseId))
          : "Our fees: " +
              COURSES.map((c) => `${c.short} ${formatINR(c.monthly)}/mo (${formatINR(c.annual)}/yr)`).join(" • ") +
              "."
      );
    }
    handled = true;
  }
  if (timeMatch) {
    state.timing = timeMatch.slot;
    if (prevState.step !== "timing") {
      replies.push(
        `Our ${timeMatch.slot} batch is noted for you — evening batches fill fast, so it's good you asked early!`
      );
    }
    handled = true;
  } else if (/timing|time|slot|schedule|when|batch hours/.test(norm)) {
    replies.push("We run 4 batches daily: 11 AM, 4 PM, 6 PM and 8 PM. The 8 PM evening batch is filling fast.");
    handled = true;
  }
  if (/address|where|location|located|direction|map|reach/.test(norm)) {
    replies.push(`We're at ${ADDRESS}. You can also call us on ${PHONE_DISPLAY}.`);
    handled = true;
  }
  if (/batch size|how many students|students per|strength|size|crowd|small batch/.test(norm)) {
    replies.push("Every batch has a maximum of 25 students, so each child gets personal doubt-solving attention.");
    handled = true;
  }
  if (/demo|trial|free class/.test(norm)) {
    state.demo = true;
    replies.push("Wonderful! The demo class is completely FREE. Let me take a few quick details to reserve your seat.");
    handled = true;
  }
  if (/scholarship|discount|concession|offer|refund|install|emi|hostel|transport|bus|van|online|guarantee/.test(norm)) {
    replies.push(GURU_FALLBACK);
    handled = true;
  }

  let gotName = false;
  if (!handled && prevState.step === "name") {
    if (/^(hi+|hello|hey|namaste|good (morning|evening|afternoon))\b/.test(norm)) {
      handled = true;
    } else {
      const cleaned = cleanName(raw);
      if (
        !raw.includes("?") &&
        /^[a-zA-Z\u0C00-\u0C7F][a-zA-Z\u0C00-\u0C7F .']{0,40}$/.test(cleaned) &&
        cleaned.split(/\s+/).length <= 4
      ) {
        state.name = cleaned.replace(/\b\w/g, (ch) => ch.toUpperCase());
        gotName = true;
        handled = true;
      }
    }
  }
  if (!handled && prevState.step === "phone" && /\d/.test(raw)) {
    badPhone = true;
    handled = true;
    replies.push(
      "Hmm, that doesn't look like a valid 10-digit mobile number. Could you please share it once more? (e.g., 98490 45210)"
    );
  }
  if (!handled) replies.push(GURU_FALLBACK);

  state.step = state.name
    ? state.phone
      ? state.courseId
        ? state.timing
          ? "done"
          : "timing"
        : "course"
      : "phone"
    : "name";

  if (state.step === "done") {
    const c = getCourse(state.courseId);
    replies.push(
      `Wonderful, ${state.name} ji! I've noted your interest in ${c.title} for the ${formatTiming(
        state.timing
      )} batch. Our academic team will call you on ${state.phone} shortly to confirm your FREE demo class at ${ADDRESS}. See you soon!`
    );
    return { state, replies, complete: true };
  }
  if (!(badPhone && state.step === "phone")) {
    const prefix = gotName ? `Thank you, ${state.name} ji! ` : "";
    if (state.step === "name") replies.push("May I know your name, please?");
    else if (state.step === "phone")
      replies.push(`${prefix}Could you please share your 10-digit mobile number so our team can call you back?`);
    else if (state.step === "course")
      replies.push(`${prefix}Which course are you interested in? Please pick one below.`);
    else replies.push(`${prefix}Which batch timing suits you best? We have 11 AM, 4 PM, 6 PM and 8 PM slots.`);
  }
  return { state, replies, complete: false };
}
