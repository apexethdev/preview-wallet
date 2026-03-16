# Preview Wallet

`@preview-wallet/wallet` is a published npm package for running a local preview
wallet sidecar and browser host in a Next.js + RainbowKit app.

Install it in another app with:

```bash
npm install @preview-wallet/wallet
```

This repository is the source workspace for that package plus the reference
demo app that consumes it.

It is specifically aimed at in-built preview-browser environments where browser
extensions are unavailable or awkward, such as Cursor preview tabs and Claude
Code preview browsers.

The package source lives in `packages/preview-wallet`. The reference app that
consumes it lives in `next-demo`.

## Repository layout

```text
next-demo/
packages/
  preview-wallet/
```

## Use this repo

### 1. Run the demo

Install workspace dependencies from the repository root:

```bash
npm install
```

Then switch to the demo app directory:

```bash
cd next-demo
cp .env.local.example .env.local
```

The demo uses a single env file at `next-demo/.env.local` for both the
Next.js app and the local wallet sidecar.

Start the demo in separate terminals from `next-demo`:

```bash
npm run dev
npm run wallet:start
```

Or run the same two processes from the repository root:

```bash
npm run start:demo
npm run start:wallet
```

### 2. Use the package in another app

Use [next-demo/README.md](./next-demo/README.md) as the integration
reference. It contains both the runnable demo flow and the package wiring steps
for another Next.js app.

That flow assumes:

- Next.js App Router
- existing `wagmi` + RainbowKit providers
- install via `npm install @preview-wallet/wallet`
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
