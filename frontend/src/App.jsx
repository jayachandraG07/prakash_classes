import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AlumniMarquee from "./components/AlumniMarquee";
import AdvantagesSection from "./components/AdvantagesSection";
import ToppersSection from "./components/ToppersSection";
import CoursesSection from "./components/CoursesSection";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import PinDialog from "./components/PinDialog";
import OwnerDashboard from "./components/OwnerDashboard";

export default function App() {
  const [view, setView] = useState("site");
  const [pinOpen, setPinOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRequest, setChatRequest] = useState(null);
  const [version, setVersion] = useState(0);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="App min-h-screen overflow-x-clip bg-white">
      {toast && (
        <div
          className={`fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-lg ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-slate-200 bg-white text-slate-800"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {view === "dashboard" ? (
        <OwnerDashboard version={version} onBack={() => setView("site")} showToast={showToast} />
      ) : (
        <>
          <Navbar onDashboard={() => setPinOpen(true)} />
          <Hero onChat={() => setChatOpen(true)} />
          <AlumniMarquee />
          <AdvantagesSection
            onAsk={(text) => {
              setChatOpen(true);
              setChatRequest({ text, n: Date.now() });
            }}
          />
          <ToppersSection />
          <CoursesSection
            onAsk={(courseId) => {
              setChatOpen(true);
              setChatRequest({ courseId, n: Date.now() });
            }}
          />
          <Footer />
        </>
      )}

      <div className={view === "dashboard" ? "hidden" : ""}>
        <ChatWidget
          open={chatOpen}
          setOpen={setChatOpen}
          request={chatRequest}
          onSaved={() => setVersion((v) => v + 1)}
          showToast={showToast}
        />
      </div>

      <PinDialog
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onSuccess={() => {
          setPinOpen(false);
          setView("dashboard");
          window.scrollTo(0, 0);
        }}
      />
    </div>
  );
}
