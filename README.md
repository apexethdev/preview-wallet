# Preview Wallet

This repository is structured for GitHub-based installation into an existing
Next.js App Router app that already uses `wagmi` and RainbowKit.

It is specifically aimed at in-built preview-browser environments where browser
extensions are unavailable or awkward, such as Cursor preview tabs and Claude
Code preview browsers.

The canonical integration lives in `integration/next-app-router-wagmi`. The
demo app lives in `examples/next-demo`.

## Repository layout

```text
integration/
  next-app-router-wagmi/
examples/
  next-demo/
tools/
  preview-wallet/
INSTALL_AGENT.md
USE_AGENT.md
```

## Use this repo in two ways

### 1. Install into another app

Start with [INSTALL_AGENT.md](./INSTALL_AGENT.md).

That flow assumes:

- Next.js App Router
- existing `wagmi` + RainbowKit providers
- copy-based installation from this GitHub repo
- an in-built preview browser where you want a local injected wallet without a
  browser extension

The files an agent should copy live under
`integration/next-app-router-wagmi/`.

### 2. Run the reference demo

The demo proves the documented integration contract in a working app.

From the repository root:

```bash
npm install
npm run demo:install
npm run demo:dev
```

Or work directly in `examples/next-demo`:

```bash
cd examples/next-demo
npm install
npm run wallet:install
cp .env.local.example .env.local
npm run dev:wallet
```

## Verification

Useful local checks:

```bash
npm run demo:check
npm run wallet:check
```

Expected local endpoints while running:

- app: `http://localhost:3000`
- wallet health: `http://127.0.0.1:43199/health`
- wallet bundle: `http://127.0.0.1:43199/client.js`
