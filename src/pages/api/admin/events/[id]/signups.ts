import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, format } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      signups: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  if (format === "csv") {
    const header = "Name,Email,Attended,Signed Up At";
    const rows = event.signups.map(
      (s) =>
        `"${s.name.replace(/"/g, '""')}","${s.email}",${s.attended ? "Yes" : "No"},"${s.createdAt.toISOString()}"`,
    );
    const csv = [header, ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${event.name.replace(/[^a-zA-Z0-9 ]/g, "")}-signups.csv"`,
    );
    return res.send(csv);
  }

  return res.json({
    event: {
      id: event.id,
      name: event.name,
    },
    signups: event.signups.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      attended: s.attended,
      createdAt: s.createdAt.toISOString(),
    })),
  });
}
