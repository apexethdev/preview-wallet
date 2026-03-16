# Preview Wallet Demo

This app is a reference implementation of the public install flow documented at
the repository root.

It uses:

- the same `PreviewWalletHost` source that ships in
  `integration/next-app-router-wagmi/app/PreviewWalletHost.tsx`
- the repo-level `tools/preview-wallet` sidecar
- the same env contract external adopters copy into their own app

## Start the demo

From `examples/next-demo`:

```bash
npm install
npm run wallet:install
cp .env.local.example .env.local
npm run dev:wallet
```

The app runs on `http://localhost:3000`.

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
