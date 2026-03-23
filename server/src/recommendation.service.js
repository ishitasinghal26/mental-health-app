// Rule-based recommendation engine

function generateRecommendations(profile) {
  const recommendations = [];

  // Anxiety rules
  if (profile.anxiety === "severe" || profile.anxiety === "extremely_severe") {
    recommendations.push("Breathing Exercise", "Grounding Technique");
  }

  // Depression rules
  if (profile.depression === "moderate" || profile.depression === "severe") {
    recommendations.push("Journaling", "Gratitude Practice");
  }

  // Stress rules
  if (profile.stress === "severe") {
    recommendations.push("Meditation", "Relaxation Exercises");
  }

  // Lifestyle rules
  if (profile.sleepRisk === "high") {
    recommendations.push("Sleep Routine", "Reduce Night Screen Time");
  }

  if (profile.screenRisk === "high") {
    recommendations.push("Digital Detox", "Limit Screen Usage");
  }

  // Remove duplicates
  return [...new Set(recommendations)];
}

module.exports = {
  generateRecommendations,
};