function generateRecommendations(profile) {
  const recs = [];

  if (
    profile.depression === "moderate" ||
    profile.depression === "severe" ||
    profile.depression === "extremely_severe"
  ) {
    recs.push("Journaling");
    recs.push("Gratitude Practice");
  }

  if (
    profile.anxiety === "moderate" ||
    profile.anxiety === "severe" ||
    profile.anxiety === "extremely_severe"
  ) {
    recs.push("Breathing Exercises");
  }

  if (profile.sleepRisk === "high") {
    recs.push("Sleep Routine");
  }

  if (profile.screenRisk === "high") {
    recs.push("Digital Detox");
  }

  return [...new Set(recs)];
}

module.exports = {
  generateRecommendations,
};