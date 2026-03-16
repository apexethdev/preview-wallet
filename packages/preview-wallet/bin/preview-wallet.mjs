#!/usr/bin/env node

import { existsSync } from "node:fs";
import path from "node:path";

import { config as loadDotenv } from "dotenv";

import { startPreviewWalletServer } from "../src/server/index.mjs";

function getEnvFilesFromArgs(argv) {
  const envFiles = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--env-file") {
      const nextValue = argv[index + 1];
      if (nextValue) {
        envFiles.push(nextValue);
        index += 1;
      }
      continue;
    }

    if (argument.startsWith("--env-file=")) {
      envFiles.push(argument.slice("--env-file=".length));
    }
  }

  return envFiles;
}

const defaultEnvFiles = [".env.local", ".env"];
const requestedEnvFiles = getEnvFilesFromArgs(process.argv.slice(2));

for (const relativePath of [...requestedEnvFiles, ...defaultEnvFiles]) {
  const envPath = path.resolve(process.cwd(), relativePath);
  if (existsSync(envPath)) {
    loadDotenv({ path: envPath, override: false });
  }
}

await startPreviewWalletServer();
