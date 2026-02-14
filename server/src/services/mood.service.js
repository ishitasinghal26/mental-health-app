const moods = require("../data/moods");

function addMood(mood) {
  moods.push(mood);
  return mood;
}

function getMoodsByUser(userId) {
  return moods.filter((m) => m.userId === userId);
}

module.exports = {
  addMood,
  getMoodsByUser,
};
