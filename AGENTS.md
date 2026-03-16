# Preview Wallet — Agent Integration Guide

This repo contains `@apexethdev/preview-wallet`, an npm package that provides a
local wallet sidecar for Next.js apps using wagmi + RainbowKit. It targets
in-built preview browsers (Cursor, Claude Code) where browser extensions are
unavailable.

## Integrating into a Next.js app

### 1. Install

```bash
npm install @apexethdev/preview-wallet
```

### 2. Add env variables to `.env.local`

```bash
# Required — browser-visible
NEXT_PUBLIC_PREVIEW_WALLET_ENABLED=true
NEXT_PUBLIC_PREVIEW_WALLET_URL=http://127.0.0.1:43199/client.js

# Required — sidecar (server-only, never prefixed with NEXT_PUBLIC_)
PREVIEW_WALLET_PRIVATE_KEY=0xYOUR_DEV_PRIVATE_KEY_64_HEX_CHARS
PREVIEW_WALLET_NETWORK=sepolia
PREVIEW_WALLET_RPC_URL=https://sepolia.base.org
```

### 3. Add `<PreviewWalletHost />` to the root layout

Place it **before** providers in the `<body>` so the injected wallet is
available when wagmi/RainbowKit initialise. No changes to providers or wagmi
config are needed — the wallet announces itself via EIP-6963 and is discovered
automatically.

```tsx
import { PreviewWalletHost } from "@apexethdev/preview-wallet/react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PreviewWalletHost />
        {/* existing providers / children */}
      </body>
    </html>
  );
}
```

### 4. Add a `wallet:start` script to `package.json`

```json
{
  "scripts": {
    "wallet:start": "preview-wallet"
  }
}
```

### 5. Run in two terminals

```bash
npm run dev           # Next.js app
npm run wallet:start  # wallet sidecar
```

## Key points

- **No wagmi/RainbowKit config changes** — the wallet registers via EIP-6963
  provider discovery. Existing provider setup works as-is.
- `PreviewWalletHost` renders nothing visible. It loads a script from the
  sidecar that injects the wallet provider and a small Shadow DOM approval
  overlay.
- The component is gated by `NEXT_PUBLIC_PREVIEW_WALLET_ENABLED` and
  `NODE_ENV !== "production"` — it will no-op in production builds.
- The sidecar CLI (`preview-wallet`) reads env variables from `.env.local`
  automatically.

## Reference implementation

`next-demo/` is a complete working integration. Key files:

- `next-demo/app/layout.tsx` — where `PreviewWalletHost` is rendered (annotated)
- `next-demo/app/providers.tsx` — standard wagmi + RainbowKit setup (no
  preview-wallet changes)
- `next-demo/.env.local.example` — env variable template

## Repository structure

```
packages/preview-wallet/   # published npm package source
next-demo/                  # reference Next.js app consuming the package
```

## Development commands

```bash
npm install          # install workspace deps (from repo root)
npm run start:demo   # start Next.js demo
npm run start:wallet # start wallet sidecar
npm run demo:check   # lint/typecheck demo
npm run wallet:check # lint/typecheck package
```
