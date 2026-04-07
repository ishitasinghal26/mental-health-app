const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { getChatHistory, sendMessage } = require("../controllers/chatbot.controller");

router.get("/history", auth, getChatHistory);
router.post("/message", auth, sendMessage);

module.exports = router;
