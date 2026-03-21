import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export const config = {
  api: { bodyParser: { sizeLimit: "4mb" } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, company, role, term, year, lat, lng, contact, photoUrl } = req.body;

  if (!name || !email || !company || !role || !term || !year || lat == null || lng == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!email.endsWith("@jhu.edu") && !email.endsWith("@jhmi.edu") && !email.endsWith("@jh.edu")) {
    return res.status(400).json({ error: "Must use a JHU email address" });
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  try {
    const entry = await prisma.internMapEntry.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        company: String(company).trim(),
        role: String(role).trim(),
        term: String(term).trim(),
        year: String(year).trim(),
        lat: latNum,
        lng: lngNum,
        contact: contact ? String(contact).trim() : null,
        photoUrl: photoUrl || null,
        status: "pending",
      },
    });

    return res.status(201).json({ id: entry.id });
  } catch (err) {
    console.error("InternMap submit error:", err);
    return res.status(500).json({ error: "Failed to submit" });
  }
}
