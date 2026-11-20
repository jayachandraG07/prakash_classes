export const PHONE_DISPLAY = "+91-98490-45210";
export const PHONE_TEL = "+919849045210";
export const ADDRESS = "Plot 42, Madhapur Main Road, Hyderabad";
export const TIMINGS = ["11 AM", "4 PM", "6 PM", "8 PM"];
export const formatTiming = (t) => t.replace(" ", ":00 ");

export const COURSES = [
  {
    id: "neet",
    tag: "Medical",
    title: "NEET Foundation Flagship",
    short: "NEET Foundation",
    subjects: "Physics, Chemistry, Biology",
    monthly: 3000,
    annual: 36000,
    popular: true,
  },
  {
    id: "foundation",
    tag: "Class 8–10",
    title: "Class 8–10 Strong Foundation",
    short: "Class 8–10 Foundation",
    subjects: "Maths & Science",
    monthly: 1500,
    annual: 16500,
    popular: false,
  },
  {
    id: "pcm",
    tag: "Class 11–12",
    title: "Class 11–12 PCM Board + Entrance",
    short: "Class 11–12 PCM",
    subjects: "Physics, Chemistry, Maths",
    monthly: 2500,
    annual: 27500,
    popular: false,
  },
  {
    id: "iit",
    tag: "Engineering",
    title: "IIT-JEE Foundation",
    short: "IIT-JEE Foundation",
    subjects: "Advanced Maths & Physics Olympiad",
    monthly: 3200,
    annual: 38000,
    popular: false,
  },
];

export const getCourse = (id) => COURSES.find((c) => c.id === id);
export const formatINR = (n) => `₹${n.toLocaleString("en-IN")}`;
export const formatCourseShort = (id) => {
  const c = getCourse(id);
  return c ? `${c.short} (${formatINR(c.annual)}/yr)` : "Not selected";
};

export const TOPPERS = [
  { name: "Sai Keerthi R.", score: "685/720", exam: "NEET UG", note: "State Rank 42" },
  { name: "Aarav Deshmukh", score: "99.4%", exam: "CBSE Class 10", note: "100/100 Maths" },
  { name: "Rohan Reddy", score: "99.2 %ile", exam: "JEE Main", note: "Physics & Maths" },
];

export const ALUMNI = [
  { name: "Harsha Vardhan K.", place: "IIT Bombay — Computer Science", feat: "JEE Adv AIR 312", year: "2019" },
  { name: "Divya Sri M.", place: "AIIMS New Delhi — MBBS", feat: "NEET AIR 186", year: "2020" },
  { name: "Arjun Rao P.", place: "Software Engineer, Google Hyderabad", feat: "IIT Madras Alum", year: "2016", role: true },
  { name: "Meghana Reddy", place: "Osmania Medical College", feat: "NEET 662/720", year: "2022" },
  { name: "Karthik Naidu", place: "NIT Warangal — ECE", feat: "JEE Main 99.1 %ile", year: "2021" },
  { name: "Lakshmi Prasanna", place: "IIIT Hyderabad — CSE", feat: "JEE Main 99.6 %ile", year: "2023" },
  { name: "Vamsi Krishna T.", place: "BITS Pilani — Mechanical", feat: "BITSAT 352", year: "2022" },
  { name: "Nikhitha S.", place: "Doctor, Gandhi Hospital Hyderabad", feat: "Gandhi Medical College Alum", year: "2014", role: true },
];

export const TRUST_ITEMS = [
  "14+ Years in Hyderabad",
  "98.6% Board Distinction",
  "25 Students / Batch",
  "Weekly OMR Mock Tests",
];

export const ADVANTAGES = [
  {
    id: "batch-size",
    title: "Max 25 Students / Batch",
    text: "Personal attention and 1-on-1 doubt clearing after every single Maths & Science lecture.",
    prompt: "What is the batch size?",
  },
  {
    id: "mock-tests",
    title: "Weekly OMR & CBT Mock Tests",
    text: "Exam-hall simulation every Sunday with instant performance reports sent to parents.",
    prompt: "Tell me about the weekly mock tests",
  },
  {
    id: "daily-dpp",
    title: "Daily DPP & NCERT Mastery",
    text: "Structured Daily Practice Problems bridging school boards with NEET & IIT-JEE foundations.",
    prompt: "Tell me about Daily DPP sheets and fees",
  },
  {
    id: "experience",
    title: "14+ Years in Madhapur",
    text: "Proven track record since 2012 with dedicated senior Physics, Chemistry, and Maths faculty.",
    prompt: "Where is the institute address?",
  },
  {
    id: "guru-ai",
    title: "24/7 Guru AI Counselor",
    text: "Office closes at 8 PM, but parents and students get instant fee, batch, and demo answers at 9 PM or midnight.",
    prompt: "Book Free Demo",
  },
];

export const STATUS_LIST = ["Pending", "Contacted", "Enrolled"];

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();

export const formatTimeObj = (d) =>
  d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
