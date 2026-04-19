from sqlalchemy import text


def get_user_data(db, user_id: int) -> dict:
    """Fetch the user's latest DASS scores from the assessments table."""
    try:
        result = db.execute(
            text(
                """
                SELECT depression_score, anxiety_score, stress_score,
                       depression_level, anxiety_level, stress_level
                FROM assessments
                WHERE user_id = :uid
                ORDER BY created_at DESC
                LIMIT 1
                """
            ),
            {"uid": user_id},
        ).fetchone()

        if result:
            return {
                "depression": result.depression_score or 0,
                "anxiety":    result.anxiety_score    or 0,
                "stress":     result.stress_score     or 0,
                "depression_level": result.depression_level or "normal",
                "anxiety_level":    result.anxiety_level    or "normal",
                "stress_level":     result.stress_level     or "normal",
            }
    except Exception:
        pass

    # Fallback: neutral baseline if no assessment found
    return {
        "depression": 0,
        "anxiety":    0,
        "stress":     0,
        "depression_level": "normal",
        "anxiety_level":    "normal",
        "stress_level":     "normal",
    }