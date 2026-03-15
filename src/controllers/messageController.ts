import { Request, Response } from "express";
import { deleteMessage, getMessagesForConversation, sendMessage } from "../services/messageService";

export async function getMessages(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const conversationId = Array.isArray(req.params.conversationId)
    ? req.params.conversationId[0]
    : req.params.conversationId;
  if (!conversationId) {
    return res.status(400).json({ message: "conversationId is required" });
  }

  const pageParam = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
  const limitParam = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
  const cursorParam = Array.isArray(req.query.cursor) ? req.query.cursor[0] : req.query.cursor;
  const page = pageParam ? Number(pageParam) : undefined;
  const limit = limitParam ? Number(limitParam) : undefined;
  const cursor = cursorParam ? String(cursorParam) : undefined;

  try {
    const result = await getMessagesForConversation({
      conversationId,
      userId,
      page,
      limit,
      cursor
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: (error as Error).message });
  }
}

export async function postMessage(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { conversationId, text, imageUrl, replyToId, forwardFromId } = req.body as {
    conversationId?: string;
    text?: string;
    imageUrl?: string;
    replyToId?: string;
    forwardFromId?: string;
  };

  const trimmedText = text?.trim();
  const trimmedImageUrl = imageUrl?.trim();

  if (!conversationId || (!trimmedText && !trimmedImageUrl)) {
    return res
      .status(400)
      .json({ message: "conversationId and either text or imageUrl are required" });
  }

  try {
    const message = await sendMessage({
      conversationId,
      userId,
      text: trimmedText || undefined,
      imageUrl: trimmedImageUrl || undefined,
      replyToId,
      forwardFromId
    });

    return res.status(201).json({ message });
  } catch (error) {
    return res.status(404).json({ message: (error as Error).message });
  }
}

export async function removeMessage(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const messageId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!messageId) {
    return res.status(400).json({ message: "message id is required" });
  }

  try {
    const message = await deleteMessage(messageId, userId);
    return res.status(200).json({ message });
  } catch (error) {
    const messageText = (error as Error).message;
    const status = messageText === "Not allowed" ? 403 : 404;
    return res.status(status).json({ message: messageText });
  }
}
