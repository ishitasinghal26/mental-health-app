// Process additional lifestyle survey
// Frontend sends: { sleepHours, screenHours, stressLevel }

function processSurvey(data) {
  const sleep  = parseFloat(data.sleepHours)  || 0;
  const screen = parseFloat(data.screenHours) || 0;

  return {
    sleepRisk:
      sleep <= 5 ? "high" :
      sleep <= 7 ? "moderate" : "normal",

    screenRisk:
      screen >= 8 ? "high" :
      screen >= 5 ? "moderate" : "normal",

    stressSelf: data.stressLevel || "moderate",
  };
}

module.exports = {
  processSurvey,
};