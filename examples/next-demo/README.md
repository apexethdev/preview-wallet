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
