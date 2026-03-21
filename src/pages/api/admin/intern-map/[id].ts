import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ error: "Invalid id" });

  if (req.method === "PATCH") {
    const { status, name, company, role, term, year, lat, lng, contact } = req.body;

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (name !== undefined) data.name = String(name).trim();
    if (company !== undefined) data.company = String(company).trim();
    if (role !== undefined) data.role = String(role).trim();
    if (term !== undefined) data.term = String(term).trim();
    if (year !== undefined) data.year = String(year).trim();
    if (lat !== undefined) data.lat = parseFloat(lat);
    if (lng !== undefined) data.lng = parseFloat(lng);
    if (contact !== undefined) data.contact = contact ? String(contact).trim() : null;

    try {
      const entry = await prisma.internMapEntry.update({
        where: { id },
        data,
      });
      return res.status(200).json({ ...entry, createdAt: entry.createdAt.toISOString(), updatedAt: entry.updatedAt.toISOString() });
    } catch {
      return res.status(404).json({ error: "Entry not found" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.internMapEntry.delete({ where: { id } });
      return res.status(204).end();
    } catch {
      return res.status(404).json({ error: "Entry not found" });
    }
  }

  res.setHeader("Allow", "PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
