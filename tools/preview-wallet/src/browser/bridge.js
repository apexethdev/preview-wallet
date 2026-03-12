(function registerPreviewWalletBridge(globalObject) {
  const modules =
    globalObject.__previewWalletModules ||
    (globalObject.__previewWalletModules = {});

  const DEFAULT_POLL_MS = 5000;
  const RUNTIME_URL = "__PREVIEW_WALLET_RUNTIME_URL__";

  function createError(errorLike) {
    const error = new Error(
      (errorLike && errorLike.message) || "Preview Wallet error"
    );
    if (errorLike && typeof errorLike.code !== "undefined") {
      error.code = errorLike.code;
    }
    if (errorLike && typeof errorLike.data !== "undefined") {
      error.data = errorLike.data;
    }
    return error;
  }

  async function readJson(response) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  class PreviewWalletBridge {
    constructor({ runtimeUrl = RUNTIME_URL, pollMs = DEFAULT_POLL_MS } = {}) {
      this.runtimeUrl = runtimeUrl;
      this.pollMs = pollMs;
      this.state = null;
      this.interval = null;
      this.subscribers = new Set();
    }

    subscribe(listener) {
      this.subscribers.add(listener);
      listener(this.state);
      return () => {
        this.subscribers.delete(listener);
      };
    }

    notify() {
      for (const subscriber of this.subscribers) {
        subscriber(this.state);
      }
    }

    setState(nextState) {
      this.state = nextState;
      this.notify();
    }

    async fetchState() {
      try {
        const response = await fetch(`${this.runtimeUrl}/state`, {
          cache: "no-store",
        });
        const body = await readJson(response);
        if (body?.ok) {
          this.setState(body.result);
        }
        return this.state;
      } catch (error) {
        this.setState({
          ...(this.state || {}),
          connected: this.state?.connected || false,
          pendingRequests: this.state?.pendingRequests || [],
          error: error?.message || "Preview Wallet sidecar is unavailable.",
        });
        throw error;
      }
    }

    startPolling() {
      if (this.interval) {
        return;
      }

      this.fetchState().catch(() => {});
      this.interval = globalObject.setInterval(() => {
        this.fetchState().catch(() => {});
      }, this.pollMs);
    }

    stopPolling() {
      if (this.interval) {
        globalObject.clearInterval(this.interval);
        this.interval = null;
      }
    }

    async rpc(method, params = []) {
      const response = await fetch(`${this.runtimeUrl}/rpc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, params }),
      });
      const body = await readJson(response);

      if (!body?.ok) {
        throw createError(body?.error);
      }

      if (
        method === "eth_requestAccounts" ||
        method === "wallet_requestPermissions" ||
        method === "wallet_revokePermissions" ||
        method === "wallet_switchEthereumChain"
      ) {
        await this.fetchState();
      }

      return body.result;
    }

    async resolvePending(id, action, message) {
      const response = await fetch(`${this.runtimeUrl}/pending/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: message ? JSON.stringify({ message }) : undefined,
      });
      const body = await readJson(response);

      if (!body?.ok) {
        throw createError(body?.error);
      }

      this.setState(body.result);
      return body.result;
    }
  }

  modules.createPreviewWalletBridge = (options) =>
    new PreviewWalletBridge(options);
})(globalThis);
