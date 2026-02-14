const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const controller = require("../controllers/journal.controller");

router.post("/", authMiddleware, controller.createJournal);
router.get("/", authMiddleware, controller.getMyJournals);
router.delete("/:id", authMiddleware, controller.deleteJournal);
router.put("/:id", authMiddleware, controller.updateJournal);

module.exports = router;
