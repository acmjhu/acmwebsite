import dotenv from "dotenv";
import { existsSync } from "fs";
import { defineConfig } from "prisma/config";

// Load .env.local for local development; on Vercel, env vars are injected directly
if (existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
