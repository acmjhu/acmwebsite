import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { title, content } = req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (title.length > 255) {
      return res.status(400).json({ error: "Title must be 255 characters or fewer" });
    }

    if (content !== undefined && content !== null && typeof content !== "string") {
      return res.status(400).json({ error: "Content must be a string" });
    }

    try {
      const announcement = await prisma.announcement.create({
        data: {
          title: title.trim(),
          content: content?.trim() || null,
        },
      });
      return res.status(201).json(announcement);
    } catch {
      return res.status(500).json({ error: "Failed to create announcement" });
    }
  }

  res.setHeader("Allow", "POST");
  return res.status(405).json({ error: "Method not allowed" });
}
