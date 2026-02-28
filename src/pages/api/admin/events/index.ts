import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === "GET") {
    const events = await prisma.event.findMany({
      orderBy: { startTime: "desc" },
      include: { signups: { select: { id: true } } },
    });

    return res.json(
      events.map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description,
        location: e.location,
        category: e.category,
        link: e.link,
        startTime: e.startTime.toISOString(),
        endTime: e.endTime.toISOString(),
        signupCount: e.signups.length,
      })),
    );
  }

  if (req.method === "POST") {
    const { name, description, location, category, link, startTime, endTime } =
      req.body;

    if (!name || !category || !startTime || !endTime) {
      return res
        .status(400)
        .json({ error: "Name, category, start time, and end time are required" });
    }

    if (new Date(endTime) <= new Date(startTime)) {
      return res
        .status(400)
        .json({ error: "End time must be after start time" });
    }

    const event = await prisma.event.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        category: category.trim(),
        link: link?.trim() || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return res.status(201).json(event);
  }

  if (req.method === "PUT") {
    const { id, name, description, location, category, link, startTime, endTime } =
      req.body;

    if (!id) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    if (!name || !category || !startTime || !endTime) {
      return res
        .status(400)
        .json({ error: "Name, category, start time, and end time are required" });
    }

    if (new Date(endTime) <= new Date(startTime)) {
      return res
        .status(400)
        .json({ error: "End time must be after start time" });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        category: category.trim(),
        link: link?.trim() || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return res.json(event);
  }

  if (req.method === "DELETE") {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    await prisma.event.delete({ where: { id } });
    return res.json({ success: true });
  }

  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
