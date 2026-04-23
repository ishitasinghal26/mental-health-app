from sqlalchemy import text


def get_user_data(db, user_id: int) -> dict:
    """Fetch the user's DASS scores, recent moods and recent journal entries."""
    data = {
        "depression": 0, "anxiety": 0, "stress": 0,
        "depression_level": "normal", "anxiety_level": "normal", "stress_level": "normal",
        "recent_moods": [], "recent_journals": [],
    }

    try:
        # Latest DASS assessment
        assessment = db.execute(
            text("""
                SELECT depression_score, anxiety_score, stress_score,
                       depression_level, anxiety_level, stress_level
                FROM assessments
                WHERE user_id = :uid
                ORDER BY created_at DESC LIMIT 1
            """),
            {"uid": user_id},
        ).fetchone()

        if assessment:
            data.update({
                "depression":       assessment.depression_score or 0,
                "anxiety":          assessment.anxiety_score    or 0,
                "stress":           assessment.stress_score     or 0,
                "depression_level": assessment.depression_level or "normal",
                "anxiety_level":    assessment.anxiety_level    or "normal",
                "stress_level":     assessment.stress_level     or "normal",
            })
    except Exception:
        pass

    try:
        # Last 5 mood entries
        moods = db.execute(
            text("""
                SELECT mood, intensity, created_at
                FROM mood_entries
                WHERE user_id = :uid
                ORDER BY created_at DESC LIMIT 5
            """),
            {"uid": user_id},
        ).fetchall()

        data["recent_moods"] = [
            f"{r.mood} (intensity {r.intensity}/5) on {r.created_at.strftime('%b %d') if r.created_at else 'recent'}"
            for r in moods
        ]
    except Exception:
        pass

    try:
        # Last 3 journal entries (title + mood)
        journals = db.execute(
            text("""
                SELECT title, mood, created_at
                FROM journal_entries
                WHERE user_id = :uid
                ORDER BY created_at DESC LIMIT 3
            """),
            {"uid": user_id},
        ).fetchall()

        data["recent_journals"] = [
            f'"{r.title}" (mood: {r.mood})' if r.title else f"Mood: {r.mood}"
            for r in journals
        ]
    except Exception:
        pass

    return data