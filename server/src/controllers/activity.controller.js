const activities = require("../data/activities");
const { addActivity, getUserHistory } = require("../data/activityHistory");

// GET all activities (with filters)
function getActivities(req, res) {
  const { difficulty, maxDuration } = req.query;

  let filtered = activities;

  if (difficulty) {
    filtered = filtered.filter((a) => a.difficulty === difficulty);
  }

  if (maxDuration) {
    filtered = filtered.filter((a) => a.duration <= Number(maxDuration));
  }

  res.json(filtered);
}

// SAVE completed activity
function completeActivity(req, res) {
  const userId = req.user?.id || "demoUser";

  const { title, duration, category } = req.body;

  addActivity({
    userId,
    title,
    duration,
    category,
    date: new Date(),
  });

  res.json({ message: "Activity saved successfully" });
}

// GET user activity history
function getHistory(req, res) {
  const userId = req.user?.id || "demoUser";
  const history = getUserHistory(userId);
  res.json(history);
}

module.exports = {
  getActivities,
  completeActivity,
  getHistory,
};
