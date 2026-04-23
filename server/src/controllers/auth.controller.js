const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");
const db = require("../../config/db");
const { sendOtpEmail, generateOtp } = require("../services/email.service");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ── In-memory OTP store (email → pending registration data) ── */
const otpStore = new Map();

function safeUser(u) {
  return { id: u.id, name: u.name, email: u.email, dass_completed: u.dass_completed, ai_consent: u.ai_consent, is_verified: u.is_verified, provider: u.provider };
}

/* ─── REGISTER — stores in memory, NOT in DB ─── */
async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

    const key = email.toLowerCase().trim();

    // Block if already verified in DB
    const existing = await db.query("SELECT id, is_verified FROM users WHERE email = $1", [key]);
    if (existing.rows.length > 0 && existing.rows[0].is_verified)
      return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await hashPassword(password);
    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min

    otpStore.set(key, { name: name.trim(), hashedPassword, otp, expiresAt });

    try { await sendOtpEmail(key, otp, name.trim()); }
    catch (e) { console.error("OTP email failed:", e.message); }

    return res.status(200).json({ message: "OTP sent to your email.", email: key });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
}

/* ─── VERIFY OTP — saves user to DB only after validation ─── */
async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const key = email.toLowerCase().trim();
    const pending = otpStore.get(key);

    if (!pending) return res.status(400).json({ message: "No pending registration found. Please register again." });
    if (Date.now() > pending.expiresAt) { otpStore.delete(key); return res.status(400).json({ message: "OTP expired. Please register again." }); }
    if (pending.otp !== String(otp).trim()) return res.status(400).json({ message: "Incorrect OTP. Please try again." });

    // Race-condition check
    const dup = await db.query("SELECT id FROM users WHERE email = $1", [key]);
    if (dup.rows.length > 0) { otpStore.delete(key); return res.status(409).json({ message: "Email already registered. Please log in." }); }

    const result = await db.query(
      `INSERT INTO users (name, email, password, provider, is_verified, dass_completed, ai_consent)
       VALUES ($1, $2, $3, 'local', TRUE, FALSE, NULL) RETURNING *`,
      [pending.name, key, pending.hashedPassword]
    );

    otpStore.delete(key);
    const user = result.rows[0];
    return res.json({ message: "Email verified!", token: generateToken(user), user: safeUser(user) });
  } catch (err) {
    console.error("VerifyOtp error:", err);
    return res.status(500).json({ message: "Verification failed" });
  }
}

/* ─── RESEND OTP ─── */
async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const key = email.toLowerCase().trim();
    const pending = otpStore.get(key);
    if (!pending) return res.status(400).json({ message: "No pending registration. Please sign up again." });

    const otp = generateOtp();
    otpStore.set(key, { ...pending, otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    await sendOtpEmail(key, otp, pending.name);
    return res.json({ message: "New OTP sent to your email." });
  } catch (err) {
    console.error("ResendOtp error:", err);
    return res.status(500).json({ message: "Failed to resend OTP" });
  }
}

/* ─── LOGIN ─── */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const result = await db.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    if (result.rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const user = result.rows[0];
    if (!user.password) return res.status(401).json({ message: "This account uses Google Sign-In" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.is_verified) return res.status(403).json({ message: "Please verify your email first.", unverified: true, email: user.email });

    return res.json({ token: generateToken(user), user: safeUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
}

/* ─── GOOGLE AUTH (login + signup with optional password) ─── */
async function googleAuth(req, res) {
  try {
    const { credential, password, fromRegister } = req.body;
    if (!credential) return res.status(400).json({ message: "Google credential required" });

    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const { email, name } = ticket.getPayload();
    if (!email) return res.status(400).json({ message: "No email from Google" });

    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    let user, isNewUser = false;

    if (existing.rows.length === 0) {
      // New user
      if (fromRegister && !password) {
        // Register flow needs password first — return profile for frontend to prompt
        return res.json({ needsPassword: true, profile: { name, email } });
      }
      const hashedPw = password ? await hashPassword(password) : null;
      const ins = await db.query(
        `INSERT INTO users (name, email, password, provider, is_verified, dass_completed, ai_consent)
         VALUES ($1, $2, $3, 'google', TRUE, FALSE, NULL) RETURNING *`,
        [name, email, hashedPw]
      );
      user = ins.rows[0];
      isNewUser = true;
    } else {
      user = existing.rows[0];
      // If coming from register page and user already exists
      if (fromRegister) return res.status(409).json({ message: "This Google account is already registered. Please log in instead." });
      // Update provider if needed
      if (user.provider !== "google") {
        const upd = await db.query("UPDATE users SET provider='google', is_verified=TRUE WHERE id=$1 RETURNING *", [user.id]);
        user = upd.rows[0];
      }
    }

    return res.json({ token: generateToken(user), user: safeUser(user), is_new_user: isNewUser });
  } catch (err) {
    console.error("GoogleAuth error:", err);
    return res.status(401).json({ message: "Google authentication failed" });
  }
}

/* ─── GET ME ─── */
async function getMe(req, res) {
  try {
    const result = await db.query("SELECT id, name, email, dass_completed, ai_consent, is_verified, provider FROM users WHERE id = $1", [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });
    return res.json(result.rows[0]);
  } catch (err) { return res.status(500).json({ message: "Server error" }); }
}

/* ─── SAVE CONSENT ─── */
async function saveConsent(req, res) {
  try {
    const { ai_consent } = req.body;
    if (typeof ai_consent !== "boolean") return res.status(400).json({ message: "ai_consent must be a boolean" });
    const result = await db.query("UPDATE users SET ai_consent=$1 WHERE id=$2 RETURNING id,name,email,dass_completed,ai_consent,is_verified,provider", [ai_consent, req.user.id]);
    return res.json({ user: result.rows[0] });
  } catch (err) { return res.status(500).json({ message: "Server error" }); }
}

module.exports = { register, verifyOtp, resendOtp, login, googleAuth, getMe, saveConsent };
