from app.models import ChatbotLog

def save_chat(db, user_id, message, reply, conversation_id):

    log = ChatbotLog(
        user_id=user_id,
        user_message=message,
        bot_response=reply,
        conversation_id=conversation_id
    )

    db.add(log)
    db.commit()

from app.utils.gemini import client

from app.utils.gemini import client

def generate_title(message):

    prompt = f"""
Generate a short title (3-6 words) for this conversation.

Message:
{message}

Rules:
- Keep it short
- No punctuation
- No quotes
"""

    try:
        res = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return res.text.strip()
    except:
        return "New Chat"