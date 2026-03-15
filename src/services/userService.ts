import prisma from "../prisma/client";

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      avatar: true,
      online: true
    }
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatar: true,
      online: true
    }
  });
}

export async function getUserProfileById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      online: true,
      createdAt: true
    }
  });
}

export async function updateUserOnlineStatus(id: string, online: boolean) {
  return prisma.user.update({
    where: { id },
    data: { online },
    select: {
      id: true,
      name: true,
      avatar: true,
      online: true
    }
  });
}

export async function searchUsersByName(query: string) {
  return prisma.user.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive"
      }
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      online: true
    }
  });
}
