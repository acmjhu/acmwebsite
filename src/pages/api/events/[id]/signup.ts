import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  if (typeof name !== "string" || typeof email !== "string") {
    return res.status(400).json({ error: "Name and email must be strings" });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (new Date(event.endTime) < new Date()) {
      return res.status(400).json({ error: "This event has already ended" });
    }

    await prisma.eventSignup.create({
      data: {
        eventId: id,
        name: name.trim(),
        email: trimmedEmail,
      },
    });

    return res.status(201).json({ message: "Signed up successfully" });
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return res
        .status(409)
        .json({ error: "You are already signed up for this event" });
    }
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
