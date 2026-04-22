function calculateLifestyleScore(survey) {
  let score = 0;

  if (survey.sleepRisk === "normal") score += 40;
  else if (survey.sleepRisk === "moderate") score += 25;
  else score += 10;

  if (survey.screenRisk === "normal") score += 30;
  else if (survey.screenRisk === "moderate") score += 20;
  else score += 10;

  if (survey.stressSelf === "low") score += 30;
  else if (survey.stressSelf === "moderate") score += 20;
  else score += 10;

  return score;
}

function processSurvey(data) {
  const sleepRisk =
    data.sleepHours <= 5 ? "high" :
    data.sleepHours <= 7 ? "moderate" : "normal";

  const screenRisk =
    data.screenTime >= 8 ? "high" :
    data.screenTime >= 5 ? "moderate" : "normal";

  const stressSelf =
    data.selfStress
      ? data.selfStress.toLowerCase()
      : (sleepRisk === "high" || screenRisk === "high")
        ? "high"
        : "moderate";

  const lifestyleScore = calculateLifestyleScore({
    sleepRisk,
    screenRisk,
    stressSelf
  });

  const lifestyleCategory =
    lifestyleScore >= 70 ? "healthy" :
    lifestyleScore >= 40 ? "moderate" :
    "risky";

  return {
    sleepRisk,
    screenRisk,
    stressSelf,
    lifestyleScore,
    lifestyleCategory
  };
}

module.exports = {
  processSurvey,
};