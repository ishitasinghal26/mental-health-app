const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");
const db = require("../../config/db");

/**
 * REGISTER
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists in DB
    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await hashPassword(password);

    const result = await db.query(
      `INSERT INTO users (name, email, password, dass_completed, ai_consent)
       VALUES ($1, $2, $3, FALSE, NULL)
       RETURNING id, name, email, dass_completed, ai_consent`,
      [name, email, hashedPassword]
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser);

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        dass_completed: newUser.dass_completed,
        ai_consent: newUser.ai_consent,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
}

/**
 * LOGIN
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dass_completed: user.dass_completed,
        ai_consent: user.ai_consent,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
}

/**
 * GET /api/auth/me
 * Returns current user with latest onboarding state
 */
async function getMe(req, res) {
  try {
    const result = await db.query(
      "SELECT id, name, email, dass_completed, ai_consent FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * PATCH /api/auth/consent
 * Saves user AI consent choice
 */
async function saveConsent(req, res) {
  try {
    const { ai_consent } = req.body;

    if (typeof ai_consent !== "boolean") {
      return res.status(400).json({ message: "ai_consent must be a boolean" });
    }

    const result = await db.query(
      "UPDATE users SET ai_consent = $1 WHERE id = $2 RETURNING id, name, email, dass_completed, ai_consent",
      [ai_consent, req.user.id]
    );

    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Consent error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { register, login, getMe, saveConsent };
