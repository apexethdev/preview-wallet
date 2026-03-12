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
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Colocated Dev Wallet</p>
        <h1>Preview Wallet lives in <code>tools/preview-wallet</code>.</h1>
        <p className="lede">
          This example shows the intended in-repo setup: the Next.js app stays at the
          repository root, while the wallet sidecar lives under <code>tools/preview-wallet</code>
          and reads the same root <code>.env.local</code>.
        </p>
      </section>

      <section className="panel-stack">
        <article className="panel panel-summary">
          <h2>How this setup works</h2>
          <p>
            The app owns the root <code>.env.local</code>. The wallet remains a separate
            localhost process under <code>tools/preview-wallet</code>, and the host component
            injects <code>NEXT_PUBLIC_PREVIEW_WALLET_URL</code> only in local development.
          </p>

          <div className="summary-block">
            <h3>Repository shape</h3>
            <pre>{layoutSnippet}</pre>
          </div>

          <div className="summary-block">
            <h3>Root env contract</h3>
            <p>Only browser-facing values use <code>NEXT_PUBLIC_*</code>. Wallet runtime values stay server-only.</p>
            <pre>{envSnippet}</pre>
          </div>

          <div className="summary-block">
            <h3>Developer flow</h3>
            <p>Install both packages once, then boot app and wallet together from the app root.</p>
            <pre>{commandSnippet}</pre>
          </div>
        </article>
      </section>
    </main>
  );
}
