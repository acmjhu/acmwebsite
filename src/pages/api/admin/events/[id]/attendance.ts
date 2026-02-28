import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const config = {
  api: { bodyParser: { sizeLimit: "4mb" } },
};

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

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const { fileData, fileName } = req.body;
  if (!fileData || typeof fileData !== "string") {
    return res.status(400).json({ error: "File data is required (base64)" });
  }

  let emails: string[];
  try {
    emails = parseEmails(fileData, fileName);
  } catch {
    return res
      .status(400)
      .json({ error: "Could not parse file. Upload a CSV or Excel file with an 'email' column." });
  }

  if (emails.length === 0) {
    return res.status(400).json({ error: "No email addresses found in file" });
  }

  const result = await prisma.eventSignup.updateMany({
    where: {
      eventId: id,
      email: { in: emails },
    },
    data: { attended: true },
  });

  return res.json({
    matched: result.count,
    totalEmails: emails.length,
  });
}

function parseEmails(base64Data: string, fileName?: string): string[] {
  const buffer = Buffer.from(base64Data, "base64");

  const workbook = XLSX.read(buffer, {
    type: "buffer",
    ...(fileName?.endsWith(".csv") ? { raw: true } : {}),
  });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  const emailKey = findEmailKey(rows[0]);
  if (!emailKey) {
    throw new Error("No email column found");
  }

  return rows
    .map((row) => String(row[emailKey] ?? "").trim().toLowerCase())
    .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
}

function findEmailKey(
  row: Record<string, unknown> | undefined,
): string | null {
  if (!row) return null;
  for (const key of Object.keys(row)) {
    if (key.toLowerCase().includes("email")) return key;
  }
  return null;
}
