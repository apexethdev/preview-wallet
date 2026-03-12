(function registerPreviewWalletMount(globalObject) {
  const modules =
    globalObject.__previewWalletModules ||
    (globalObject.__previewWalletModules = {});

  const OVERLAY_STYLES = `
    :host {
      all: initial;
    }

    .preview-wallet-root {
      color: #f8fafc;
      font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      pointer-events: auto;
    }

    .preview-wallet-shell {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      width: auto;
      max-width: min(22rem, calc(100vw - 2rem));
    }

    .preview-wallet-popover {
      width: min(22rem, calc(100vw - 2rem));
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: rgba(2, 6, 23, 0.96);
      color: #f8fafc;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(14px);
      border-radius: 20px;
      padding: 12px;
    }

    .preview-wallet-error {
      border: 1px solid rgba(251, 191, 36, 0.3);
      background: rgba(245, 158, 11, 0.1);
      padding: 10px;
      border-radius: 14px;
      font-size: 12px;
      color: #fde68a;
      margin-bottom: 10px;
      line-height: 1.45;
    }

    .preview-wallet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding-bottom: 10px;
    }

    .preview-wallet-title {
      font-size: 12px;
      font-weight: 600;
      color: #e2e8f0;
    }

    .preview-wallet-refresh,
    .preview-wallet-toggle {
      cursor: pointer;
      border: none;
      color: #cbd5e1;
      background: rgba(255, 255, 255, 0.06);
    }

    .preview-wallet-refresh {
      height: 26px;
      border-radius: 9999px;
      font-size: 12px;
      padding: 0 10px;
    }

    .preview-wallet-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .preview-wallet-empty {
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: rgba(15, 23, 42, 0.92);
      border-radius: 16px;
      padding: 12px;
      font-size: 12px;
      color: #94a3b8;
    }

    .preview-wallet-request {
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: rgba(15, 23, 42, 0.92);
      border-radius: 16px;
      padding: 12px;
    }

    .preview-wallet-request-top {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
    }

    .preview-wallet-request-summary {
      font-size: 12px;
      font-weight: 600;
      color: #f8fafc;
      line-height: 1.4;
    }

    .preview-wallet-request-method {
      margin-top: 4px;
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #64748b;
    }

    .preview-wallet-request-time {
      font-size: 10px;
      color: #64748b;
      white-space: nowrap;
    }

    .preview-wallet-details {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .preview-wallet-detail {
      display: flex;
      gap: 8px;
      font-size: 11px;
      color: #cbd5e1;
      line-height: 1.45;
    }

    .preview-wallet-detail-label {
      min-width: 56px;
      color: #64748b;
    }

    .preview-wallet-detail-value {
      word-break: break-all;
    }

    .preview-wallet-actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }

    .preview-wallet-action {
      height: 30px;
      border-radius: 9999px;
      padding: 0 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .preview-wallet-action:disabled {
      opacity: 0.6;
      cursor: wait;
    }

    .preview-wallet-approve {
      border: none;
      background: #34d399;
      color: #020617;
    }

    .preview-wallet-reject {
      border: 1px solid rgba(248, 113, 113, 0.3);
      background: rgba(239, 68, 68, 0.1);
      color: #fee2e2;
    }

    .preview-wallet-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-width: 168px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(2, 6, 23, 0.96);
      color: #f8fafc;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.32);
      backdrop-filter: blur(14px);
      border-radius: 20px;
      padding: 8px 10px 8px 8px;
    }

    .preview-wallet-trigger-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .preview-wallet-status {
      border: 1px solid rgba(148, 163, 184, 0.22);
      background: rgba(148, 163, 184, 0.08);
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      color: #cbd5e1;
    }

    .preview-wallet-status.connected {
      border-color: rgba(52, 211, 153, 0.28);
      background: rgba(52, 211, 153, 0.08);
      color: #bbf7d0;
    }

    .preview-wallet-name {
      font-size: 11px;
      color: #94a3b8;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .preview-wallet-toggle {
      height: 28px;
      width: 28px;
      border-radius: 9999px;
      font-size: 15px;
      line-height: 1;
    }
  `;

  function createPreviewWalletMount() {
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.right = "16px";
    host.style.bottom = "16px";
    host.style.zIndex = "2147483647";
    host.style.pointerEvents = "auto";
    host.style.width = "auto";
    host.style.maxWidth = "min(22rem, calc(100vw - 2rem))";

    let root;

    try {
      const shadowRoot = host.attachShadow({ mode: "open" });
      const styleElement = document.createElement("style");
      styleElement.textContent = OVERLAY_STYLES;
      root = document.createElement("div");
      root.className = "preview-wallet-root";
      shadowRoot.append(styleElement, root);
    } catch (_error) {
      const styleElement = document.createElement("style");
      styleElement.textContent = OVERLAY_STYLES;
      root = document.createElement("div");
      root.className = "preview-wallet-root";
      host.append(styleElement, root);
    }

    document.body.appendChild(host);

    return {
      root,
      destroy() {
        host.remove();
      },
    };
  }

  modules.createPreviewWalletMount = createPreviewWalletMount;
})(globalThis);
