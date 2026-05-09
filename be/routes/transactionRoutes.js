import { Router } from "express";
import {
  createTransaction,
  getTransactions,
  getBalance,
  editTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/addTransaction", authMiddleware, createTransaction);
router.get("/getTransactions", authMiddleware, getTransactions);
router.get("/getBalance", authMiddleware, getBalance);
router.put("/editTransaction/:id", authMiddleware, editTransaction);
router.delete("/deleteTransaction/:id", authMiddleware, deleteTransaction);
export default router;
