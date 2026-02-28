import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Auth is enforced by middleware (see middleware.ts matcher: /api/admin/:path*)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

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
    const maxOrder = await prisma.officer.aggregate({
      _max: { displayOrder: true },
    });

    const officer = await prisma.officer.create({
      data: {
        name: name.trim(),
        role: role.trim(),
        bio: bio?.trim() || null,
        email: email?.trim() || null,
        linkedin: linkedin?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        termStart: termStart ? new Date(termStart) : null,
        termEnd: termEnd ? new Date(termEnd) : null,
        isCurrent: true,
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
      },
    });

    return res.status(201).json(officer);
  } catch (err) {
    console.error("Create officer error:", err);
    return res.status(500).json({ error: "Failed to create officer" });
  }
}
