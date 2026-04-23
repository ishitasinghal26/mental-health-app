import time
from app.utils.gemini import client


def build_prompt(user_data, history, user_input):
    history_text = "\n".join([
        f"{e['role']}: {e['text']}" for e in history[-4:]
    ])

    moods_text    = "\n".join(user_data.get("recent_moods",    [])) or "No recent mood logs."
    journals_text = "\n".join(user_data.get("recent_journals", [])) or "No recent journal entries."

    prompt = f"""You are MindKare Bot 🌿 — a warm, friendly mental wellness companion.

PERSONALITY:
- Short, natural replies (2–4 sentences max unless the user asks for more)
- Friendly, human, and grounding — like a caring friend
- Use emojis lightly (1–2 per response) to keep it warm
- Never preachy, clinical, or overly long
- No bullet lists unless the user asks for tips

USER'S WELLNESS CONTEXT (for your awareness only — don't repeat it to the user):
DASS-21: Depression {user_data['depression']}pts ({user_data.get('depression_level','normal')}), Anxiety {user_data['anxiety']}pts ({user_data.get('anxiety_level','normal')}), Stress {user_data['stress']}pts ({user_data.get('stress_level','normal')})
Recent moods: {moods_text}
Recent journals: {journals_text}

RECENT CHAT:
{history_text}

USER: {user_input}

Reply in the same language as the user. Keep it short, warm, and real. One follow-up question max."""

    return prompt


def get_response(prompt):
    models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"]

    for model in models:
        try:
            res = client.models.generate_content(model=model, contents=prompt)
            return res.text.replace("\n", "<br>")
        except Exception:
            time.sleep(1)

    return "I'm here for you. Please try again in a moment 🌿"
