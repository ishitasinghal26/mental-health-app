const express = require("express");
const router = express.Router();
const { register, login, getMe, saveConsent } = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);
router.patch("/consent", auth, saveConsent);

module.exports = router;
