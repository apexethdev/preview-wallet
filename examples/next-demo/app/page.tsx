"use client";

import * as React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";

const envSnippet = `NEXT_PUBLIC_PREVIEW_WALLET_ENABLED=true
NEXT_PUBLIC_PREVIEW_WALLET_URL=http://127.0.0.1:43199/client.js

PREVIEW_WALLET_PRIVATE_KEY=0xYOUR_DEV_PRIVATE_KEY_64_HEX_CHARS
PREVIEW_WALLET_NETWORK=sepolia
PREVIEW_WALLET_RPC_URL=https://sepolia.base.org`;

const commandSnippet = `npm install
npm run wallet:install
cp .env.local.example .env.local
npm run dev:wallet`;

export default function Page() {
  const { address, isConnected } = useAccount();
  const [signature, setSignature] = React.useState<string | null>(null);
  const [signError, setSignError] = React.useState<string | null>(null);
  const { signMessageAsync, isPending: isSigning } = useSignMessage();

  const handleSignMessage = async () => {
    setSignError(null);
    setSignature(null);

    try {
      const message = `Preview Wallet demo signature\nTime: ${new Date().toISOString()}`;
      const nextSignature = await signMessageAsync({ account: address, message });
      setSignature(nextSignature);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Signature request failed.";
      setSignError(message);
    }
  };

  return (
    <main className="page">
      <span className="badge">Reference Demo</span>
      <h1>
        Preview Wallet for Next.js App Router
      </h1>
      <p className="lede">
        This demo app mirrors the public GitHub install flow. It uses the same
        preview wallet host source and sidecar contract documented under{" "}
        <code>integration/next-app-router-wagmi</code>, while the runnable demo
        sidecar stays at the repo-level <code>tools/preview-wallet</code>.
      </p>

      <div className="connect-section">
        <ConnectButton />
        {isConnected ? (
          <div className="sign-demo">
            <button
              type="button"
              className="sign-demo-button"
              onClick={handleSignMessage}
              disabled={isSigning}
            >
              {isSigning ? "Waiting for signature..." : "Sign a message"}
            </button>
            {signature ? (
              <p className="sign-demo-result">
                Signed successfully: <code>{signature}</code>
              </p>
            ) : null}
            {signError ? <p className="sign-demo-error">{signError}</p> : null}
          </div>
        ) : null}
      </div>

      <hr className="divider" />

      <div className="section">
        <h2>Getting started</h2>
        <p>
          From <code>examples/next-demo</code>, install the demo app, install
          the sidecar, copy the example env file, and boot both processes.
        </p>
        <pre>
          <code>{commandSnippet}</code>
        </pre>
      </div>

      <div className="section">
        <h2>Integration contract</h2>
        <p>
          Browser-facing values use <code>NEXT_PUBLIC_*</code>. Wallet runtime
          values stay server-only. External adopters should follow the same env
          contract described in the repo root install docs.
        </p>
        <pre>
          <code>{envSnippet}</code>
        </pre>
      </div>
    </main>
  );
}
