import { Request, Response } from "express";
import {
  createConversation,
  getConversationById,
  listConversationsForUser,
  leaveConversation,
  markConversationSeen,
  updateConversationAvatar
} from "../services/conversationService";

export async function getConversations(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const conversations = await listConversationsForUser(userId);
  return res.status(200).json({ conversations });
}

export async function postConversation(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { participantIds, name, avatar } = req.body as {
    participantIds?: string[];
    name?: string;
    avatar?: string;
  };
  if (!participantIds || participantIds.length === 0) {
    return res.status(400).json({ message: "participantIds is required" });
  }

  const conversation = await createConversation(userId, participantIds, { name, avatar });
  return res.status(201).json({ conversation });
}

export async function getConversation(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const conversationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!conversationId) {
    return res.status(400).json({ message: "conversation id is required" });
  }
  const conversation = await getConversationById(conversationId, userId);

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  return res.status(200).json({ conversation });
}

export async function markSeen(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const conversationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!conversationId) {
    return res.status(400).json({ message: "conversation id is required" });
  }
  const conversation = await markConversationSeen(conversationId, userId);

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  return res.status(200).json({ conversation });
}

export async function setAvatar(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const conversationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!conversationId) {
    return res.status(400).json({ message: "conversation id is required" });
  }
  const { avatar } = req.body as { avatar?: string };

  if (!avatar || !avatar.trim()) {
    return res.status(400).json({ message: "avatar is required" });
  }

  const conversation = await updateConversationAvatar(conversationId, userId, avatar.trim());
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  return res.status(200).json({ conversation });
}

export async function leave(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const conversationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!conversationId) {
    return res.status(400).json({ message: "conversation id is required" });
  }
  const conversation = await leaveConversation(conversationId, userId);

  if (!conversation) {
    return res.status(200).json({ conversation: null });
  }

  return res.status(200).json({ conversation });
}
