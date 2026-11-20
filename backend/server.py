import csv
import io
import json
import os
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

from db import COURSES, create_lead, init_db, list_leads, update_lead_status
from guru_engine import process_guru_turn

PORT = int(os.environ.get("PORT", "8000"))
OWNER_PIN = os.environ.get("OWNER_PIN", "1234")


class LeadGuruHandler(BaseHTTPRequestHandler):
    def _send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _send_json(self, status: int, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._send_cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw)

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors()
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/api/health":
            return self._send_json(200, {"status": "ok", "service": "prakash-guru-api"})

        if path == "/api/courses":
            return self._send_json(200, {"courses": COURSES})

        if path == "/api/leads":
            return self._send_json(200, {"leads": list_leads()})

        if path == "/api/leads/export":
            leads = list_leads()
            course_map = {c["id"]: c for c in COURSES}
            buf = io.StringIO()
            writer = csv.writer(buf)
            writer.writerow(
                [
                    "Name",
                    "Phone",
                    "Course",
                    "Annual Fee (INR)",
                    "Preferred Batch",
                    "Enquiry Time",
                    "After 8 PM",
                    "Temperature",
                    "Status",
                    "Summary",
                ]
            )
            for l in leads:
                c = course_map.get(l["courseId"])
                course_str = f"{c['short']} (₹{c['annual']:,}/yr)" if c else "Not selected"
                writer.writerow(
                    [
                        l["name"],
                        l["phone"],
                        course_str,
                        c["annual"] if c else 0,
                        l["timing"],
                        l["createdAt"],
                        "Yes" if l["afterHours"] else "No",
                        l["label"],
                        l.get("status", "Pending"),
                        l["summary"],
                    ]
                )
            body = ("\ufeff" + buf.getvalue()).encode("utf-8")
            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "text/csv; charset=utf-8")
            self.send_header(
                "Content-Disposition",
                f'attachment; filename="prakash-leads-{datetime.now().strftime("%Y-%m-%d")}.csv"',
            )
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        self._send_json(404, {"error": "Not found"})

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            payload = self._read_json()
        except Exception:
            return self._send_json(400, {"error": "Invalid JSON body"})

        if path == "/api/leads":
            lead = create_lead(payload)
            return self._send_json(201, {"lead": lead})

        if path == "/api/chat/turn":
            prev_state = payload.get("state") or {}
            message = payload.get("message") or ""
            if not message.strip():
                return self._send_json(400, {"error": "Message is required"})
            result = process_guru_turn(prev_state, message)
            return self._send_json(200, result)

        if path == "/api/auth/verify-pin":
            pin = str(payload.get("pin") or "")
            if pin == OWNER_PIN:
                return self._send_json(200, {"authorized": True})
            return self._send_json(401, {"authorized": False, "error": "Incorrect PIN. Please try again."})

        self._send_json(404, {"error": "Not found"})

    def do_PATCH(self):
        path = urlparse(self.path).path
        if path.startswith("/api/leads/"):
            lead_id = path.split("/api/leads/", 1)[1].strip("/")
            try:
                payload = self._read_json()
                status = payload.get("status")
                updated = update_lead_status(lead_id, status)
                if not updated:
                    return self._send_json(404, {"error": "Lead not found"})
                return self._send_json(200, {"lead": updated})
            except ValueError as exc:
                return self._send_json(400, {"error": str(exc)})
            except Exception:
                return self._send_json(400, {"error": "Invalid request"})

        self._send_json(404, {"error": "Not found"})


def run():
    init_db()
    server = ThreadingHTTPServer(("127.0.0.1", PORT), LeadGuruHandler)
    print(f"Prakash Classes LeadGuru API listening on http://127.0.0.1:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    run()
