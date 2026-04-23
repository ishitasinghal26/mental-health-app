const express = require("express");
const router  = express.Router();
const rateLimit = require("express-rate-limit");

const {
  register, verifyOtp, resendOtp,
  login, googleAuth, getMe, saveConsent,
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");

/* OTP rate limiters */
const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,   // 10 minutes
  max: 5,
  message: { message: "Too many OTP requests. Please try again in 10 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { message: "Too many verification attempts. Please wait and try again." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* Auth routes */
router.post("/register",     otpSendLimiter,   register);
router.post("/verify-otp",   otpVerifyLimiter, verifyOtp);
router.post("/resend-otp",   otpSendLimiter,   resendOtp);
router.post("/login",                          login);
router.post("/google",                         googleAuth);
router.get ("/me",           auth,             getMe);
router.patch("/consent",     auth,             saveConsent);

module.exports = router;
