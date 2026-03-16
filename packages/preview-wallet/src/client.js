(function createPreviewWallet(globalObject) {
  if (globalObject.__previewWalletLoaded) {
    return;
  }

  globalObject.__previewWalletLoaded = true;

  const modules = globalObject.__previewWalletModules || {};
  const providerInfo = {
    uuid: "0d3d8f69-004f-4ced-b356-0ca5843cfe17",
    name: "Preview Wallet",
    rdns: "cash.previewwallet.local",
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%23020511'/%3E%3Cpath d='M16 20h32L36 48H28L16 20Z' fill='%23e2e8f0'/%3E%3Ccircle cx='32' cy='30' r='7' fill='%23020511'/%3E%3C/svg%3E",
  };

  const bridge = modules.createPreviewWalletBridge();
  const provider = modules.createPreviewWalletProvider({ bridge });
  const mount = modules.createPreviewWalletMount();
  const overlay = modules.createPreviewWalletOverlay({ bridge, mount });

  const announce = () => {
    const detail = Object.freeze({
      info: Object.freeze({ ...providerInfo }),
      provider,
    });

    globalObject.dispatchEvent(
      new CustomEvent("eip6963:announceProvider", {
        detail,
      })
    );
  };

  globalObject.addEventListener("eip6963:requestProvider", announce);
  announce();

  if (!globalObject.ethereum) {
    Object.defineProperty(globalObject, "ethereum", {
      value: provider,
      configurable: true,
      enumerable: false,
      writable: false,
    });
  } else if (Array.isArray(globalObject.ethereum.providers)) {
    globalObject.ethereum.providers.push(provider);
  } else {
    globalObject.ethereum.providers = [globalObject.ethereum, provider];
  }

  globalObject.__previewWalletCleanup__ = () => {
    globalObject.removeEventListener("eip6963:requestProvider", announce);
    bridge.stopPolling();
    overlay.destroy();
    provider.destroy();

    if (Array.isArray(globalObject.ethereum?.providers)) {
      globalObject.ethereum.providers = globalObject.ethereum.providers.filter(
        (candidate) => candidate !== provider
      );
    }

    delete globalObject.__previewWalletLoaded;
  };
})(window);
