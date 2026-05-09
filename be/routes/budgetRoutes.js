import { Router } from "express";
import {
  deleteBudget,
  getCurrentMonthBudgets,
  upsertBudget,
} from "../controllers/budgetController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/budgets/current-month", authMiddleware, getCurrentMonthBudgets);
router.post("/budgets", authMiddleware, upsertBudget);
router.delete("/budgets/:id", authMiddleware, deleteBudget);

export default router;
