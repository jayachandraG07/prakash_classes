import React, { useState } from "react";
import { Lock, X } from "lucide-react";
import { verifyOwnerPin } from "../services/api";

export default function PinDialog({ open, onClose, onSuccess }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);

  if (!open) return null;

  const handleChange = async (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(v);
    setErr(false);
    if (v.length === 4) {
      const ok = await verifyOwnerPin(v);
      if (ok) {
        setPin("");
        onSuccess();
      } else {
        setErr(true);
        setPin("");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        data-testid="pin-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600">
            <Lock className="h-5 w-5" />
          </span>
          <h2 className="font-display mt-3 text-xl font-bold text-[#1C1917]">Owner Access</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your 4-digit PIN to open the dashboard.</p>
        </div>
        <div className="mt-5 flex flex-col items-center gap-3">
          <input
            data-testid="pin-input"
            type="password"
            inputMode="numeric"
            maxLength={4}
            autoFocus
            value={pin}
            onChange={handleChange}
            placeholder="• • • •"
            className="h-12 w-44 rounded-xl border border-slate-300 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
          {err && (
            <p data-testid="pin-error" className="text-sm font-medium text-red-600">
              Incorrect PIN. Please try again.
            </p>
          )}
          <p className="text-xs text-slate-400">Default PIN: 1234</p>
        </div>
      </div>
    </div>
  );
}
