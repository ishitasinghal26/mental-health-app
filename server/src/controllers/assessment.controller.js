const dassService = require("../services/dass.service");
const surveyService = require("../services/survey.service");
const recommendationService = require("../services/recommendation.service");
const db = require("../../config/db");

let latestAssessmentStore = {};

function getOverallSeverity(levels) {
  const order = ["normal","mild","moderate","severe","extremely_severe"];

  return ["depression","anxiety","stress"]
    .map(key => levels[key])
    .sort((a,b) => order.indexOf(b) - order.indexOf(a))[0];
}

async function submitAssessment(req, res) {
  try {
    const userId = req.user.id;

    const { dassAnswers, survey } = req.body;

    const dassResult = dassService.processDASS(dassAnswers);

    const surveyResult = surveyService.processSurvey(survey);

    const profile = {
      ...dassResult.levels,
      ...surveyResult,
    };

    const recommendations =
      recommendationService.generateRecommendations(profile);

    const overallSeverity = getOverallSeverity(dassResult.levels);

    const responseData = {
      summary: {
        depression: dassResult.levels.depression,
        anxiety: dassResult.levels.anxiety,
        stress: dassResult.levels.stress,
      },
      interpretation: dassResult.interpretation,
      lifestyle: surveyResult,
      overallSeverity,
      recommendations,
    };

    latestAssessmentStore[userId] = responseData;

    res.json(responseData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function getLatestAssessment(req, res) {
  try {
    const userId = req.user.id;

    const data = latestAssessmentStore[userId];

    if (!data) {
      return res.json({
        message: "No assessment found yet",
        data: null,
      });
    }

    res.json({
      message: "Latest assessment fetched",
      data,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  submitAssessment,
  getLatestAssessment,
};