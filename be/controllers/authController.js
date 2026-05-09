import argon2 from "argon2";
import { pool } from "../db.js";
import {
  createAuthToken,
  getAuthCookieOptions,
  getClearAuthCookieOptions,
} from "../utils/token.js";
import {
  generateEmailVerificationToken,
  hashEmailVerificationToken,
  sendVerificationEmail,
} from "../utils/emailVerification.js";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  sendPasswordResetEmail,
} from "../utils/passwordReset.js";

const PASSWORD_MIN_LENGTH = 8;
const GENERIC_PASSWORD_RESET_MESSAGE =
  "If an account with that email exists, a password reset link has been sent.";

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : value;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createUser(req, res) {
  const client = await pool.connect();
  try {
    let { email, password, username } = req.body;

    email = normalizeEmail(email);
    if (typeof password === "string") password = password.trim();
    if (typeof username === "string") username = username.trim();

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        error: "Name, email, and password must be strings",
        type: typeof email,
      });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ error: "Invalid email format", type: typeof email });
    }

    const existing = await pool.query("SELECT 1 FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await argon2.hash(password);
    const { token, tokenHash, expiresAt } = generateEmailVerificationToken();

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO users (
         email,
         password,
         email_verified,
         email_verification_token_hash,
         email_verification_expires_at
       ) VALUES ($1, $2, FALSE, $3, $4)
       RETURNING id, email`,
      [email, hashedPassword, tokenHash, expiresAt],
    );

    if (username) {
      await client.query(
        `INSERT INTO user_settings (user_id, display_name)
         VALUES ($1, $2)
         ON CONFLICT (user_id)
         DO UPDATE SET
           display_name = EXCLUDED.display_name,
           updated_at = NOW()`,
        [result.rows[0].id, username],
      );
    }

    await sendVerificationEmail({
      email,
      displayName: username,
      token,
    });

    await client.query("COMMIT");

    return res.status(201).json({
      user: result.rows[0],
      message:
        "Account created. Please check your email and confirm your address before logging in.",
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => null);
    console.error(err);
    return res.status(500).json({ error: "Failed to create user" });
  } finally {
    client.release();
  }
}

export async function login(req, res) {
  try {
    let { email, password, rememberMe } = req.body;
    email = normalizeEmail(email);
    if (typeof password === "string") {
      password = password.trim();
    }

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        error: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const token = createAuthToken(
      { id: user.id, email: user.email },
      Boolean(rememberMe),
    );

    res.cookie("token", token, getAuthCookieOptions(Boolean(rememberMe)));

    return res.json({
      message: "Login successful",
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Login failed" });
  }
}

export function getMe(req, res) {
  return res.json({ user: req.user });
}

export function logout(req, res) {
  res.clearCookie("token", getClearAuthCookieOptions());
  return res.json({ success: true, message: "Logout successful" });
}

export async function forgotPassword(req, res) {
  try {
    let { email } = req.body;
    email = normalizeEmail(email);

    if (typeof email !== "string" || !email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const result = await pool.query(
      "SELECT id, email FROM users WHERE email = $1 LIMIT 1",
      [email],
    );

    if (result.rowCount > 0) {
      const user = result.rows[0];
      const { token, tokenHash, expiresAt } = generatePasswordResetToken();

      await pool.query(
        `UPDATE users
         SET password_reset_token_hash = $1,
             password_reset_expires_at = $2
         WHERE id = $3`,
        [tokenHash, expiresAt, user.id],
      );

      await sendPasswordResetEmail({
        email: user.email,
        token,
      });
    }

    return res.json({
      success: true,
      message: GENERIC_PASSWORD_RESET_MESSAGE,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to start password reset" });
  }
}

export async function resetPassword(req, res) {
  try {
    let { token, password, confirmPassword } = req.body;

    if (typeof token === "string") {
      token = token.trim();
    }
    if (typeof password === "string") {
      password = password.trim();
    }
    if (typeof confirmPassword === "string") {
      confirmPassword = confirmPassword.trim();
    }

    if (!token) {
      return res.status(400).json({ error: "Reset token is required" });
    }

    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({
        error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const tokenHash = hashPasswordResetToken(token);
    const result = await pool.query(
      `SELECT id
       FROM users
       WHERE password_reset_token_hash = $1
         AND password_reset_expires_at > NOW()
       LIMIT 1`,
      [tokenHash],
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        error: "This password reset link is invalid or has expired.",
      });
    }

    const hashedPassword = await argon2.hash(password);

    await pool.query(
      `UPDATE users
       SET password = $1,
           password_reset_token_hash = NULL,
           password_reset_expires_at = NULL
       WHERE id = $2`,
      [hashedPassword, result.rows[0].id],
    );

    res.clearCookie("token", getClearAuthCookieOptions());

    return res.json({
      success: true,
      message: "Your password has been reset. You can now log in.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to reset password" });
  }
}

export async function verifyEmail(req, res) {
  try {
    const rawToken = req.body?.token;

    if (typeof rawToken !== "string" || !rawToken.trim()) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    const tokenHash = hashEmailVerificationToken(rawToken.trim());
    const result = await pool.query(
      `SELECT id
       FROM users
       WHERE email_verification_token_hash = $1
         AND email_verified = FALSE
         AND email_verification_expires_at > NOW()
       LIMIT 1`,
      [tokenHash],
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        error: "This verification link is invalid or has expired.",
      });
    }

    await pool.query(
      `UPDATE users
       SET email_verified = TRUE,
           email_verified_at = NOW(),
           email_verification_token_hash = NULL,
           email_verification_expires_at = NULL
       WHERE id = $1`,
      [result.rows[0].id],
    );

    return res.json({
      success: true,
      message: "Your email has been verified. You can now log in.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Email verification failed" });
  }
}
