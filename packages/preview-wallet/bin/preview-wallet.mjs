#!/usr/bin/env node

import { existsSync } from "node:fs";
import path from "node:path";

import { config as loadDotenv } from "dotenv";

import { startPreviewWalletServer } from "../src/server/index.mjs";

const defaultEnvFiles = [".env.local", ".env"];

for (const relativePath of defaultEnvFiles) {
  const envPath = path.join(process.cwd(), relativePath);
  if (existsSync(envPath)) {
    loadDotenv({ path: envPath, override: false });
  }
}

await startPreviewWalletServer();
