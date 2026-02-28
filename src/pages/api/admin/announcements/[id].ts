import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid announcement ID" });
  }

  if (req.method === "PUT") {
    const { title, content, isActive } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ error: "Title must be a non-empty string" });
      }
      if (title.length > 255) {
        return res.status(400).json({ error: "Title must be 255 characters or fewer" });
      }
    }

    if (content !== undefined && content !== null && typeof content !== "string") {
      return res.status(400).json({ error: "Content must be a string" });
    }

    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive must be a boolean" });
    }

    try {
      const data: Record<string, unknown> = {};
      if (title !== undefined) data.title = title.trim();
      if (content !== undefined) data.content = content?.trim() || null;
      if (isActive !== undefined) data.isActive = isActive;

      const announcement = await prisma.announcement.update({
        where: { id },
        data,
      });
      return res.status(200).json(announcement);
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2025"
      ) {
        return res.status(404).json({ error: "Announcement not found" });
      }
      return res.status(500).json({ error: "Failed to update announcement" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.announcement.delete({ where: { id } });
      return res.status(200).json({ success: true });
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2025"
      ) {
        return res.status(404).json({ error: "Announcement not found" });
      }
      return res.status(500).json({ error: "Failed to delete announcement" });
    }
  }

  res.setHeader("Allow", "PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
