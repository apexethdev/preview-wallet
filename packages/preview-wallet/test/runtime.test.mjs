import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

import { PreviewWalletRuntime, RpcError } from "../src/runtime/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function importRuntimeWithEnv(network) {
  const runtimeUrl = new URL(
    `../src/runtime/index.mjs?network=${encodeURIComponent(network)}-${Date.now()}`,
    import.meta.url
  );
  process.env.PREVIEW_WALLET_NETWORK = network;
  process.env.PREVIEW_WALLET_RPC_URL = "https://sepolia.base.org";
  process.env.PREVIEW_WALLET_PRIVATE_KEY =
    "0x1111111111111111111111111111111111111111111111111111111111111111";
  return import(runtimeUrl.href);
}

test("RpcError preserves code, message, and data", () => {
  const error = new RpcError(4001, "Rejected", { reason: "user" });

  assert.ok(error instanceof Error);
  assert.equal(error.name, "RpcError");
  assert.equal(error.code, 4001);
  assert.equal(error.message, "Rejected");
  assert.deepEqual(error.data, { reason: "user" });
});

test("unsupported PREVIEW_WALLET_NETWORK throws a clear error", async () => {
  const runtimeModule = await importRuntimeWithEnv("base");

  assert.throws(
    () => new runtimeModule.PreviewWalletRuntime(),
    (error) =>
      error instanceof Error &&
      error.message ===
        "Unsupported PREVIEW_WALLET_NETWORK: base. Only 'sepolia' is supported."
  );
});

test("eth_call returns the hex payload string", async () => {
  process.env.PREVIEW_WALLET_NETWORK = "sepolia";
  process.env.PREVIEW_WALLET_RPC_URL = "https://sepolia.base.org";
  process.env.PREVIEW_WALLET_PRIVATE_KEY =
    "0x1111111111111111111111111111111111111111111111111111111111111111";

  const runtime = new PreviewWalletRuntime();
  Object.defineProperty(runtime, "publicClient", {
    value: {
      call: async () => ({ data: "0xdeadbeef" }),
    },
  });

  const result = await runtime.handleRpc({
    method: "eth_call",
    params: [{ to: "0x0000000000000000000000000000000000000000", data: "0x" }],
  });

  assert.equal(result, "0xdeadbeef");
});

test("EIP-6963 announce detail and info are frozen", async () => {
  const clientSource = await fs.readFile(path.join(__dirname, "../src/client.js"), "utf8");

  let dispatchedDetail = null;
  const windowObject = {
    __previewWalletModules: {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent(event) {
      dispatchedDetail = event.detail;
    },
  };

  const context = vm.createContext({
    window: windowObject,
    globalThis: windowObject,
    CustomEvent: class CustomEvent {
      constructor(type, init) {
        this.type = type;
        this.detail = init.detail;
      }
    },
  });

  windowObject.__previewWalletModules.createPreviewWalletBridge = () => ({
    stopPolling() {},
  });
  windowObject.__previewWalletModules.createPreviewWalletProvider = () => ({
    destroy() {},
  });
  windowObject.__previewWalletModules.createPreviewWalletMount = () => ({
    root: { addEventListener() {}, removeEventListener() {} },
    destroy() {},
  });
  windowObject.__previewWalletModules.createPreviewWalletOverlay = () => ({
    destroy() {},
  });

  new vm.Script(clientSource).runInContext(context);

  assert.ok(Object.isFrozen(dispatchedDetail));
  assert.ok(Object.isFrozen(dispatchedDetail.info));
});
