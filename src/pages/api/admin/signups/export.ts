import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const secureCookie = req.headers["x-forwarded-proto"] === "https";
  const token = await getToken({
    req: { headers: req.headers as Record<string, string> },
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie,
  });
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const signups = await prisma.eventSignup.findMany({
      distinct: ["email"],
      select: { email: true },
      orderBy: { email: "asc" },
    });

    const csv = "email\n" + signups.map((s) => s.email).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=mailing-list.csv",
    );
    return res.status(200).send(csv);
  } catch {
    return res.status(500).json({ error: "Failed to export signups" });
  }
}
