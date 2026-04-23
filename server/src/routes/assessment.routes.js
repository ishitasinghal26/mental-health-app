const express = require("express");
const router = express.Router();

const {
  submitAssessment,
  getLatestAssessment,
  getFullAssessment,
  resetAssessment
} = require("../controllers/assessment.controller");

const auth = require("../middleware/auth.middleware");

router.post("/submit", auth, submitAssessment);
router.get("/latest", auth, getLatestAssessment);
router.get("/full", auth, getFullAssessment);
router.post("/reset", auth, resetAssessment);

module.exports = router;