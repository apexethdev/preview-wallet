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
        <h1>Run the wallet from <code>tools/preview-wallet</code>, not outside the app repo.</h1>
        <p className="lede">
          This example shows the intended in-repo setup: the Next.js app stays at the
          repository root, while the wallet sidecar lives under <code>tools/preview-wallet</code>
          and reads the same root <code>.env.local</code>.
        </p>
      </section>

      <section className="panel-grid">
        <article className="panel">
          <h2>Repository shape</h2>
          <p>The app owns the root env file. The wallet remains a separate localhost process.</p>
          <pre>{layoutSnippet}</pre>
        </article>

        <article className="panel">
          <h2>Root env contract</h2>
          <p>Only the browser-facing values use <code>NEXT_PUBLIC_*</code>. Wallet runtime values stay server-only.</p>
          <pre>{envSnippet}</pre>
        </article>

        <article className="panel">
          <h2>Developer flow</h2>
          <p>Install both packages once, then boot app and wallet together from the app root.</p>
          <pre>{commandSnippet}</pre>
        </article>

        <article className="panel">
          <h2>What the app loads</h2>
          <p>
            The host component injects <code>NEXT_PUBLIC_PREVIEW_WALLET_URL</code> in local
            development. The signer and approval overlay stay inside the sidecar process and
            its served browser bundle.
          </p>
        </article>
      </section>
    </main>
  );
}
