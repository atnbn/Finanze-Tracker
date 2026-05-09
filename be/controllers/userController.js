import { pool } from "../db.js";

export async function getUsers(req, res) {
  try {
    const result = await pool.query("SELECT * FROM devuser");
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database query failed" });
  }
}
