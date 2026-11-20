# Prakash Classes | LeadGuru

A full-stack coaching institute website, **24/7 bilingual AI counselor (English & తెలుగు)**, and **Morning Lead Brief** dashboard built to help coaching institutes capture admission enquiries after 8 PM, on weekends, and during public holidays.

## How It Captures Midnight & Holiday Leads

### Chapter 01: The After-Hours Gap (11:42 PM — Office Closed, Parent Searching)
Most coaching institutes close their front desk at **8:00 PM**, and staff are unavailable on **Sundays and public holidays**. Working parents and students research courses late at night—comparing fees, batch timings, and demo availability. Without an instant response, high-intent families move on to the next institute by morning.

### Chapter 02: 24/7 Bilingual AI Counselor (Guru Replies Instantly)
**Guru** responds 24/7 in **English or తెలుగు (Telugu)** via text and voice:
- Shares exact **course fees** (`₹1,500/mo` to `₹3,200/mo`), **batch timings** (`11 AM`, `4 PM`, `6 PM`, `8 PM`), **batch size** (max 25 students), and **institute address**.
- Collects **Name**, **10-digit Mobile Number**, **Course**, and **Preferred Batch Timing**.
- Automatically tags enquiries received at or after 8:00 PM as **`After 8 PM`** and scores intent as **Hot**, **Warm**, or **Cold**.

### Chapter 03: Morning Lead Brief (8:00 AM — Ready for WhatsApp Follow-Up)
When the institute owner opens the **Owner Dashboard** (PIN: `1234`) the next morning or after a holiday:
- Every after-hours and holiday enquiry is organized with **AI Lead Summaries**, **Full Chat Transcripts**, and **Estimated Revenue Pipeline (₹)**.
- **1-Click WhatsApp Follow-Up** pre-fills a warm confirmation message so the team can book free demo classes in seconds, or export leads to **CSV**.

## Local Setup Guide

### Prerequisites
- **Python 3.9+** (uses Python's built-in `http.server` and `sqlite3` — no `pip install` required)
- **Node.js 18+** and **npm**

### 1. Start the Backend API (Terminal 1)
```bash
cd backend
python3 server.py
```
The backend starts on port `8000` and automatically creates and seeds `backend/leads.db`.

### 2. Start the Frontend App (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Open the local Vite dev server URL shown in your terminal (default port `5173`).

### 3. Try It Out
1. Click **Chat with Guru (24/7 AI)** on the landing page.
2. Switch between **EN** and **తెలుగు**, ask about fees or batch timings, and complete a sample enquiry.
3. Click **Owner Dashboard** in the navbar and enter PIN **`1234`** to inspect the captured lead, cycle its status (`Pending` → `Contacted` → `Enrolled`), or export CSV.
# prakash_classes
