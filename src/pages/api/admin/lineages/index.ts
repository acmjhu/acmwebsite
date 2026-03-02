import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Auth is enforced by middleware (see middleware.ts matcher: /api/admin/:path*)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    try {
      const members = await prisma.lineageMember.findMany({
        orderBy: [{ treeName: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          treeName: true,
          role: true,
          graduationYear: true,
          mentorId: true,
          imageUrl: true,
        },
      });
      return res.json(members);
    } catch (err) {
      console.error("List lineage members error:", err);
      return res.status(500).json({ error: "Failed to fetch lineage members" });
    }
  }

  if (req.method === "POST") {
    const { name, treeName, role, graduationYear, mentorId, imageUrl } =
      req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (name.length > 255) {
      return res.status(400).json({ error: "Name too long" });
    }

    try {
      const member = await prisma.lineageMember.create({
        data: {
          name: name.trim(),
          treeName: treeName?.trim() || null,
          role: role?.trim() || null,
          graduationYear: graduationYear ? parseInt(graduationYear) : null,
          mentorId: mentorId || null,
          imageUrl: imageUrl?.trim() || null,
        },
      });
      return res.status(201).json(member);
    } catch (err) {
      console.error("Create lineage member error:", err);
      return res.status(500).json({ error: "Failed to create lineage member" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
