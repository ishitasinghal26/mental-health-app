const express = require("express");
const router = express.Router();
const controller = require("../controllers/assessment.controller");
const auth = require("../middleware/auth.middleware");

router.post("/submit", auth, controller.submitAssessment);
router.get("/latest", auth, controller.getLatestAssessment);

module.exports = router;