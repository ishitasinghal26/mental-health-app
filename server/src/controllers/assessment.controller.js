const dassService = require("../services/dass.service");
const surveyService = require("../services/survey.service");
const recommendationService = require("../services/recommendation.service");
const db = require("../../config/db");

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

    try {
      await db.query(
        `INSERT INTO assessments 
        (user_id, depression_score, anxiety_score, stress_score,
         depression_level, anxiety_level, stress_level,
         sleep_risk, screen_risk, stress_self, overall_severity, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`,
        [
          userId,
          dassResult.scores.depression,
          dassResult.scores.anxiety,
          dassResult.scores.stress,
          dassResult.levels.depression,
          dassResult.levels.anxiety,
          dassResult.levels.stress,
          surveyResult.sleepRisk,
          surveyResult.screenRisk,
          surveyResult.stressSelf,
          overallSeverity
        ]
      );
      // Mark DASS as completed on the user
      await db.query(
        "UPDATE users SET dass_completed = TRUE WHERE id = $1",
        [userId]
      );
    } catch (err) {
      console.error("DB insert failed:", err.message);
    }

    return res.json(responseData);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

async function getLatestAssessment(req, res) {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT * FROM assessments 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        message: "No assessment found yet",
        data: null,
      });
    }

    const dbData = result.rows[0];

    return res.json({
      summary: {
        depression: dbData.depression_level,
        anxiety: dbData.anxiety_level,
        stress: dbData.stress_level,
      },
      lifestyle: {
        sleepRisk: dbData.sleep_risk,
        screenRisk: dbData.screen_risk,
        stressSelf: dbData.stress_self,
      },
      overallSeverity: dbData.overall_severity,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * GET /api/assessment/full
 * Returns the latest assessment with all score details
 */
async function getFullAssessment(req, res) {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT * FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    if (result.rows.length === 0) {
      return res.json({ data: null });
    }
    const row = result.rows[0];
    return res.json({
      data: {
        depression_score: row.depression_score,
        anxiety_score:    row.anxiety_score,
        stress_score:     row.stress_score,
        depression_level: row.depression_level,
        anxiety_level:    row.anxiety_level,
        stress_level:     row.stress_level,
        sleep_risk:       row.sleep_risk,
        screen_risk:      row.screen_risk,
        stress_self:      row.stress_self,
        overall_severity: row.overall_severity,
        created_at:       row.created_at,
      }
    });
  } catch (err) {
    console.error("getFullAssessment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /api/assessment/reset
 * Resets dass_completed so user can retake the survey
 */
async function resetAssessment(req, res) {
  try {
    const userId = req.user.id;
    await db.query(
      "UPDATE users SET dass_completed = FALSE WHERE id = $1",
      [userId]
    );
    return res.json({ message: "Assessment reset. You can now retake the DASS survey." });
  } catch (err) {
    console.error("resetAssessment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  submitAssessment,
  getLatestAssessment,
  getFullAssessment,
  resetAssessment,
};