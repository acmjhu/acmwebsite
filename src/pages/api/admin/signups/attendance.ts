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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { eventId, csvContent } = req.body;

  if (!eventId || typeof eventId !== "string") {
    return res.status(400).json({ error: "eventId is required" });
  }

  if (!csvContent || typeof csvContent !== "string") {
    return res.status(400).json({ error: "csvContent is required" });
  }

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const lines = csvContent.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      return res.status(400).json({ error: "CSV must have a header and at least one row" });
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const emailIndex = headers.indexOf("email");
    if (emailIndex === -1) {
      return res.status(400).json({ error: "CSV must have an 'email' column" });
    }

    const emails = lines
      .slice(1)
      .map((line) => {
        const cols = line.split(",");
        return cols[emailIndex]?.trim().toLowerCase();
      })
      .filter((e): e is string => !!e && e.includes("@"));

    if (emails.length === 0) {
      return res.status(400).json({ error: "No valid emails found in CSV" });
    }

    const result = await prisma.eventSignup.updateMany({
      where: {
        eventId,
        email: { in: emails },
      },
      data: { attended: true },
    });

    return res.status(200).json({ updated: result.count });
  } catch {
    return res.status(500).json({ error: "Failed to process attendance" });
  }
}
