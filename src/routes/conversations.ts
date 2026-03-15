import { Router } from "express";
import {
  getConversation,
  getConversations,
  markSeen,
  postConversation,
  leave,
  setAvatar
} from "../controllers/conversationController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getConversations);
router.post("/", postConversation);
router.post("/:id/seen", markSeen);
router.patch("/:id/avatar", setAvatar);
router.post("/:id/leave", leave);
router.get("/:id", getConversation);

export default router;
