import json
import os
import sqlite3
from datetime import datetime, timedelta

DB_PATH = os.environ.get("PRAKASH_DB_PATH", os.path.join(os.path.dirname(__file__), "leads.db"))

COURSES = [
    {
        "id": "neet",
        "tag": "Medical",
        "title": "NEET Foundation Flagship",
        "short": "NEET Foundation",
        "subjects": "Physics, Chemistry, Biology",
        "monthly": 3000,
        "annual": 36000,
        "popular": True,
    },
    {
        "id": "foundation",
        "tag": "Class 8–10",
        "title": "Class 8–10 Strong Foundation",
        "short": "Class 8–10 Foundation",
        "subjects": "Maths & Science",
        "monthly": 1500,
        "annual": 16500,
        "popular": False,
    },
    {
        "id": "pcm",
        "tag": "Class 11–12",
        "title": "Class 11–12 PCM Board + Entrance",
        "short": "Class 11–12 PCM",
        "subjects": "Physics, Chemistry, Maths",
        "monthly": 2500,
        "annual": 27500,
        "popular": False,
    },
    {
        "id": "iit",
        "tag": "Engineering",
        "title": "IIT-JEE Foundation",
        "short": "IIT-JEE Foundation",
        "subjects": "Advanced Maths & Physics Olympiad",
        "monthly": 3200,
        "annual": 38000,
        "popular": False,
    },
]


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _days_ago_at(days: int, hour: int, minute: int) -> datetime:
    now = datetime.now()
    dt = now - timedelta(days=days)
    return dt.replace(hour=hour, minute=minute, second=0, microsecond=0)


def _build_transcript(base_dt: datetime, pairs):
    out = []
    for idx, (sender, text) in enumerate(pairs):
        ts = base_dt + timedelta(seconds=40 * idx)
        out.append({"from": sender, "text": text, "time": ts.isoformat()})
    return out


def init_db():
    conn = get_conn()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS leads (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                courseId TEXT NOT NULL,
                timing TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                afterHours INTEGER NOT NULL DEFAULT 0,
                label TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Pending',
                voice INTEGER NOT NULL DEFAULT 0,
                summary TEXT NOT NULL,
                transcript TEXT NOT NULL
            )
            """
        )
        count = conn.execute("SELECT COUNT(*) FROM leads").fetchone()[0]
        if count == 0:
            d1 = _days_ago_at(1, 21, 14)
            d2 = _days_ago_at(1, 20, 42)
            d3 = _days_ago_at(2, 15, 20)
            d4 = _days_ago_at(3, 13, 15)
            seed_leads = [
                (
                    "seed-1",
                    "Tejashwin",
                    "9876543210",
                    "neet",
                    "8:00 PM",
                    d1.isoformat(),
                    1,
                    "HOT",
                    "Pending",
                    0,
                    "Enquired after office closing at 9:14 PM for NEET Foundation. Selected 8 PM evening batch and shared phone for callback.",
                    json.dumps(
                        _build_transcript(
                            d1,
                            [
                                ("guru", "Namaste! Welcome to Prakash Classes, Madhapur. May I know your name, please?"),
                                ("user", "Tejashwin"),
                                ("guru", "Thank you, Tejashwin ji! Could you share your 10-digit mobile number?"),
                                ("user", "9876543210"),
                                ("guru", "Which course are you interested in?"),
                                ("user", "NEET Foundation"),
                                ("guru", "NEET Foundation Flagship is ₹3,000/month (₹36,000/year). Which batch timing suits you best?"),
                                ("user", "8 PM"),
                                ("guru", "Wonderful! Our academic team will call you shortly to confirm your free demo class."),
                            ],
                        )
                    ),
                ),
                (
                    "seed-2",
                    "Sunitha Rao (Parent)",
                    "9849123456",
                    "pcm",
                    "6:00 PM",
                    d2.isoformat(),
                    1,
                    "HOT",
                    "Pending",
                    0,
                    "Parent looking for Class 11 PCM evening batch. Confirmed ₹2,500/mo fee and requested demo class.",
                    json.dumps(
                        _build_transcript(
                            d2,
                            [
                                ("guru", "Namaste! Welcome to Prakash Classes, Madhapur. May I know your name, please?"),
                                ("user", "Sunitha Rao, parent of a Class 11 student"),
                                ("guru", "Thank you, Sunitha ji! Could you share your 10-digit mobile number?"),
                                ("user", "9849123456"),
                                ("user", "What is the fee for Class 11 PCM?"),
                                ("guru", "Class 11–12 PCM Board + Entrance is ₹2,500/month (₹27,500/year)."),
                                ("user", "6 PM batch please, and a demo class"),
                                ("guru", "Done! Our academic team will call you shortly to confirm your free demo class."),
                            ],
                        )
                    ),
                ),
                (
                    "seed-3",
                    "Rahul Sharma",
                    "9012345678",
                    "foundation",
                    "4:00 PM",
                    d3.isoformat(),
                    0,
                    "WARM",
                    "Pending",
                    0,
                    "Asked about Class 9 Maths & Science timings and fees; comparing 4 PM vs 6 PM slots.",
                    json.dumps(
                        _build_transcript(
                            d3,
                            [
                                ("guru", "Namaste! Welcome to Prakash Classes, Madhapur. May I know your name, please?"),
                                ("user", "Rahul Sharma"),
                                ("user", "Class 9 maths and science fees?"),
                                ("guru", "Class 8–10 Strong Foundation is ₹1,500/month (₹16,500/year)."),
                                ("user", "9012345678. Is 4 PM or 6 PM better?"),
                                ("guru", "Both are max 25 students. Shall I note the 4 PM batch?"),
                                ("user", "4 PM for now, will confirm"),
                            ],
                        )
                    ),
                ),
                (
                    "seed-4",
                    "Sneha K",
                    "Not shared",
                    "iit",
                    "Flexible",
                    d4.isoformat(),
                    0,
                    "COLD",
                    "Pending",
                    0,
                    "Checked IIT-JEE Foundation monthly fee and closed chat before sharing contact number.",
                    json.dumps(
                        _build_transcript(
                            d4,
                            [
                                ("guru", "Namaste! Welcome to Prakash Classes, Madhapur. May I know your name, please?"),
                                ("user", "Sneha K"),
                                ("user", "IIT-JEE foundation monthly fee?"),
                                ("guru", "IIT-JEE Foundation is ₹3,200/month (₹38,000/year). Could you share your mobile number?"),
                                ("user", "Will check and come back"),
                            ],
                        )
                    ),
                ),
            ]
            conn.executemany(
                """
                INSERT INTO leads (id, name, phone, courseId, timing, createdAt, afterHours, label, status, voice, summary, transcript)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                seed_leads,
            )
            conn.commit()
    finally:
        conn.close()


