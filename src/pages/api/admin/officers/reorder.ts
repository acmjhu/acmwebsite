import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await getToken({ req: req as unknown as Request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { order } = req.body;
  if (
    !Array.isArray(order) ||
    !order.every((item) => typeof item === "string")
  ) {
    return res
      .status(400)
      .json({ error: "order must be an array of officer IDs" });
  }

  try {
    await prisma.$transaction(
      order.map((id: string, index: number) =>
        prisma.officer.update({
          where: { id },
          data: { displayOrder: index },
        }),
      ),
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Reorder officers error:", err);
    return res.status(500).json({ error: "Failed to reorder officers" });
  }
}
