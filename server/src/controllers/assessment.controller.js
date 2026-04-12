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

function calculateWellnessScore(levels) {
  const scoreMap = {
    normal: 100,
    mild: 75,
    moderate: 50,
    severe: 25,
    extremely_severe: 10
  };

  return Math.round(
    (scoreMap[levels.depression] +
     scoreMap[levels.anxiety] +
     scoreMap[levels.stress]) / 3
  );
}

function getPrimaryConcern(scores) {
  return Object.keys(scores).reduce((a, b) =>
    scores[a] > scores[b] ? a : b
  );
}

function generateInsights(levels, context) {
  const insights = [];

  const isHigh = (level) =>
    ["moderate", "severe", "extremely_severe"].includes(level);

  if (isHigh(levels.stress)) {
    insights.push("Your stress levels have been higher than usual lately");
  }

  if (isHigh(levels.anxiety)) {
    insights.push("You may be experiencing frequent anxious thoughts");
  }

  if (isHigh(levels.depression)) {
    insights.push("Your mood seems to be low and may need attention");
  }

  if (context?.recentMoods?.length > 0) {
    insights.push("Your recent mood patterns show some fluctuations");
  }

  if (!context?.recentActivities || context.recentActivities.length === 0) {
    insights.push("You haven’t engaged in any wellness activities recently");
  }

  if (insights.length === 0) {
    insights.push("You are maintaining a healthy mental state, keep it up");
  }

  return insights;
}

function getJournalPrompt(levels, primaryConcern) {
  if (primaryConcern === "stress") {
    return "What is currently stressing you the most?";
  }

  if (primaryConcern === "anxiety") {
    return "What thoughts are making you feel anxious today?";
  }

  if (primaryConcern === "depression") {
    return "What has been weighing on your mind lately?";
  }

  return "What made you feel good today?";
}

async function submitAssessment(req, res) {
  try {
    const userId = req.user.id;
    const { dassAnswers, survey } = req.body;

    const moodResult = await db.query(
      "SELECT mood, intensity FROM mood_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5",
      [userId]
    );

    const journalResult = await db.query(
      "SELECT mood FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5",
      [userId]
    );

    const activityResult = await db.query(
      "SELECT activity_type FROM activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5",
      [userId]
    );

    const userContext = {
      recentMoods: moodResult.rows,
      recentJournals: journalResult.rows,
      recentActivities: activityResult.rows
    };

    const dassResult = dassService.processDASS(dassAnswers);
    const surveyResult = surveyService.processSurvey(survey);

    const profile = {
      ...dassResult.levels,
      ...surveyResult,
    };

    const recommendations =
      recommendationService.generateRecommendations(profile, userContext);

    const overallSeverity = getOverallSeverity(dassResult.levels);
    const wellnessScore = calculateWellnessScore(dassResult.levels);
    const primaryConcern = getPrimaryConcern(dassResult.scores);

    const insights = generateInsights(dassResult.levels, userContext);
    const journalPrompt = getJournalPrompt(dassResult.levels, primaryConcern);

    const responseData = {
      summary: {
        depression: dassResult.levels.depression,
        anxiety: dassResult.levels.anxiety,
        stress: dassResult.levels.stress,
      },
      interpretation: dassResult.interpretation,
      lifestyle: surveyResult,
      overallSeverity,
      wellnessScore,
      primaryConcern,
      insights,
      recommendations,
      journalPrompt,

      recommendedForYou: recommendations.slice(0, 3),
      activitySuggestion: recommendations[0]?.name || "Start with Deep Breathing",
      insightSummary: insights[0],

      aiTag: "Personalized using DASS + lifestyle inputs",
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

async function getFullAssessment(req, res) {
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
      return res.json({ data: null });
    }

    const row = result.rows[0];

    return res.json({
      data: {
        depression_score: row.depression_score,
        anxiety_score: row.anxiety_score,
        stress_score: row.stress_score,
        depression_level: row.depression_level,
        anxiety_level: row.anxiety_level,
        stress_level: row.stress_level,
        sleep_risk: row.sleep_risk,
        screen_risk: row.screen_risk,
        stress_self: row.stress_self,
        overall_severity: row.overall_severity,
        created_at: row.created_at,
      }
    });

  } catch (err) {
    console.error("getFullAssessment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function resetAssessment(req, res) {
  try {
    const userId = req.user.id;

    await db.query(
      "UPDATE users SET dass_completed = FALSE WHERE id = $1",
      [userId]
    );

    return res.json({
      message: "Assessment reset. You can now retake the DASS survey."
    });

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