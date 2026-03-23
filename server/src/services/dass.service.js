const depressionIdx = [3, 5, 10, 13, 16, 17, 21];
const anxietyIdx = [2, 4, 7, 9, 15, 19, 20];
const stressIdx = [1, 6, 8, 11, 12, 14, 18];

function calculateScore(indices, answers) {
  return indices.reduce((sum, i) => sum + answers[i - 1], 0) * 2;
}

function classify(type, score) {
  const ranges = {
    depression: [
      [0, 9, "normal"],
      [10, 13, "mild"],
      [14, 20, "moderate"],
      [21, 27, "severe"],
      [28, 100, "extremely_severe"],
    ],
    anxiety: [
      [0, 7, "normal"],
      [8, 9, "mild"],
      [10, 14, "moderate"],
      [15, 19, "severe"],
      [20, 100, "extremely_severe"],
    ],
    stress: [
      [0, 14, "normal"],
      [15, 18, "mild"],
      [19, 25, "moderate"],
      [26, 33, "severe"],
      [34, 100, "extremely_severe"],
    ],
  };

  return ranges[type].find(([min, max]) => score >= min && score <= max)[2];
}

function getInterpretation(levels) {
  const messages = {
    depression: {
      normal: "No significant signs of depression.",
      mild: "Mild signs of low mood.",
      moderate: "Moderate depressive symptoms detected.",
      severe: "High level of depressive symptoms.",
      extremely_severe: "Very high depressive distress detected.",
    },
    anxiety: {
      normal: "No significant anxiety.",
      mild: "Mild anxiety symptoms.",
      moderate: "Moderate anxiety detected.",
      severe: "High anxiety level.",
      extremely_severe: "Very high anxiety level.",
    },
    stress: {
      normal: "Normal stress levels.",
      mild: "Mild stress.",
      moderate: "Moderate stress level.",
      severe: "High stress level.",
      extremely_severe: "Very high stress level.",
    },
  };

  return {
    depression: messages.depression[levels.depression],
    anxiety: messages.anxiety[levels.anxiety],
    stress: messages.stress[levels.stress],
  };
}

function processDASS(answers) {
  if (!answers || answers.length !== 21) {
    throw new Error("DASS-21 requires exactly 21 answers");
  }

  const depressionScore = calculateScore(depressionIdx, answers);
  const anxietyScore = calculateScore(anxietyIdx, answers);
  const stressScore = calculateScore(stressIdx, answers);

  const levels = {
    depression: classify("depression", depressionScore),
    anxiety: classify("anxiety", anxietyScore),
    stress: classify("stress", stressScore),
  };

  return {
    scores: {
      depression: depressionScore,
      anxiety: anxietyScore,
      stress: stressScore,
    },
    levels,
    interpretation: getInterpretation(levels),
  };
}

module.exports = {
  processDASS,
};