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
    return res.status(400).json({ error: "Invalid officer ID" });
  }

  if (req.method === "PUT") {
    const { name, role, bio, email, linkedin, imageUrl, termStart, termEnd } =
      req.body;

    if (!name || !role) {
      return res.status(400).json({ error: "Name and role are required" });
    }
    if (typeof name !== "string" || name.length > 255) {
      return res.status(400).json({ error: "Invalid name" });
    }
    if (typeof role !== "string" || role.length > 100) {
      return res.status(400).json({ error: "Invalid role" });
    }

    try {
      const officer = await prisma.officer.update({
        where: { id },
        data: {
          name: name.trim(),
          role: role.trim(),
          bio: bio?.trim() || null,
          email: email?.trim() || null,
          linkedin: linkedin?.trim() || null,
          imageUrl: imageUrl?.trim() || null,
          termStart: termStart ? new Date(termStart) : null,
          termEnd: termEnd ? new Date(termEnd) : null,
        },
      });

      return res.json(officer);
    } catch (err) {
      console.error("Update officer error:", err);
      return res.status(500).json({ error: "Failed to update officer" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.officer.delete({ where: { id } });
      return res.json({ success: true });
    } catch (err) {
      console.error("Delete officer error:", err);
      return res.status(500).json({ error: "Failed to delete officer" });
    }
  }

  if (req.method === "PATCH") {
    const { isCurrent, displayOrder } = req.body;

    const data: Record<string, unknown> = {};
    if (typeof isCurrent === "boolean") data.isCurrent = isCurrent;
    if (typeof displayOrder === "number") data.displayOrder = displayOrder;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    try {
      const officer = await prisma.officer.update({
        where: { id },
        data,
      });

      return res.json(officer);
    } catch (err) {
      console.error("Patch officer error:", err);
      return res.status(500).json({ error: "Failed to update officer" });
    }
  }

  res.setHeader("Allow", "PUT, DELETE, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}
