import { Request, Response } from "express";
import { loginUser, registerUser } from "../services/authService";
import { signToken } from "../utils/jwt";

export async function register(req: Request, res: Response) {
  const { name, email, password, avatar } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    avatar?: string;
  };

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, and password are required" });
  }

  try {
    const user = await registerUser({ name, email, password, avatar });
    return res.status(201).json({ user });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const user = await loginUser({ email, password });
    const token = signToken({ userId: user.id, email: user.email });
    return res.status(200).json({ token, user });
  } catch (error) {
    return res.status(401).json({ message: (error as Error).message });
  }
}