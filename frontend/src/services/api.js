import { processGuruTurn } from "../utils/guruEngine";

const API_BASE = import.meta.env?.VITE_API_URL || "";
const STORAGE_KEY = "leadguru_leads_v1";

function getLocalLeads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLeads(leads) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch {
    // ignore storage quota errors
  }
}

export async function fetchLeads() {
  try {
    const res = await fetch(`${API_BASE}/api/leads`);
    if (!res.ok) throw new Error("Failed to fetch leads");
    const data = await res.json();
    saveLocalLeads(data.leads);
    return data.leads;
  } catch {
    return getLocalLeads();
  }
}

export async function createLead(lead) {
  try {
    const res = await fetch(`${API_BASE}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    if (!res.ok) throw new Error("Failed to save lead");
    const data = await res.json();
    return data.lead;
  } catch {
    const next = [lead, ...getLocalLeads()];
    saveLocalLeads(next);
    return lead;
  }
}

export async function updateLeadStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE}/api/leads/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    const data = await res.json();
    return data.lead;
  } catch {
    const next = getLocalLeads().map((l) => (l.id === id ? { ...l, status } : l));
    saveLocalLeads(next);
    return next.find((l) => l.id === id);
  }
}

export async function verifyOwnerPin(pin) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/verify-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    return Boolean(data.authorized);
  } catch {
    return pin === "1234";
  }
}

export async function sendGuruTurn(state, message) {
  try {
    const res = await fetch(`${API_BASE}/api/chat/turn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state, message }),
    });
    if (!res.ok) throw new Error("Chat API unavailable");
    return await res.json();
  } catch {
    return processGuruTurn(state, message);
  }
}

export function getExportCsvUrl() {
  return `${API_BASE}/api/leads/export`;
}
