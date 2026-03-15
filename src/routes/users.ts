import { Router } from "express";
import {
  getMe,
  getUser,
  getUsers,
  searchUsers,
  updateOnlineStatus
} from "../controllers/userController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/search", searchUsers);
router.get("/me", requireAuth, getMe);
router.patch("/me/online", requireAuth, updateOnlineStatus);
router.get("/", getUsers);
router.get("/:id", getUser);

export default router;
