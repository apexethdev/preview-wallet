import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const targetDir = path.join(
  root,
  "integration",
  "next-app-router-wagmi",
  "tools",
  "preview-wallet"
);

const syncedFiles = [
  "package-lock.json",
  "package.json",
  "src/browser/bridge.js",
  "src/browser/mount.js",
  "src/browser/overlay.js",
  "src/browser/provider.js",
  "src/client.js",
  "src/runtime/index.mjs",
  "src/server/index.mjs",
  "test/runtime.test.mjs",
  "test/server.test.mjs",
];

for (const relativePath of syncedFiles) {
  const sourcePath = path.join(root, "tools", "preview-wallet", relativePath);
  const targetPath = path.join(targetDir, relativePath);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await cp(sourcePath, targetPath, { force: true });
}

const targetPackageJsonPath = path.join(targetDir, "package.json");
const targetPackageJson = JSON.parse(await readFile(targetPackageJsonPath, "utf8"));
targetPackageJson.scripts.start = "node --env-file-if-exists=../../.env.local src/server/index.mjs";
await writeFile(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2) + "\n");
