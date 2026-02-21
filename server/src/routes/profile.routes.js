const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT id, name, email, age_group, gender, mental_goals, issues, bio, created_at FROM users WHERE id = $1",
      [userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, age_group, gender, mental_goals, issues, bio } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name=$1, age_group=$2, gender=$3, mental_goals=$4, issues=$5, bio=$6
       WHERE id=$7
       RETURNING id, name, email, age_group, gender, mental_goals, issues, bio, created_at`,
      [name, age_group, gender, mental_goals, issues, bio, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;