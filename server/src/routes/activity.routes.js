const express = require("express");
const router = express.Router();

const {
  getActivities,
  completeActivity,
  getHistory,
} = require("../controllers/activity.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.get("/", getActivities);

router.post("/complete", authMiddleware, completeActivity);

router.get("/history", authMiddleware, getHistory);

module.exports = router;
