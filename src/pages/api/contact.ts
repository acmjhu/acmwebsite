import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (typeof name !== "string" || name.length > 255) {
    return res.status(400).json({ error: "Invalid name" });
  }

  if (
    typeof email !== "string" ||
    email.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (typeof message !== "string" || message.length > 5000) {
    return res.status(400).json({ error: "Message is too long" });
  }

  try {
    await prisma.contactSubmission.create({
      data: { name: name.trim(), email: email.trim(), message: message.trim() },
    });

    return res.status(201).json({ success: true });
  } catch {
    return res.status(500).json({ error: "Failed to submit message" });
  }
}
