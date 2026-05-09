import argon2 from "argon2";
import { pool } from "../db.js";
import { getExchangeRate } from "../utils/currencyConverter.js";
import { getClearAuthCookieOptions } from "../utils/token.js";

const ALLOWED_CURRENCIES = new Set(["USD", "EUR", "CHF"]);
const ALLOWED_THEMES = new Set(["light", "dark", "system"]);
const ALLOWED_START_PAGES = new Set([
  "home",
  "transaction",
  "analytics",
  "budget",
]);
const ALLOWED_EXPENSE_CATEGORIES = new Set([
  "food",
  "transport",
  "entertainment",
  "shopping",
  "other",
]);

const DEFAULT_SETTINGS = {
  displayName: "",
  currency: "USD",
  theme: "system",
  startPage: "home",
  defaultExpenseCategory: "food",
  warningThreshold: 80,
  resetDay: 1,
  alertsEnabled: true,
};

function mapSettingsRow(row) {
  return {
    profile: {
      displayName: row.display_name ?? DEFAULT_SETTINGS.displayName,
      email: row.email,
    },
    preferences: {
      currency: row.currency ?? DEFAULT_SETTINGS.currency,
      theme: row.theme ?? DEFAULT_SETTINGS.theme,
      startPage: row.start_page ?? DEFAULT_SETTINGS.startPage,
      defaultExpenseCategory:
        row.default_expense_category ?? DEFAULT_SETTINGS.defaultExpenseCategory,
    },
    budgetSettings: {
      warningThreshold:
        row.warning_threshold ?? DEFAULT_SETTINGS.warningThreshold,
      resetDay: row.reset_day ?? DEFAULT_SETTINGS.resetDay,
      alertsEnabled: row.alerts_enabled ?? DEFAULT_SETTINGS.alertsEnabled,
    },
  };
}

function validateSettingsInput({ profile, preferences, budgetSettings }) {
  if (!profile || !preferences || !budgetSettings) {
    return "Profile, preferences, and budget settings are required";
  }

  if (typeof profile.email !== "string" || !profile.email.trim()) {
    return "A valid email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(profile.email.trim())) {
    return "Invalid email format";
  }

  if (profile.displayName != null && typeof profile.displayName !== "string") {
    return "Display name must be a string";
  }

  if (!ALLOWED_CURRENCIES.has(preferences.currency)) {
    return "Unsupported currency";
  }

  if (!ALLOWED_THEMES.has(preferences.theme)) {
    return "Unsupported theme";
  }

  if (!ALLOWED_START_PAGES.has(preferences.startPage)) {
    return "Unsupported start page";
  }

  if (!ALLOWED_EXPENSE_CATEGORIES.has(preferences.defaultExpenseCategory)) {
    return "Unsupported default expense category";
  }

  if (
    typeof budgetSettings.warningThreshold !== "number" ||
    budgetSettings.warningThreshold < 1 ||
    budgetSettings.warningThreshold > 100
  ) {
    return "Warning threshold must be between 1 and 100";
  }

  if (
    typeof budgetSettings.resetDay !== "number" ||
    budgetSettings.resetDay < 1 ||
    budgetSettings.resetDay > 28
  ) {
    return "Reset day must be between 1 and 28";
  }

  if (typeof budgetSettings.alertsEnabled !== "boolean") {
    return "Alerts enabled must be a boolean";
  }

  return null;
}

async function convertStoredCurrencyAmounts(
  client,
  userId,
  fromCurrency,
  toCurrency,
) {
  if (fromCurrency === toCurrency) {
    return;
  }

  const exchangeRate = await getExchangeRate(fromCurrency, toCurrency);

  await client.query(
    `UPDATE transactions
     SET amount = ROUND((amount * $1::numeric), 2)
     WHERE user_id = $2`,
    [exchangeRate, userId],
  );

  await client.query(
    `UPDATE budgets
     SET limit_amount = ROUND((limit_amount * $1::numeric), 2)
     WHERE user_id = $2`,
    [exchangeRate, userId],
  );
}

export async function getSettings(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT
         u.email,
         us.display_name,
         us.currency,
         us.theme,
         us.start_page,
         us.default_expense_category,
         us.warning_threshold,
         us.reset_day,
         us.alerts_enabled
       FROM users u
       LEFT JOIN user_settings us ON us.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ settings: mapSettingsRow(rows[0]) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch settings" });
  }
}

