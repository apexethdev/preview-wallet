"use client";

import * as React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";

const envSnippet = `NEXT_PUBLIC_PREVIEW_WALLET_ENABLED=true
NEXT_PUBLIC_PREVIEW_WALLET_URL=http://127.0.0.1:43199/client.js
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID

PREVIEW_WALLET_PRIVATE_KEY=0xYOUR_DEV_PRIVATE_KEY_64_HEX_CHARS
PREVIEW_WALLET_NETWORK=sepolia
PREVIEW_WALLET_RPC_URL=https://sepolia.base.org`;

const commandSnippet = `npm install
cd apps/next-demo
cp .env.local.example .env.local

# terminal 1
npm run dev

# terminal 2
npm run wallet:start`;

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
        This demo app is a real consumer of the published-style{" "}
        <code>@preview-wallet/wallet</code> package. The same package provides
        the local sidecar CLI and the React host that injects the wallet in the
        browser.
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
          Install the workspace from the repo root once, then run the app and
          wallet sidecar from <code>apps/next-demo</code> in separate terminals.
        </p>
        <pre>
          <code>{commandSnippet}</code>
        </pre>
      </div>

      <div className="section">
        <h2>Integration contract</h2>
        <p>
          Browser-facing values use <code>NEXT_PUBLIC_*</code>. Wallet runtime
          values stay server-only. External adopters import the React host from{" "}
          <code>@preview-wallet/wallet/react</code> and start the local server
          with the <code>preview-wallet</code> CLI.
        </p>
        <pre>
          <code>{envSnippet}</code>
        </pre>
      </div>
    </main>
  );
}
