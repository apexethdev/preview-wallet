# Preview Wallet Demo

This app is the reference consumer for the `@preview-wallet/wallet` package.

It uses:

- the published-style `preview-wallet` CLI to run the local sidecar
- the `@preview-wallet/wallet/react` export for the browser host
- the same env contract external adopters use in their own app

## Start the demo

From the repository root:

```bash
npm install
cp apps/next-demo/.env.local.example apps/next-demo/.env.local
```

The app runs on `http://localhost:3000`.

The wallet sidecar reads the same `apps/next-demo/.env.local` file when started
from the repo root, so the demo only needs one env file.

Start the app and wallet in separate terminals:

```bash
npm run demo:dev
npm run wallet:start
```

The demo uses `next dev --webpack` for local development to avoid current
Turbopack instability in this repo layout.

## WalletConnect / Reown project ID

The demo now reads `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` from `.env.local`.

If you do not set it, the app falls back to RainbowKit's sample project ID so
the local demo can connect without a 403 from Reown config fetches.

If you already have your own WalletConnect Cloud or Reown project, set:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
```
