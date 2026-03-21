import dotenv from "dotenv";
import { existsSync } from "fs";
import { defineConfig } from "prisma/config";

// Load .env.local first, fall back to .env for local development
if (existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else if (existsSync(".env")) {
  dotenv.config({ path: ".env" });
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
