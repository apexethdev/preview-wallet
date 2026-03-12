# Preview Wallet Example App

This repository now represents a Next.js app with a colocated wallet sidecar at `tools/preview-wallet`.

The app owns the root `.env.local`. The wallet remains a separate local process, but it loads the same root env file instead of keeping a second wallet-specific env file.

## Layout

```text
app/
tools/
  preview-wallet/
.env.local
package.json
```

## Setup

1. Install the app dependencies:

```bash
npm install
```

2. Install the wallet tool dependencies:

```bash
npm run wallet:install
```

3. Create the app-root env file:

```bash
cp .env.local.example .env.local
```

4. Fill in `.env.local`:

```bash
NEXT_PUBLIC_PREVIEW_WALLET_ENABLED=true
NEXT_PUBLIC_PREVIEW_WALLET_URL=http://127.0.0.1:43199/client.js

PREVIEW_WALLET_PRIVATE_KEY=0x...
PREVIEW_WALLET_NETWORK=sepolia
PREVIEW_WALLET_RPC_URL=https://sepolia.base.org
```

5. Start both processes together:

```bash
npm run dev:wallet
```

Or start them separately:

```bash
npm run dev
npm run wallet:start
```

## How It Works

- The Next app loads `NEXT_PUBLIC_PREVIEW_WALLET_URL` in development.
- The sidecar runs from `tools/preview-wallet`.
- The private key stays in the wallet runtime process, not in the browser bundle.
- The wallet exposes:
  - `http://127.0.0.1:43199/health`
  - `http://127.0.0.1:43199/client.js`

For wallet internals, see [`tools/preview-wallet/README.md`](./tools/preview-wallet/README.md).
