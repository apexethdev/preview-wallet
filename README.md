# Preview Wallet

This repository is an npm workspace monorepo centered on the
`@preview-wallet/wallet` package.

It is specifically aimed at in-built preview-browser environments where browser
extensions are unavailable or awkward, such as Cursor preview tabs and Claude
Code preview browsers.

The publishable package lives in `packages/preview-wallet`. The reference app
that consumes it lives in `apps/next-demo`.

## Repository layout

```text
apps/
  next-demo/
packages/
  preview-wallet/
integration/
  next-app-router-wagmi/
INSTALL_AGENT.md
USE_AGENT.md
```

## Use this repo

### 1. Run the demo

From the repository root:

```bash
npm install
cp apps/next-demo/.env.local.example apps/next-demo/.env.local
npm run demo:dev
```

The demo uses a single env file at `apps/next-demo/.env.local` for both the
Next.js app and the local wallet sidecar.

### 2. Use the package in another app

Start with [INSTALL_AGENT.md](./INSTALL_AGENT.md).

That flow assumes:

- Next.js App Router
- existing `wagmi` + RainbowKit providers
- package-based installation via `@preview-wallet/wallet`
- an in-built preview browser where you want a local injected wallet without a
  browser extension

## Verification

Useful local checks:

```bash
npm run demo:check
npm run wallet:check
npm run package:pack
```

Expected local endpoints while running:

- app: `http://localhost:3000`
- wallet health: `http://127.0.0.1:43199/health`
- wallet bundle: `http://127.0.0.1:43199/client.js`
