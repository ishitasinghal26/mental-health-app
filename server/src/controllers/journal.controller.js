const db = require("../../config/db");

/**
 * POST /api/journals
 */
async function createJournal(req, res) {
  try {
    const { title, content, mood, intensity, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title & content required" });
    }

    const result = await db.query(
      `INSERT INTO journal_entries (user_id, title, content, mood, intensity, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, title, content, mood || "Neutral", intensity || 3, tags || []]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createJournal error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * GET /api/journals
 */
async function getMyJournals(req, res) {
  try {
    const result = await db.query(
      `SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("getMyJournals error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * DELETE /api/journals/:id
 */
async function deleteJournal(req, res) {
  try {
    const id = Number(req.params.id);
    await db.query(
      "DELETE FROM journal_entries WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteJournal error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * PUT /api/journals/:id
 */
async function updateJournal(req, res) {
  try {
    const id = Number(req.params.id);
    const { title, content, mood, intensity, tags } = req.body;

    const result = await db.query(
      `UPDATE journal_entries
       SET title = $1, content = $2, mood = $3, intensity = $4, tags = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, content, mood, intensity, tags || [], id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Entry not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("updateJournal error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createJournal,
  getMyJournals,
  deleteJournal,
  updateJournal,
};
