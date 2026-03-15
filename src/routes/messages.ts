import { Router } from "express";
import { getMessages, postMessage, removeMessage } from "../controllers/messageController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/:conversationId", getMessages);
router.post("/", postMessage);
router.delete("/:id", removeMessage);

export default router;
