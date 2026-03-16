# Next App Router + wagmi Integration

This folder documents the package-based integration for an existing Next.js App
Router app that already uses `wagmi` and RainbowKit.

The integration is meant for embedded preview-browser workflows, especially
Cursor and Claude Code, where the app needs a local injected wallet without
depending on a browser extension.

## Install the package

From the target app root:

```bash
npm install @preview-wallet/wallet
```

Then merge the env entries from `.env.local.example` into the target app's
`.env.local`.

## Required App Wiring

In `app/layout.tsx`, render the host once near the top of `<body>`:

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

The target app must already have a working `wagmi` + RainbowKit provider stack.

## Required package.json scripts

Add this script to the target app root:

```json
{
  "scripts": {
    "wallet:start": "preview-wallet"
  }
}
```
