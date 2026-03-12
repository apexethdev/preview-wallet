(function registerPreviewWalletOverlay(globalObject) {
  const modules =
    globalObject.__previewWalletModules ||
    (globalObject.__previewWalletModules = {});

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatAddress(value) {
    if (typeof value !== "string" || value.length < 12) {
      return "Not connected";
    }

    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  }

  function renderRequest(request, activeRequestId) {
    const busy = activeRequestId === request.id ? "disabled" : "";
    const details = request.details
      .map(
        (detail) => `
          <div class="preview-wallet-detail">
            <span class="preview-wallet-detail-label">${escapeHtml(detail.label)}</span>
            <span class="preview-wallet-detail-value">${escapeHtml(detail.value)}</span>
          </div>
        `
      )
      .join("");

    return `
      <div class="preview-wallet-request">
        <div class="preview-wallet-request-top">
          <div>
            <div class="preview-wallet-request-summary">${escapeHtml(request.summary)}</div>
            <div class="preview-wallet-request-method">${escapeHtml(request.method)}</div>
          </div>
          <div class="preview-wallet-request-time">${escapeHtml(
            new Date(request.createdAt).toLocaleTimeString()
          )}</div>
        </div>
        <div class="preview-wallet-details">${details}</div>
        <div class="preview-wallet-actions">
          <button class="preview-wallet-action preview-wallet-approve" data-approve="${escapeHtml(
            request.id
          )}" ${busy}>Approve</button>
          <button class="preview-wallet-action preview-wallet-reject" data-reject="${escapeHtml(
            request.id
          )}" ${busy}>Reject</button>
        </div>
      </div>
    `;
  }

  class PreviewWalletOverlay {
    constructor({ mount, bridge }) {
      this.mount = mount;
      this.bridge = bridge;
      this.state = null;
      this.isExpanded = false;
      this.activeRequestId = null;
      this.handleClick = this.handleClick.bind(this);
      this.mount.root.addEventListener("click", this.handleClick);
      this.unsubscribe = this.bridge.subscribe((snapshot) =>
        this.handleSnapshot(snapshot)
      );
      this.render();
    }

    handleSnapshot(snapshot) {
      this.state = snapshot;

      if (snapshot?.pendingRequests?.length) {
        this.isExpanded = true;
      } else if (!this.activeRequestId) {
        this.isExpanded = false;
      }

      this.render();
    }

    render() {
      const state = this.state;
      const pendingCount = state?.pendingRequests?.length || 0;
      const isConnected = Boolean(state?.connected);
      const addressLabel = isConnected
        ? formatAddress(state?.address)
        : "Not connected";
      const requestMarkup = pendingCount
        ? state.pendingRequests
            .map((request) => renderRequest(request, this.activeRequestId))
            .join("")
        : '<div class="preview-wallet-empty">No pending approvals.</div>';

      this.mount.root.innerHTML = `
        <div class="preview-wallet-shell">
          ${
            this.isExpanded
              ? `
                <div class="preview-wallet-popover">
                  ${
                    state?.error
                      ? `<div class="preview-wallet-error">${escapeHtml(state.error)}</div>`
                      : ""
                  }
                  <div class="preview-wallet-header">
                    <div class="preview-wallet-title">${
                      pendingCount
                        ? `${pendingCount} approval request${pendingCount === 1 ? "" : "s"}`
                        : "Preview Wallet"
                    }</div>
                    <button class="preview-wallet-refresh" data-refresh="true">Refresh</button>
                  </div>
                  <div class="preview-wallet-list">${requestMarkup}</div>
                </div>
              `
              : ""
          }
          <div class="preview-wallet-trigger">
            <div class="preview-wallet-address">${escapeHtml(addressLabel)}</div>
            <div class="preview-wallet-trigger-right">
              <span class="preview-wallet-connection-dot ${
                isConnected ? "connected" : ""
              }" aria-hidden="true"></span>
              <button class="preview-wallet-toggle" data-toggle="true">${
                this.isExpanded ? "˅" : "˄"
              }</button>
            </div>
          </div>
        </div>
      `;
    }

    async handleClick(event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.dataset.toggle) {
        this.isExpanded = !this.isExpanded;
        this.render();
        return;
      }

      if (target.dataset.refresh) {
        await this.bridge.fetchState();
        return;
      }

      if (target.dataset.approve) {
        await this.resolvePending(target.dataset.approve, "approve");
        return;
      }

      if (target.dataset.reject) {
        await this.resolvePending(target.dataset.reject, "reject");
      }
    }

    async resolvePending(id, action) {
      this.activeRequestId = id;
      this.render();

      try {
        await this.bridge.resolvePending(id, action);
      } finally {
        this.activeRequestId = null;
        if ((this.bridge.state?.pendingRequests?.length || 0) === 0) {
          this.isExpanded = false;
        }
        this.render();
      }
    }

    destroy() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.mount.root.removeEventListener("click", this.handleClick);
      this.mount.destroy();
    }
  }

  modules.createPreviewWalletOverlay = (options) =>
    new PreviewWalletOverlay(options);
})(globalThis);
