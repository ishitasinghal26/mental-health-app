from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import SessionLocal
from app.models import Conversation
from app.services.chat_db_service import generate_title, save_chat
from app.services.chat_service import build_prompt, get_response
from app.services.data_service import get_user_data
from app.services.memory_service import get_history
from app.services.safety_service import detect_crisis

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def now_iso():
    return datetime.now(timezone.utc).isoformat()


@app.post("/chat")
def chat(user_id: int, message: str, conversation_id: int):
    db = SessionLocal()

    try:
        if detect_crisis(message):
            return {
                "reply": (
                    "I'm really glad you said that out loud. Please contact a trusted person or local emergency "
                    "service right now. If you can, stay with someone and avoid being alone."
                ),
                "crisis": True,
                "timestamp": now_iso(),
            }

        user_data = get_user_data(db, user_id)
        history = get_history(db, user_id, conversation_id)

        prompt = build_prompt(user_data, history, message)
        reply = get_response(prompt)

        conv = db.query(Conversation).filter_by(id=conversation_id).first()

        if conv and conv.title == "New Chat":
            conv.title = generate_title(message)
            db.commit()

        save_chat(db, user_id, message, reply, conversation_id)

        return {"reply": reply, "crisis": False, "timestamp": now_iso()}
    finally:
        db.close()


@app.get("/history")
def history(user_id: int, conversation_id: int):
    db = SessionLocal()

    try:
        return get_history(db, user_id, conversation_id)
    finally:
        db.close()


@app.get("/conversations")
def get_conversations(user_id: int):
    db = SessionLocal()

    try:
        convs = (
            db.query(Conversation)
            .filter_by(user_id=user_id)
            .order_by(Conversation.created_at.desc())
            .all()
        )

        return [{"id": c.id, "title": c.title} for c in convs]
    finally:
        db.close()


@app.post("/new-chat")
def new_chat(user_id: int):
    db = SessionLocal()

    try:
        conv = Conversation(user_id=user_id, title="New Chat")
        db.add(conv)
        db.commit()
        db.refresh(conv)

        return {"id": conv.id}
    finally:
        db.close()
