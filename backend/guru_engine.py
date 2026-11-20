import re
from db import COURSES

PHONE_DISPLAY = "+91-98490-45210"
ADDRESS = "Plot 42, Madhapur Main Road, Hyderabad"
GURU_FALLBACK = "That's a great question—our academic head at the institute will call you back shortly with exact details."

TELUGU_MAP = [
    (re.compile(r"ఫీజు|ఫీస్|ఖర్చు|ఎంత"), " fee "),
    (re.compile(r"టైమింగ్|సమయం|టైం|బ్యాచ్"), " timing "),
    (re.compile(r"డెమో|ట్రయల్"), " demo "),
    (re.compile(r"అడ్రస్|చిరునామా|ఎక్కడ"), " address "),
    (re.compile(r"నీట్"), " neet "),
    (re.compile(r"ఐఐటి|జేఈఈ|జెఈఈ"), " iit "),
    (re.compile(r"స్కాలర్‌షిప్|డిస్కౌంట్|తగ్గింపు"), " scholarship "),
    (re.compile(r"ఉదయం\s*11|11\s*గంటలకు"), " 11 am "),
    (re.compile(r"సాయంత్రం\s*([468])"), r" \1 pm "),
    (re.compile(r"రాత్రి\s*8"), " 8 pm "),
]


def _get_course(course_id: str):
    return next((c for c in COURSES if c["id"] == course_id), None)


def _format_inr(amount: int) -> str:
    s = str(amount)
    if len(s) <= 3:
        return f"₹{s}"
    last3 = s[-3:]
    rest = s[:-3]
    parts = []
    while len(rest) > 2:
        parts.append(rest[-2:])
        rest = rest[:-2]
    if rest:
        parts.append(rest)
    return "₹" + ",".join(reversed(parts)) + "," + last3


def _course_pitch(course: dict) -> str:
    return (
        f"{course['title']} covers {course['subjects']}. "
        f"Fee: {_format_inr(course['monthly'])}/month ({_format_inr(course['annual'])}/year), "
        f"with NCERT + Exemplar, Daily DPP Sheets and a Weekly Parent Report. "
        f"Batches at 11 AM, 4 PM, 6 PM & 8 PM — few seats left!"
    )


def _clean_name(raw: str) -> str:
    cleaned = re.sub(
        r"^(my name is|name is|i am|i'm|this is|myself|it's|its|నా పేరు)\s+",
        "",
        raw,
        flags=re.IGNORECASE,
    )
    cleaned = re.sub(r"\s*(అండి|నా పేరు)$", "", cleaned)
    cleaned = re.sub(r"[.!,]", "", cleaned).strip()
    return cleaned


