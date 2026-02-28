import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await getToken({
    req: { headers: req.headers as Record<string, string> },
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const submissions = await prisma.contactSubmission.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(submissions);
    } catch {
      return res.status(500).json({ error: "Failed to fetch submissions" });
    }
  }

  if (req.method === "PATCH") {
    const { id, isRead } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "id is required" });
    }

    if (typeof isRead !== "boolean") {
      return res.status(400).json({ error: "isRead must be a boolean" });
    }

    try {
      await prisma.contactSubmission.update({
        where: { id },
        data: { isRead },
      });
      return res.status(200).json({ success: true });
    } catch {
      return res.status(500).json({ error: "Failed to update submission" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
