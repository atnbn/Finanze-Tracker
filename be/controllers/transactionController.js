import { pool } from "../db.js";

export async function createTransaction(req, res) {
  try {
    const { amount, title, type, category } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }

    if (typeof amount !== "number" || Number.isNaN(amount)) {
      return res.status(400).json({ error: "Amount must be a number" });
    }

    if (!["income", "expense"].includes(type)) {
      return res
        .status(400)
        .json({ error: "Type must be either income or expense" });
    }

    if (!category || typeof category !== "string") {
      return res.status(400).json({ error: "Category is required" });
    }

    const result = await pool.query(
      `INSERT INTO transactions (user_id, title, amount, type, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, title, amount, type, category`,
      [userId, title.trim(), amount, type, category.trim()],
    );

    return res.status(201).json({ transaction: result.rows[0] });
  } catch (error) {
    console.error("Create transaction failed:", error);
    return res.status(500).json({ error: "Failed to create transaction" });
  }
}

export async function getTransactions(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const result = await pool.query(
      `SELECT id, title, amount, type, category FROM transactions WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );

    return res.status(200).json({ transactions: result.rows });
  } catch (error) {
    console.error("Get transactions failed:", error);
    return res.status(500).json({ error: "Failed to retrieve transactions" });
  }
}

export async function getBalance(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const result = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS total_expense
       FROM transactions
       WHERE user_id = $1`,
      [userId],
    );

    const { total_income, total_expense } = result.rows[0];
    const balance = total_income - total_expense;

    return res.status(200).json({ balance, total_income, total_expense });
  } catch (error) {
    console.error("Get balance failed:", error);
    return res.status(500).json({ error: "Failed to retrieve balance" });
  }
}

export async function editTransaction(req, res) {
  try {
    const { id } = req.params;
    const { title, amount, type, category } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }

    if (typeof amount !== "number" || Number.isNaN(amount)) {
      return res.status(400).json({ error: "Amount must be a number" });
    }

    if (!["income", "expense"].includes(type)) {
      return res
        .status(400)
        .json({ error: "Type must be either income or expense" });
    }

    if (!category || typeof category !== "string") {
      return res.status(400).json({ error: "Category is required" });
    }

    const result = await pool.query(
      `UPDATE transactions
       SET title = $1, amount = $2, type = $3, category = $4
       WHERE id = $5 AND user_id = $6
       RETURNING id, title, amount, type, category`,
      [title.trim(), amount, type, category.trim(), id, userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.status(200).json({ transaction: result.rows[0] });
  } catch (error) {
    console.error("Edit transaction failed:", error);
    return res.status(500).json({ error: "Failed to edit transaction" });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const result = await pool.query(
      `DELETE FROM transactions WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res
      .status(200)
      .json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction failed:", error);
    return res.status(500).json({ error: "Failed to delete transaction" });
  }
}
