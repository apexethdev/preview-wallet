(function registerPreviewWalletProvider(globalObject) {
  const modules =
    globalObject.__previewWalletModules ||
    (globalObject.__previewWalletModules = {});

  class PreviewWalletProvider {
    constructor({ bridge }) {
      this.bridge = bridge;
      this.accounts = [];
      this.chainId = "0x14a34";
      this.connected = false;
      this.listeners = new Map();
      this.isPreviewWallet = true;
      this.unsubscribe = this.bridge.subscribe((snapshot) =>
        this.handleSnapshot(snapshot)
      );
      this.bridge.startPolling();
    }

    on(event, listener) {
      const listeners = this.listeners.get(event) || new Set();
      listeners.add(listener);
      this.listeners.set(event, listeners);
      return this;
    }

    removeListener(event, listener) {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(listener);
      }
      return this;
    }

    emit(event, payload) {
      const listeners = this.listeners.get(event);
      if (!listeners) {
        return;
      }

      for (const listener of listeners) {
        listener(payload);
      }
    }

    handleSnapshot(snapshot) {
      if (!snapshot) {
        return;
      }

      const nextAccounts =
        snapshot.connected && snapshot.address ? [snapshot.address] : [];
      const nextChainId =
        typeof snapshot.chainId === "number"
          ? `0x${snapshot.chainId.toString(16)}`
          : this.chainId;
      const accountsChanged =
        JSON.stringify(nextAccounts) !== JSON.stringify(this.accounts);
      const chainChanged = nextChainId !== this.chainId;
      const disconnected = this.connected && !snapshot.connected;

      this.accounts = nextAccounts;
      this.chainId = nextChainId;
      this.connected = Boolean(snapshot.connected);

      if (accountsChanged) {
        this.emit("accountsChanged", nextAccounts);
      }
      if (chainChanged) {
        this.emit("chainChanged", this.chainId);
      }
      if (disconnected) {
        this.emit("disconnect", {
          code: 4900,
          message: "Provider disconnected",
        });
      }
    }

    async request({ method, params = [] }) {
      const result = await this.bridge.rpc(method, params);

      if (method === "eth_requestAccounts") {
        this.emit("connect", { chainId: this.chainId });
      }

      return result;
    }

    enable() {
      return this.request({ method: "eth_requestAccounts" });
    }

    send(payload, callback) {
      const request = this.request(payload);

      if (typeof callback === "function") {
        request
          .then((result) => callback(null, { id: payload.id, jsonrpc: "2.0", result }))
          .catch((error) => callback(error, null));
        return;
      }

      return request;
    }

    sendAsync(payload, callback) {
      return this.send(payload, callback);
    }

    destroy() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    }
  }

  modules.createPreviewWalletProvider = (options) =>
    new PreviewWalletProvider(options);
})(globalThis);