export async function updateSettings(req, res) {
  const client = await pool.connect();

  try {
    const { profile, preferences, budgetSettings, security } = req.body;
    const validationError = validateSettingsInput({
      profile,
      preferences,
      budgetSettings,
    });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const email = profile.email.trim().toLowerCase();
    const displayName = (profile.displayName ?? "").trim();
    const currentPassword = security?.currentPassword?.trim() ?? "";
    const newPassword = security?.newPassword?.trim() ?? "";
    const confirmPassword = security?.confirmPassword?.trim() ?? "";
    const currentSettingsResult = await client.query(
      `SELECT COALESCE(currency, $2) AS currency
       FROM user_settings
       WHERE user_id = $1`,
      [req.user.id, DEFAULT_SETTINGS.currency],
    );
    const currentCurrency =
      currentSettingsResult.rows[0]?.currency ?? DEFAULT_SETTINGS.currency;

    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required" });
      }

      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ error: "New password must be at least 8 characters" });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }
    }

    await client.query("BEGIN");

    const existingEmail = await client.query(
      "SELECT id FROM users WHERE email = $1 AND id <> $2",
      [email, req.user.id],
    );

    if (existingEmail.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Email already exists" });
    }

    if (newPassword) {
      const currentUserResult = await client.query(
        "SELECT password FROM users WHERE id = $1",
        [req.user.id],
      );

      if (currentUserResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "User not found" });
      }

      const validPassword = await argon2.verify(
        currentUserResult.rows[0].password,
        currentPassword,
      );

      if (!validPassword) {
        await client.query("ROLLBACK");
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = await argon2.hash(newPassword);
      await client.query("UPDATE users SET password = $1 WHERE id = $2", [
        hashedPassword,
        req.user.id,
      ]);
    }

    await client.query("UPDATE users SET email = $1 WHERE id = $2", [
      email,
      req.user.id,
    ]);

    if (currentCurrency !== preferences.currency) {
      try {
        await convertStoredCurrencyAmounts(
          client,
          req.user.id,
          currentCurrency,
          preferences.currency,
        );
      } catch (error) {
        await client.query("ROLLBACK");
        console.error("Currency conversion failed:", error);
        return res.status(502).json({
          error:
            "The live exchange rate could not be loaded. Please try saving the currency again in a moment.",
        });
      }
    }

    await client.query(
      `INSERT INTO user_settings (
         user_id,
         display_name,
         currency,
         theme,
         start_page,
         default_expense_category,
         warning_threshold,
         reset_day,
         alerts_enabled
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id)
       DO UPDATE SET
         display_name = EXCLUDED.display_name,
         currency = EXCLUDED.currency,
         theme = EXCLUDED.theme,
         start_page = EXCLUDED.start_page,
         default_expense_category = EXCLUDED.default_expense_category,
         warning_threshold = EXCLUDED.warning_threshold,
         reset_day = EXCLUDED.reset_day,
         alerts_enabled = EXCLUDED.alerts_enabled,
         updated_at = NOW()`,
      [
        req.user.id,
        displayName,
        preferences.currency,
        preferences.theme,
        preferences.startPage,
        preferences.defaultExpenseCategory,
        budgetSettings.warningThreshold,
        budgetSettings.resetDay,
        budgetSettings.alertsEnabled,
      ],
    );

    const updatedSettings = await client.query(
      `SELECT
         u.email,
         us.display_name,
         us.currency,
         us.theme,
         us.start_page,
         us.default_expense_category,
         us.warning_threshold,
         us.reset_day,
         us.alerts_enabled
       FROM users u
       LEFT JOIN user_settings us ON us.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id],
    );

    await client.query("COMMIT");

    return res.json({
      message: "Settings updated successfully",
      settings: mapSettingsRow(updatedSettings.rows[0]),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ error: "Failed to update settings" });
  } finally {
    client.release();
  }
}

export async function deleteAccount(req, res) {
  const client = await pool.connect();

  try {
    const password = req.body?.password?.trim();

    if (!password) {
      return res.status(400).json({ error: "Current password is required" });
    }

    await client.query("BEGIN");

    const currentUserResult = await client.query(
      "SELECT password FROM users WHERE id = $1",
      [req.user.id],
    );

    if (currentUserResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "User not found" });
    }

    const validPassword = await argon2.verify(
      currentUserResult.rows[0].password,
      password,
    );

    if (!validPassword) {
      await client.query("ROLLBACK");
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    await client.query("DELETE FROM user_settings WHERE user_id = $1", [
      req.user.id,
    ]);
    await client.query("DELETE FROM budgets WHERE user_id = $1", [req.user.id]);
    await client.query("DELETE FROM transactions WHERE user_id = $1", [
      req.user.id,
    ]);
    await client.query("DELETE FROM users WHERE id = $1", [req.user.id]);

    await client.query("COMMIT");

    res.clearCookie("token", getClearAuthCookieOptions());

    return res.json({
      success: true,
      message: "Your account has been deleted.",
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => null);
    console.error(error);
    return res.status(500).json({ error: "Failed to delete account" });
  } finally {
    client.release();
  }
}
