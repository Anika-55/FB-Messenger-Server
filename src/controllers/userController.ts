import { Request, Response } from "express";
import {
  getUserById,
  getUserProfileById,
  listUsers,
  searchUsersByName,
  updateUserOnlineStatus
} from "../services/userService";

export async function getUsers(_req: Request, res: Response) {
  const users = await listUsers();
  return res.status(200).json({ users });
}

export async function getUser(req: Request, res: Response) {
  const { id } = req.params;
  const user = await getUserById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({ user });
}

export async function searchUsers(req: Request, res: Response) {
  const q = String(req.query.q ?? "").trim();
  if (!q) {
    return res.status(400).json({ message: "q query param is required" });
  }

  const users = await searchUsersByName(q);
  return res.status(200).json({ users });
}

export async function getMe(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await getUserProfileById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({ user });
}

export async function updateOnlineStatus(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { online } = req.body as { online?: boolean };
  if (typeof online !== "boolean") {
    return res.status(400).json({ message: "online must be boolean" });
  }

  const user = await updateUserOnlineStatus(userId, online);
  return res.status(200).json({ user });
}