def _row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "phone": row["phone"],
        "courseId": row["courseId"],
        "timing": row["timing"],
        "createdAt": row["createdAt"],
        "afterHours": bool(row["afterHours"]),
        "label": row["label"],
        "status": row["status"],
        "voice": bool(row["voice"]),
        "summary": row["summary"],
        "transcript": json.loads(row["transcript"]),
    }


def list_leads():
    conn = get_conn()
    try:
        rows = conn.execute("SELECT * FROM leads ORDER BY createdAt DESC").fetchall()
        return [_row_to_dict(r) for r in rows]
    finally:
        conn.close()


def create_lead(payload: dict) -> dict:
    now = datetime.now()
    lead_id = payload.get("id") or f"lead-{int(now.timestamp() * 1000)}"
    lead = {
        "id": lead_id,
        "name": payload.get("name") or "Anonymous Visitor",
        "phone": payload.get("phone") or "Not shared",
        "courseId": payload.get("courseId") or "",
        "timing": payload.get("timing") or "Flexible",
        "createdAt": payload.get("createdAt") or now.isoformat(),
        "afterHours": 1 if payload.get("afterHours") else 0,
        "label": payload.get("label") or "COLD",
        "status": payload.get("status") or "Pending",
        "voice": 1 if payload.get("voice") else 0,
        "summary": payload.get("summary") or "",
        "transcript": json.dumps(payload.get("transcript") or []),
    }
    conn = get_conn()
    try:
        conn.execute(
            """
            INSERT INTO leads (id, name, phone, courseId, timing, createdAt, afterHours, label, status, voice, summary, transcript)
            VALUES (:id, :name, :phone, :courseId, :timing, :createdAt, :afterHours, :label, :status, :voice, :summary, :transcript)
            """,
            lead,
        )
        conn.commit()
        row = conn.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone()
        return _row_to_dict(row)
    finally:
        conn.close()


def update_lead_status(lead_id: str, status: str):
    if status not in ("Pending", "Contacted", "Enrolled"):
        raise ValueError("Invalid status")
    conn = get_conn()
    try:
        cur = conn.execute("UPDATE leads SET status = ? WHERE id = ?", (status, lead_id))
        conn.commit()
        if cur.rowcount == 0:
            return None
        row = conn.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone()
        return _row_to_dict(row)
    finally:
        conn.close()
