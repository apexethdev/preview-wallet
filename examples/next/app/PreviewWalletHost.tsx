"use client";

import * as React from "react";

const SCRIPT_ID = "preview-wallet-script";
const PREVIEW_WALLET_ENABLED =
  process.env.NEXT_PUBLIC_PREVIEW_WALLET_ENABLED === "true" &&
  process.env.NODE_ENV !== "production";
const PREVIEW_WALLET_URL =
  process.env.NEXT_PUBLIC_PREVIEW_WALLET_URL ||
  "http://127.0.0.1:43199/client.js";

type PreviewWalletWindow = Window & {
  __previewWalletCleanup__?: () => void;
};

export default function PreviewWalletHost() {
  React.useEffect(() => {
    if (!PREVIEW_WALLET_ENABLED || typeof document === "undefined") {
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
    document.body.appendChild(script);

    return () => {
      script.remove();

      const cleanup = (window as PreviewWalletWindow).__previewWalletCleanup__;
      if (typeof cleanup === "function") {
        cleanup();
        delete (window as PreviewWalletWindow).__previewWalletCleanup__;
      }
    };
  }, []);

  return null;
}
