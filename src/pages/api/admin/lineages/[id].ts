import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Auth is enforced by middleware (see middleware.ts matcher: /api/admin/:path*)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  if (req.method === "PUT") {
    const { name, treeName, role, graduationYear, mentorId, imageUrl } =
      req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (name.length > 255) {
      return res.status(400).json({ error: "Name too long" });
    }
    if (mentorId === id) {
      return res
        .status(400)
        .json({ error: "A member cannot be their own mentor" });
    }

    try {
      const member = await prisma.lineageMember.update({
        where: { id },
        data: {
          name: name.trim(),
          treeName: treeName?.trim() || null,
          role: role?.trim() || null,
          graduationYear: graduationYear ? parseInt(graduationYear) : null,
          mentorId: mentorId || null,
          imageUrl: imageUrl?.trim() || null,
        },
      });
      return res.json(member);
    } catch (err) {
      console.error("Update lineage member error:", err);
      return res.status(500).json({ error: "Failed to update lineage member" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.lineageMember.delete({ where: { id } });
      return res.json({ success: true });
    } catch (err: unknown) {
      // Prisma P2003: foreign key — member still has mentees pointing to them
      if (
        err instanceof Error &&
        "code" in err &&
        (err as { code: string }).code === "P2003"
      ) {
        return res.status(409).json({
          error:
            "Cannot delete a member who has mentees. Remove or reassign their mentees first.",
        });
      }
      console.error("Delete lineage member error:", err);
      return res.status(500).json({ error: "Failed to delete lineage member" });
    }
  }

  res.setHeader("Allow", "PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
