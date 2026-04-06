const express = require("express");
const router = express.Router();

const { submitAssessment, getLatestAssessment } = require("../controllers/assessment.controller");
const auth = require("../middleware/auth.middleware");

router.post("/submit", auth, submitAssessment);
router.get("/latest", auth, getLatestAssessment);

module.exports = router;