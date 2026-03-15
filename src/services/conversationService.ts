import prisma from "../prisma/client";

export async function listConversationsForUser(userId: string) {
  const links = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true }
  });

  const conversationIds = links.map((link) => link.conversationId);
  if (conversationIds.length === 0) {
    return [];
  }

  const conversations = await prisma.conversation.findMany({
    where: { id: { in: conversationIds } },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true, online: true }
          }
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  const enriched = await Promise.all(
    conversations.map(async (conversation) => {
      const [lastMessage, unreadCount] = await Promise.all([
        prisma.message.findFirst({
          where: { conversationId: conversation.id },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            conversationId: true,
            senderId: true,
            text: true,
            imageUrl: true,
            deletedAt: true,
            status: true,
            createdAt: true
          }
        }),
        prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            status: { not: "seen" }
          }
        })
      ]);

      return {
        ...conversation,
        lastMessage,
        unreadCount
      };
    })
  );

  return enriched;
}

async function findOneToOneConversation(userA: string, userB: string) {
  const userAConversations = await prisma.conversationParticipant.findMany({
    where: { userId: userA },
    select: { conversationId: true }
  });
  const userBConversations = await prisma.conversationParticipant.findMany({
    where: { userId: userB },
    select: { conversationId: true }
  });

  const setA = new Set(userAConversations.map((c) => c.conversationId));
  const shared = userBConversations
    .map((c) => c.conversationId)
    .filter((id) => setA.has(id));

  if (shared.length === 0) {
    return null;
  }

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId: { in: shared } },
    select: { conversationId: true, userId: true }
  });

  const counts = new Map<string, Set<string>>();
  for (const entry of participants) {
    const set = counts.get(entry.conversationId) ?? new Set<string>();
    set.add(entry.userId);
    counts.set(entry.conversationId, set);
  }

  for (const [conversationId, users] of counts) {
    if (users.size === 2 && users.has(userA) && users.has(userB)) {
      return conversationId;
    }
  }

  return null;
}

export async function createConversation(
  initiatorId: string,
  participantIds: string[],
  input?: { name?: string; avatar?: string }
) {
  const uniqueIds = Array.from(new Set([initiatorId, ...participantIds]));

  if (uniqueIds.length === 2) {
    const existingId = await findOneToOneConversation(uniqueIds[0], uniqueIds[1]);
    if (existingId) {
      return prisma.conversation.findUnique({
        where: { id: existingId },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true, online: true }
              }
            }
          }
        }
      });
    }
  }

  const conversation = await prisma.conversation.create({
    data: {
      name: input?.name,
      avatar: input?.avatar
    },
    include: { participants: true }
  });

  await prisma.conversationParticipant.createMany({
    data: uniqueIds.map((userId) => ({
      conversationId: conversation.id,
      userId
    }))
  });

  return prisma.conversation.findUnique({
    where: { id: conversation.id },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true, online: true }
          }
        }
      }
    }
  });
}

export async function updateConversationAvatar(
  conversationId: string,
  userId: string,
  avatar: string
) {
  const membership = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
    select: { id: true }
  });

  if (!membership) {
    return null;
  }

  return prisma.conversation.update({
    where: { id: conversationId },
    data: { avatar },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true, online: true }
          }
        }
      }
    }
  });
}

export async function leaveConversation(conversationId: string, userId: string) {
  const membership = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
    select: { id: true }
  });

  if (!membership) {
    return null;
  }

  await prisma.conversationParticipant.delete({ where: { id: membership.id } });

  const remaining = await prisma.conversationParticipant.count({
    where: { conversationId }
  });

  if (remaining === 0) {
    await prisma.message.deleteMany({ where: { conversationId } });
    await prisma.conversation.delete({ where: { id: conversationId } });
    return null;
  }

  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true, online: true }
          }
        }
      }
    }
  });
}

export async function getConversationById(conversationId: string, userId: string) {
  const membership = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
    select: { id: true }
  });

  if (!membership) {
    return null;
  }

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      status: { in: ["sent", "delivered"] }
    },
    data: { status: "seen" }
  });

  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true, online: true }
          }
        }
      }
    }
  });
}

export async function markConversationSeen(conversationId: string, userId: string) {
  const membership = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
    select: { id: true }
  });

  if (!membership) {
    return null;
  }

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      status: { in: ["sent", "delivered"] }
    },
    data: { status: "seen" }
  });

  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true, online: true }
          }
        }
      }
    }
  });
}
