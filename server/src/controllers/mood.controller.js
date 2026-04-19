const db = require("../../config/db");

/**
 * POST /api/moods
 */
async function addMood(req, res) {
  try {
    const { mood, intensity, note } = req.body;

    if (!mood) {
      return res.status(400).json({ message: "Mood is required" });
    }

    const result = await db.query(
      `INSERT INTO mood_entries (user_id, mood, intensity, note)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, mood, intensity || 3, note || ""]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("addMood error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * GET /api/mood  (or /api/mood?limit=N)
 */
async function getMyMoods(req, res) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

    const query = limit
      ? `SELECT * FROM mood_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`
      : `SELECT * FROM mood_entries WHERE user_id = $1 ORDER BY created_at DESC`;

    const params = limit ? [req.user.id, limit] : [req.user.id];
    const result = await db.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.error("getMyMoods error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


/**
 * DELETE /api/moods/:id
 */
async function deleteMood(req, res) {
  try {
    const id = Number(req.params.id);
    await db.query(
      "DELETE FROM mood_entries WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteMood error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * PUT /api/moods/:id
 */
async function updateMood(req, res) {
  try {
    const id = Number(req.params.id);
    const { mood, intensity, note } = req.body;

    const result = await db.query(
      `UPDATE mood_entries
       SET mood = $1, intensity = $2, note = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [mood, intensity, note, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Entry not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("updateMood error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { addMood, getMyMoods, deleteMood, updateMood };
