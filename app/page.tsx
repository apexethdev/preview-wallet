const layoutSnippet = `your-app/
  app/
  tools/
    preview-wallet/
  .env.local
  package.json`;

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
  return (
    <main className="page">
      <span className="badge">Dev Wallet</span>
      <h1>
        Preview Wallet lives in <code>tools/preview-wallet</code>
      </h1>
      <p className="lede">
        The Next.js app stays at the repository root while the wallet sidecar
        lives under <code>tools/preview-wallet</code> and reads the same
        root <code>.env.local</code>.
      </p>

      <hr className="divider" />

      <div className="section">
        <h2>Repository shape</h2>
        <pre><code>{layoutSnippet}</code></pre>
      </div>

      <div className="section">
        <h2>Environment</h2>
        <p>
          Browser-facing values use <code>NEXT_PUBLIC_*</code>. Wallet
          runtime values stay server-only.
        </p>
        <pre><code>{envSnippet}</code></pre>
      </div>

      <div className="section">
        <h2>Getting started</h2>
        <p>
          Install both packages once, then boot app and wallet together from
          the app root.
        </p>
        <pre><code>{commandSnippet}</code></pre>
      </div>
    </main>
  );
}