def process_guru_turn(prev_state: dict, raw_input: str) -> dict:
    state = {
        "step": prev_state.get("step", "name"),
        "name": prev_state.get("name", ""),
        "phone": prev_state.get("phone", ""),
        "courseId": prev_state.get("courseId", ""),
        "timing": prev_state.get("timing", ""),
        "askedFee": bool(prev_state.get("askedFee", False)),
        "demo": bool(prev_state.get("demo", False)),
    }
    raw = raw_input.strip()
    norm = raw.lower()
    for pattern, repl in TELUGU_MAP:
        norm = pattern.sub(repl, norm)

    replies = []
    handled = False
    bad_phone = False

    phone_match = re.search(r"\+?\d[\d\s-]{6,}\d", raw)
    if phone_match:
        digits = re.sub(r"\D", "", phone_match.group(0))
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        if len(digits) == 11 and digits.startswith("0"):
            digits = digits[1:]
        if re.match(r"^[6-9]\d{9}$", digits):
            state["phone"] = digits
        else:
            bad_phone = True
            replies.append(
                "Hmm, that doesn't look like a valid 10-digit mobile number. Could you please share it once more? (e.g., 98490 45210)"
            )
        handled = True
        norm = norm.replace(phone_match.group(0).lower(), " ")

    time_slot = None
    time_match_str = None
    m11 = re.search(r"\b11\s*(:00)?\s*a\.?m\b", norm)
    if m11:
        time_slot = "11 AM"
        time_match_str = m11.group(0)
    else:
        mpm = re.search(r"\b([468])\s*(:00)?\s*p\.?m\b", norm)
        if mpm:
            time_slot = f"{mpm.group(1)} PM"
            time_match_str = mpm.group(0)
    if time_match_str:
        norm = norm.replace(time_match_str, " ")

    course_id = ""
    if re.search(r"neet|biology|medical", norm):
        course_id = "neet"
    elif re.search(r"iit|jee|olympiad|engineering", norm):
        course_id = "iit"
    elif re.search(r"pcm|\b1[12](th)?\b|inter(mediate)?\b|eleven|twelve", norm):
        course_id = "pcm"
    elif re.search(
        r"class\s*(8|9|10)\b|\b(8|9|10)(th)?\s*(class|std|standard)|8\s*[–-]\s*10|strong foundation|\b(8th|9th|10th)\b",
        norm,
    ):
        course_id = "foundation"

    asked_fee = bool(re.search(r"fee|cost|price|charge|how much|₹|rupee|amount|per month|monthly", norm))

    if course_id:
        state["courseId"] = course_id
        replies.append(_course_pitch(_get_course(course_id)))
        handled = True

    if asked_fee:
        state["askedFee"] = True
        if not course_id:
            if state["courseId"]:
                replies.append(_course_pitch(_get_course(state["courseId"])))
            else:
                fee_summary = " • ".join(
                    f"{c['short']} {_format_inr(c['monthly'])}/mo ({_format_inr(c['annual'])}/yr)"
                    for c in COURSES
                )
                replies.append(f"Our fees: {fee_summary}.")
        handled = True

    if time_slot:
        state["timing"] = time_slot
        if prev_state.get("step") != "timing":
            replies.append(
                f"Our {time_slot} batch is noted for you — evening batches fill fast, so it's good you asked early!"
            )
        handled = True
    elif re.search(r"timing|time|slot|schedule|when|batch hours", norm):
        replies.append("We run 4 batches daily: 11 AM, 4 PM, 6 PM and 8 PM. The 8 PM evening batch is filling fast.")
        handled = True

    if re.search(r"address|where|location|located|direction|map|reach", norm):
        replies.append(f"We're at {ADDRESS}. You can also call us on {PHONE_DISPLAY}.")
        handled = True

    if re.search(r"batch size|how many students|students per|strength|size|crowd|small batch", norm):
        replies.append(
            "Every batch has a maximum of 25 students, so each child gets personal doubt-solving attention."
        )
        handled = True

    if re.search(r"demo|trial|free class", norm):
        state["demo"] = True
        replies.append("Wonderful! The demo class is completely FREE. Let me take a few quick details to reserve your seat.")
        handled = True

    if re.search(r"scholarship|discount|concession|offer|refund|install|emi|hostel|transport|bus|van|online|guarantee", norm):
        replies.append(GURU_FALLBACK)
        handled = True

    got_name = False
    if not handled and prev_state.get("step", "name") == "name":
        if re.match(r"^(hi+|hello|hey|namaste|good (morning|evening|afternoon))\b", norm):
            handled = True
        else:
            cleaned = _clean_name(raw)
            if (
                "?" not in raw
                and re.match(r"^[a-zA-Z\u0C00-\u0C7F][a-zA-Z\u0C00-\u0C7F .']{0,40}$", cleaned)
                and len(cleaned.split()) <= 4
            ):
                state["name"] = " ".join(w[:1].upper() + w[1:] for w in cleaned.split())
                got_name = True
                handled = True

    if not handled and prev_state.get("step") == "phone" and re.search(r"\d", raw):
        bad_phone = True
        handled = True
        replies.append(
            "Hmm, that doesn't look like a valid 10-digit mobile number. Could you please share it once more? (e.g., 98490 45210)"
        )

    if not handled:
        replies.append(GURU_FALLBACK)

    if not state["name"]:
        state["step"] = "name"
    elif not state["phone"]:
        state["step"] = "phone"
    elif not state["courseId"]:
        state["step"] = "course"
    elif not state["timing"]:
        state["step"] = "timing"
    else:
        state["step"] = "done"

    if state["step"] == "done":
        course = _get_course(state["courseId"])
        timing_formatted = state["timing"].replace(" ", ":00 ")
        replies.append(
            f"Wonderful, {state['name']} ji! I've noted your interest in {course['title']} for the {timing_formatted} batch. "
            f"Our academic team will call you on {state['phone']} shortly to confirm your FREE demo class at {ADDRESS}. See you soon!"
        )
        return {"state": state, "replies": replies, "complete": True}

    if not (bad_phone and state["step"] == "phone"):
        prefix = f"Thank you, {state['name']} ji! " if got_name else ""
        if state["step"] == "name":
            replies.append("May I know your name, please?")
        elif state["step"] == "phone":
            replies.append(f"{prefix}Could you please share your 10-digit mobile number so our team can call you back?")
        elif state["step"] == "course":
            replies.append(f"{prefix}Which course are you interested in? Please pick one below.")
        else:
            replies.append(f"{prefix}Which batch timing suits you best? We have 11 AM, 4 PM, 6 PM and 8 PM slots.")

    return {"state": state, "replies": replies, "complete": False}
