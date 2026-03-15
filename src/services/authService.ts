import bcrypt from "bcrypt";
import prisma from "../prisma/client";

const SALT_ROUNDS = 10;

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("Email already in use");
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      avatar: input.avatar
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      online: true,
      createdAt: true
    }
  });

  return user;
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await bcrypt.compare(input.password, user.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    online: user.online,
    createdAt: user.createdAt
  };
}