"use client";

import * as React from "react";

const SCRIPT_ID = "preview-wallet-script";
const SCRIPT_RETRY_DELAY_MS = 1000;
const PREVIEW_WALLET_ENABLED =
  process.env.NEXT_PUBLIC_PREVIEW_WALLET_ENABLED === "true" &&
  process.env.NODE_ENV !== "production";
const PREVIEW_WALLET_URL =
  process.env.NEXT_PUBLIC_PREVIEW_WALLET_URL ||
  "http://127.0.0.1:43199/client.js";

type PreviewWalletWindow = Window & {
  __previewWalletCleanup__?: () => void;
  __previewWalletLoaded?: boolean;
};

export default function PreviewWalletHost() {
  React.useEffect(() => {
    if (!PREVIEW_WALLET_ENABLED || typeof document === "undefined") {
      return;
    }

    let cancelled = false;
    let retryTimer: number | undefined;
    let activeScript: HTMLScriptElement | null = null;
    const previewWalletWindow = window as PreviewWalletWindow;

    const scheduleRetry = () => {
      if (cancelled) {
        return;
      }
      retryTimer = window.setTimeout(loadScript, SCRIPT_RETRY_DELAY_MS);
    };

    const loadScript = () => {
      if (cancelled || previewWalletWindow.__previewWalletLoaded) {
        return;
      }

      const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      if (existingScript) {
        return;
      }

      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = PREVIEW_WALLET_URL;
      script.onload = () => {
        activeScript = script;
      };
      script.onerror = () => {
        script.remove();
        if (activeScript === script) {
          activeScript = null;
        }
        scheduleRetry();
      };

      activeScript = script;
      document.body.appendChild(script);
    };

    loadScript();

    return () => {
      cancelled = true;
      if (typeof retryTimer !== "undefined") {
        window.clearTimeout(retryTimer);
      }
      if (activeScript) {
        activeScript.remove();
      }

      const cleanup = previewWalletWindow.__previewWalletCleanup__;
      if (typeof cleanup === "function") {
        cleanup();
        delete previewWalletWindow.__previewWalletCleanup__;
      }
    };
  }, []);

  return null;
}
