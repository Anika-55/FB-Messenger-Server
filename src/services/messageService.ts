import prisma from "../prisma/client";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function normalizePage(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_PAGE;
  }
  return Math.floor(parsed);
}

function normalizeLimit(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.floor(parsed), MAX_LIMIT);
}

async function assertMembership(conversationId: string, userId: string) {
  const membership = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
    select: { id: true }
  });

  if (!membership) {
    throw new Error("Conversation not found");
  }
}

async function assertMessageAccess(messageId: string, userId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { id: true, conversationId: true, senderId: true, text: true, imageUrl: true }
  });

  if (!message) {
    throw new Error("Message not found");
  }

  await assertMembership(message.conversationId, userId);

  return message;
}

const baseMessageSelect = {
  id: true,
  conversationId: true,
  senderId: true,
  text: true,
  imageUrl: true,
  status: true,
  deletedAt: true,
  createdAt: true,
  replyTo: {
    select: {
      id: true,
      senderId: true,
      text: true,
      imageUrl: true,
      deletedAt: true
    }
  },
  forwardedFrom: {
    select: {
      id: true,
      senderId: true,
      text: true,
      imageUrl: true,
      deletedAt: true
    }
  }
} as const;

export async function getMessagesForConversation(input: {
  conversationId: string;
  userId: string;
  page?: number;
  limit?: number;
  cursor?: string;
}) {
  await assertMembership(input.conversationId, input.userId);

  await prisma.message.updateMany({
    where: {
      conversationId: input.conversationId,
      senderId: { not: input.userId },
      status: "sent"
    },
    data: { status: "delivered" }
  });

  if (input.cursor) {
    const limit = normalizeLimit(input.limit);
    const messages = await prisma.message.findMany({
      where: { conversationId: input.conversationId },
      orderBy: { createdAt: "desc" },
      cursor: { id: input.cursor },
      skip: 1,
      take: limit + 1,
      select: baseMessageSelect
    });

    const hasMore = messages.length > limit;
    const sliced = hasMore ? messages.slice(0, limit) : messages;
    const ordered = sliced.reverse();
    const nextCursor = ordered.length > 0 ? ordered[0].id : null;

    return {
      cursor: input.cursor,
      limit,
      hasMore,
      nextCursor,
      messages: ordered
    };
  }

  const page = normalizePage(input.page);
  const limit = normalizeLimit(input.limit);
  const skip = (page - 1) * limit;

  const [total, messages] = await Promise.all([
    prisma.message.count({ where: { conversationId: input.conversationId } }),
    prisma.message.findMany({
      where: { conversationId: input.conversationId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: baseMessageSelect
    })
  ]);

  return {
    page,
    limit,
    total,
    hasMore: page * limit < total,
    messages: messages.reverse()
  };
}

export async function sendMessage(input: {
  conversationId: string;
  userId: string;
  text?: string;
  imageUrl?: string;
  replyToId?: string;
  forwardFromId?: string;
}) {
  await assertMembership(input.conversationId, input.userId);

  let forwardPayload: { text?: string; imageUrl?: string; forwardedFromId?: string } = {};
  if (input.forwardFromId) {
    const original = await assertMessageAccess(input.forwardFromId, input.userId);
    if (original.conversationId === input.conversationId) {
      forwardPayload = {
        text: original.text ?? undefined,
        imageUrl: original.imageUrl ?? undefined,
        forwardedFromId: original.id
      };
    } else {
      forwardPayload = {
        text: original.text ?? undefined,
        imageUrl: original.imageUrl ?? undefined,
        forwardedFromId: original.id
      };
    }
  }

  if (input.replyToId) {
    const replyTarget = await assertMessageAccess(input.replyToId, input.userId);
    if (replyTarget.conversationId !== input.conversationId) {
      throw new Error("Reply target is not in this conversation");
    }
  }

  if (!input.text && !input.imageUrl && !forwardPayload.text && !forwardPayload.imageUrl) {
    throw new Error("Message content is required");
  }

  const message = await prisma.message.create({
    data: {
      conversationId: input.conversationId,
      senderId: input.userId,
      text: input.text ?? forwardPayload.text,
      imageUrl: input.imageUrl ?? forwardPayload.imageUrl,
      replyToId: input.replyToId,
      forwardedFromId: forwardPayload.forwardedFromId,
      status: "sent"
    },
    select: baseMessageSelect
  });

  await prisma.conversation.update({
    where: { id: input.conversationId },
    data: { updatedAt: new Date() }
  });

  return message;
}

export async function deleteMessage(messageId: string, userId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { id: true, senderId: true, deletedAt: true }
  });

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.senderId !== userId) {
    throw new Error("Not allowed");
  }

  if (message.deletedAt) {
    return prisma.message.findUnique({
      where: { id: messageId },
      select: baseMessageSelect
    });
  }

  return prisma.message.update({
    where: { id: messageId },
    data: { deletedAt: new Date(), text: null, imageUrl: null },
    select: baseMessageSelect
  });
}
