import { Router } from "express";
import {
  deleteAccount,
  getSettings,
  updateSettings,
} from "../controllers/settingsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/settings", authMiddleware, getSettings);
router.put("/settings", authMiddleware, updateSettings);
router.delete("/settings/account", authMiddleware, deleteAccount);

export default router;
