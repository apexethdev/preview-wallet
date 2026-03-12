import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PreviewWalletRuntime } from "../runtime/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BROWSER_FILES = [
  path.join(ROOT, "browser", "bridge.js"),
  path.join(ROOT, "browser", "provider.js"),
  path.join(ROOT, "browser", "mount.js"),
  path.join(ROOT, "browser", "overlay.js"),
  path.join(ROOT, "client.js"),
];
const HOST = process.env.PREVIEW_WALLET_HOST || "127.0.0.1";
const PORT = Number(process.env.PREVIEW_WALLET_PORT || "43199");

const runtime = new PreviewWalletRuntime();
let clientBundlePromise = null;

function getErrorPayload(error, fallbackMessage) {
  return {
    code: error?.code || 5000,
    message: error?.message || fallbackMessage,
    data: error?.data,
  };
}

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

function writeEmpty(res, statusCode) {
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
}

async function buildClientBundle() {
  const sources = await Promise.all(
    BROWSER_FILES.map((filePath) => readFile(filePath, "utf8"))
  );

  return sources
    .join("\n;\n")
    .replaceAll("__PREVIEW_WALLET_RUNTIME_URL__", `http://${HOST}:${PORT}`);
}

function getClientBundle() {
  if (!clientBundlePromise) {
    clientBundlePromise = buildClientBundle().catch((error) => {
      clientBundlePromise = null;
      throw error;
    });
  }
  return clientBundlePromise;
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      writeEmpty(res, 204);
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/health") {
      writeJson(res, 200, { ok: true, result: runtime.getState() });
      return;
    }

    if (req.method === "GET" && url.pathname === "/client.js") {
      const script = await getClientBundle();
      res.writeHead(200, {
        "Content-Type": "application/javascript; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(script);
      return;
    }

    if (req.method === "GET" && url.pathname === "/state") {
      writeJson(res, 200, { ok: true, result: runtime.getState() });
      return;
    }

    if (req.method === "POST" && url.pathname === "/rpc") {
      const body = await readJsonBody(req);
      try {
        const result = await runtime.handleRpc(body);
        writeJson(res, 200, { ok: true, result });
      } catch (error) {
        writeJson(res, 200, {
          ok: false,
          error: getErrorPayload(error, "Unknown wallet error"),
        });
      }
      return;
    }

    const approveMatch = url.pathname.match(/^\/pending\/([^/]+)\/approve$/);
    if (req.method === "POST" && approveMatch) {
      writeJson(res, 200, {
        ok: true,
        result: await runtime.approveRequest(approveMatch[1]),
      });
      return;
    }

    const rejectMatch = url.pathname.match(/^\/pending\/([^/]+)\/reject$/);
    if (req.method === "POST" && rejectMatch) {
      const body = await readJsonBody(req);
      writeJson(res, 200, {
        ok: true,
        result: await runtime.rejectRequest(rejectMatch[1], body?.message),
      });
      return;
    }

    writeJson(res, 404, { ok: false, error: { message: "Not found" } });
  } catch (error) {
    writeJson(res, 500, {
      ok: false,
      error: getErrorPayload(error, "Unexpected runtime error"),
    });
  }
});

server.listen(PORT, HOST, () => {
  process.stdout.write(
    [
      `Preview Wallet listening on http://${HOST}:${PORT}`,
      `Client bundle: http://${HOST}:${PORT}/client.js`,
      `Address: ${runtime.account?.address || "unconfigured"}`,
    ].join("\n") + "\n"
  );
});
