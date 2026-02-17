// temporary database (per user)
let activityHistory = [];

function addActivity(entry) {
  activityHistory.push(entry);
}

function getUserHistory(userId) {
  return activityHistory.filter((a) => a.userId === userId);
}

module.exports = {
  addActivity,
  getUserHistory,
};
