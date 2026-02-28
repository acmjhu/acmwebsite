import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth";

export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<boolean> {
  const session = await auth(req, res);
  if (!session?.user) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}
