CRISIS_KEYWORDS = [
    "suicide",
    "kill myself",
    "want to die",
    "end my life",
    "hurt myself",
    "self harm",
]


def detect_crisis(text):
    normalized_text = text.lower()
    return any(keyword in normalized_text for keyword in CRISIS_KEYWORDS)
