import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const entries = await prisma.internMapEntry.findMany({
    where: { status: "approved" },
    select: {
      id: true,
      name: true,
      company: true,
      role: true,
      term: true,
      year: true,
      lat: true,
      lng: true,
      contact: true,
      photoUrl: true,
    },
  });

  return res.status(200).json(entries);
}
