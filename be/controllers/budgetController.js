import { pool } from "../db.js";

const getCurrentPeriod = () => {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

export async function getCurrentMonthBudgets(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { month, year } = getCurrentPeriod();

    const result = await pool.query(
      `SELECT
         b.id,
         b.category,
         b.limit_amount,
         b.month,
         b.year,
         COALESCE(tx.spent, 0) AS spent
       FROM budgets b
       LEFT JOIN (
         SELECT
           category,
           SUM(amount) AS spent
         FROM transactions
         WHERE user_id = $1
           AND type = 'expense'
           AND EXTRACT(MONTH FROM created_at) = $2
           AND EXTRACT(YEAR FROM created_at) = $3
         GROUP BY category
       ) tx ON tx.category = b.category
       WHERE b.user_id = $1
         AND b.month = $2
         AND b.year = $3
       ORDER BY b.category ASC`,
      [userId, month, year],
    );

    return res.status(200).json({
      budgets: result.rows,
      month,
      year,
    });
  } catch (error) {
    console.error("Get budgets failed:", error);
    return res.status(500).json({ error: "Failed to retrieve budgets" });
  }
}

export async function upsertBudget(req, res) {
  try {
    const userId = req.user?.id;
    const { category, limitAmount } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!category || typeof category !== "string") {
      return res.status(400).json({ error: "Category is required" });
    }

    if (
      typeof limitAmount !== "number" ||
      Number.isNaN(limitAmount) ||
      limitAmount <= 0
    ) {
      return res
        .status(400)
        .json({ error: "Limit amount must be a positive number" });
    }

    const { month, year } = getCurrentPeriod();

    const result = await pool.query(
      `INSERT INTO budgets (user_id, category, limit_amount, month, year)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, category, month, year)
       DO UPDATE SET limit_amount = EXCLUDED.limit_amount
       RETURNING id, category, limit_amount, month, year`,
      [userId, category.trim(), limitAmount, month, year],
    );

    return res.status(200).json({ budget: result.rows[0] });
  } catch (error) {
    console.error("Upsert budget failed:", error);
    return res.status(500).json({ error: "Failed to save budget" });
  }
}

export async function deleteBudget(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const budgetId = Number(id);

    if (!Number.isInteger(budgetId) || budgetId <= 0) {
      return res.status(400).json({ error: "A valid budget id is required" });
    }

    const result = await pool.query(
      `DELETE FROM budgets
       WHERE id = $1 AND user_id = $2`,
      [budgetId, userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Budget not found" });
    }

    return res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Delete budget failed:", error);
    return res.status(500).json({ error: "Failed to delete budget" });
  }
}
