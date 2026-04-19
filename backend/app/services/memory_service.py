from app.models import ChatbotLog


def get_history(db, user_id, conversation_id):
    logs = (
        db.query(ChatbotLog)
        .filter_by(user_id=user_id, conversation_id=conversation_id)
        .order_by(ChatbotLog.created_at.asc())
        .all()
    )

    history = []

    for log in logs:
        history.append(
            {
                "role": "user",
                "text": log.user_message,
                "timestamp": log.created_at.isoformat() if log.created_at else None,
            }
        )
        history.append(
            {
                "role": "assistant",
                "text": log.bot_response,
                "timestamp": log.created_at.isoformat() if log.created_at else None,
            }
        )

    return history
