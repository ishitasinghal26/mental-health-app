// Process additional lifestyle survey

function processSurvey(data) {
  return {
    sleepRisk:
      data.sleepHours <= 5 ? "high" :
      data.sleepHours <= 7 ? "moderate" : "normal",

    screenRisk:
      data.screenTime >= 8 ? "high" :
      data.screenTime >= 5 ? "moderate" : "normal",

    stressSelf: data.selfStress || "unknown",
  };
}

module.exports = {
  processSurvey,
};