const moodService = require("../services/mood.service");

let moodId = 1;

/**
 * POST /api/moods
 */
function addMood(req, res) {
  const { mood, emoji, note } = req.body;

  if (!mood || !emoji) {
    return res.status(400).json({ message: "Mood and emoji are required" });
  }

  const newMood = {
    id: moodId++,
    userId: req.user.id,
    mood,
    emoji,
    note: note || "",
    date: new Date().toISOString(),
  };

  moodService.addMood(newMood);
  res.status(201).json(newMood);
}

/**
 * GET /api/moods
 */
function getMyMoods(req, res) {
  const userMoods = moodService.getMoodsByUser(req.user.id);
  res.json(userMoods);
}

module.exports = {
  addMood,
  getMyMoods,
};
