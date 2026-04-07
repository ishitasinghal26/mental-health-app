const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const moodController = require("../controllers/mood.controller");

router.post("/", authMiddleware, moodController.addMood);
router.get("/", authMiddleware, moodController.getMyMoods);
router.delete("/:id", authMiddleware, moodController.deleteMood);
router.put("/:id", authMiddleware, moodController.updateMood);

module.exports = router;
