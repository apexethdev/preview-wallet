import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourceRoot = path.join(root, "tools", "preview-wallet");
const targetRoot = path.join(
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

function normalizeSource(relativePath, value) {
  if (relativePath === "package.json") {
    return value.replace(
      'node --env-file-if-exists=../../examples/next-demo/.env.local src/server/index.mjs',
      'node --env-file-if-exists=../../.env.local src/server/index.mjs'
    );
  }
  return value;
}

for (const relativePath of syncedFiles) {
  const [source, target] = await Promise.all([
    readFile(path.join(sourceRoot, relativePath), "utf8"),
    readFile(path.join(targetRoot, relativePath), "utf8"),
  ]);

  if (normalizeSource(relativePath, source) !== target) {
    process.stderr.write(`Preview wallet sync mismatch: ${relativePath}\n`);
    process.exit(1);
  }
}
