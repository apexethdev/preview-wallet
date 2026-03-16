# Preview Wallet Install Recipe for Agents

This document is the canonical installation recipe for wiring
`@preview-wallet/wallet` into an existing Next.js App Router app that already
uses `wagmi` and RainbowKit.

## Supported target

- Next.js App Router
- existing `wagmi` + RainbowKit provider setup
- Node.js 20+ recommended
- npm-based project layout
- embedded preview-browser workflows such as Cursor and Claude Code

Do not use this v1 flow for Pages Router apps or apps without an existing
RainbowKit/wagmi setup.

## Install steps

### 1. Install the package

From the target app root:

```bash
npm install @preview-wallet/wallet
```

### 2. Merge env values into the target app

Append these entries to `<target-app>/.env.local`:

```bash
NEXT_PUBLIC_PREVIEW_WALLET_ENABLED=true
NEXT_PUBLIC_PREVIEW_WALLET_URL=http://127.0.0.1:43199/client.js

PREVIEW_WALLET_PRIVATE_KEY=0xYOUR_DEV_PRIVATE_KEY_64_HEX_CHARS
PREVIEW_WALLET_NETWORK=sepolia
PREVIEW_WALLET_RPC_URL=https://sepolia.base.org
```

Optional overrides:

```bash
# PREVIEW_WALLET_HOST=127.0.0.1
# PREVIEW_WALLET_PORT=43199
```

Use a disposable dev-only private key. `PREVIEW_WALLET_NETWORK=sepolia` means
Base Sepolia.

### 3. Add app scripts

Merge this script into `<target-app>/package.json`:

```json
{
  "scripts": {
    "wallet:start": "preview-wallet"
  }
}
```

If the target app already has a combined local dev script, append `wallet:start`
to that flow. Otherwise run the app dev server and `npm run wallet:start`
separately.

### 4. Wire the React host into the App Router layout

Render the package export once near the top of `<body>`:

```tsx
import { PreviewWalletHost } from "@preview-wallet/wallet/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PreviewWalletHost />
        {children}
      </body>
    </html>
  );
}
```

Do not add a second `wagmi` or RainbowKit provider.

### 5. Start the app and sidecar

From `<target-app>`:

```bash
npm run dev
npm run wallet:start
```

Expected local endpoints:

- app: `http://localhost:3000`
- wallet health: `http://127.0.0.1:43199/health`
- wallet bundle: `http://127.0.0.1:43199/client.js`

### 6. Verify success

Confirm all of the following:

1. `http://127.0.0.1:43199/health` returns `{"ok":true,...}`.
2. `http://127.0.0.1:43199/client.js` responds with JavaScript.
3. The target app loads with no script errors.
4. RainbowKit shows a `Preview Wallet` option.
5. Connecting succeeds.
6. A sign-message action opens the approval overlay within about 1 second.

## Failure handling

### Sidecar not reachable

- Confirm `npm run wallet:start` is still running.
- Confirm `PREVIEW_WALLET_PORT` matches `NEXT_PUBLIC_PREVIEW_WALLET_URL`.
- Check `http://127.0.0.1:43199/health` directly.

### Missing env vars

- Missing `NEXT_PUBLIC_PREVIEW_WALLET_ENABLED` or `NEXT_PUBLIC_PREVIEW_WALLET_URL` means the browser host will not load the wallet bundle.
- Missing `PREVIEW_WALLET_PRIVATE_KEY` or `PREVIEW_WALLET_RPC_URL` means the sidecar will start but report an unconfigured state.
- `PREVIEW_WALLET_NETWORK` only supports `sepolia` in v1, which means Base Sepolia.

### Wallet not showing in RainbowKit

- Confirm the app already has working `wagmi` + RainbowKit providers.
- Confirm `PreviewWalletHost` is rendered in the root App Router layout.
- Confirm the browser successfully loads `NEXT_PUBLIC_PREVIEW_WALLET_URL`.
- Confirm `NEXT_PUBLIC_PREVIEW_WALLET_ENABLED=true`.
- Restart the Next.js dev server after adding or changing `NEXT_PUBLIC_*` values.
