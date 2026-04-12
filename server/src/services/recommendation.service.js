function generateRecommendations(profile, context) {
  const recs = [];

  const isHigh = (val) =>
    ["moderate", "severe", "extremely_severe"].includes(val);

  if (isHigh(profile.depression)) {
    recs.push({
      name: "Journaling",
      reason: "Helps process emotions and reduce overthinking"
    });
  }

  if (isHigh(profile.anxiety)) {
    recs.push({
      name: "Breathing Exercises",
      reason: "Calms nervous system and reduces anxiety instantly"
    });
  }

  if (isHigh(profile.stress)) {
    recs.push({
      name: "Meditation",
      reason: "Helps relax mind and reduce stress"
    });
  }

  if (context?.recentMoods?.some(m => m.mood === "stressed")) {
    recs.push({
      name: "5-4-3-2-1 Grounding",
      reason: "Helps reduce immediate stress"
    });
  }

  if (!context?.recentActivities || context.recentActivities.length === 0) {
    recs.push({
      name: "Start with Deep Breathing",
      reason: "Easy way to begin your wellness journey"
    });
  }

  return recs;
}

module.exports = {
  generateRecommendations,
};