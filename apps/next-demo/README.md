# Preview Wallet Demo

This app is the reference consumer for the published `@preview-wallet/wallet`
package.

It uses:

- the published `preview-wallet` CLI to run the local sidecar
- the `@preview-wallet/wallet/react` export for the browser host
- the same env contract external adopters use in their own app

## Start the demo

Install workspace dependencies once from the repository root:

```bash
npm install
```

Then run the demo from `apps/next-demo`:

```bash
cd apps/next-demo
cp .env.local.example .env.local
```

The app runs on `http://localhost:3000`.

The wallet sidecar reads the same local `.env.local` file, so the demo only
needs one env file.

Start the app and wallet in separate terminals from `apps/next-demo`:

```bash
npm run dev
npm run wallet:start
```

The demo uses `next dev --webpack` for local development to avoid current
Turbopack instability in this repo layout.

## Use In Another App

For an existing Next.js App Router app that already uses `wagmi` and
RainbowKit:

1. Install the package:

```bash
npm install @preview-wallet/wallet
```

2. Add env values to the target app's `.env.local`:

```bash
NEXT_PUBLIC_PREVIEW_WALLET_ENABLED=true
NEXT_PUBLIC_PREVIEW_WALLET_URL=http://127.0.0.1:43199/client.js

PREVIEW_WALLET_PRIVATE_KEY=0xYOUR_DEV_PRIVATE_KEY_64_HEX_CHARS
PREVIEW_WALLET_NETWORK=sepolia
PREVIEW_WALLET_RPC_URL=https://sepolia.base.org
```

Optional:

```bash
# PREVIEW_WALLET_HOST=127.0.0.1
# PREVIEW_WALLET_PORT=43199
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
```

3. Render the React host once near the top of the App Router layout body:

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

4. Add a script to the target app:

```json
{
  "scripts": {
    "wallet:start": "preview-wallet"
  }
}
```

5. Start the app and wallet in separate terminals:

```bash
npm run dev
npm run wallet:start
```

Expected local endpoints:

- app: `http://localhost:3000`
- wallet health: `http://127.0.0.1:43199/health`
- wallet bundle: `http://127.0.0.1:43199/client.js`

## WalletConnect / Reown project ID

The demo now reads `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` from `.env.local`.

If you do not set it, the app falls back to RainbowKit's sample project ID so
the local demo can connect without a 403 from Reown config fetches.

If you already have your own WalletConnect Cloud or Reown project, set:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
```
