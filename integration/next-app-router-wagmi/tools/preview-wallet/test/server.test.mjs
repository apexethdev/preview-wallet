import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getFreePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(address.port);
      });
    });
    server.on("error", reject);
  });
}

async function startServer() {
  const port = await getFreePort();
  const child = spawn("node", ["src/server/index.mjs"], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      PREVIEW_WALLET_HOST: "127.0.0.1",
      PREVIEW_WALLET_PORT: String(port),
      PREVIEW_WALLET_NETWORK: "sepolia",
      PREVIEW_WALLET_RPC_URL: "https://sepolia.base.org",
      PREVIEW_WALLET_PRIVATE_KEY:
        "0x1111111111111111111111111111111111111111111111111111111111111111",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const onExit = once(child, "exit").then(([code, signal]) => {
    throw new Error(`preview-wallet server exited early (${code}, ${signal})`);
  });

  await Promise.race([
    once(child.stdout, "data"),
    onExit,
  ]);

  return {
    child,
    port,
  };
}

test("OPTIONS returns 204 with no response body", async () => {
  const { child, port } = await startServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/rpc`, {
      method: "OPTIONS",
    });
    const body = await response.text();

    assert.equal(response.status, 204);
    assert.equal(body, "");
  } finally {
    child.kill("SIGTERM");
    await once(child, "exit");
  }
});

test("client bundle responses are stable across repeated requests", async () => {
  const { child, port } = await startServer();

  try {
    const [first, second] = await Promise.all([
      fetch(`http://127.0.0.1:${port}/client.js`).then((response) => response.text()),
      fetch(`http://127.0.0.1:${port}/client.js`).then((response) => response.text()),
    ]);

    assert.equal(first, second);
    assert.match(first, /createPreviewWallet/);
  } finally {
    child.kill("SIGTERM");
    await once(child, "exit");
  }
});
