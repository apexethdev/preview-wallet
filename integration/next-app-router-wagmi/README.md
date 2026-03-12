# Next App Router + wagmi Integration

This folder is the canonical source an agent should copy into an existing
Next.js App Router app that already uses `wagmi` and RainbowKit.

The integration is meant for embedded preview-browser workflows, especially
Cursor and Claude Code, where the app needs a local injected wallet without
depending on a browser extension.

## Copy Targets

Copy these paths into the target app:

```text
integration/next-app-router-wagmi/app/PreviewWalletHost.tsx -> app/PreviewWalletHost.tsx
integration/next-app-router-wagmi/tools/preview-wallet -> tools/preview-wallet
```

Then merge the env entries from
`integration/next-app-router-wagmi/.env.local.example` into the target app's
`.env.local`.

## Required App Wiring

In `app/layout.tsx`, render the host once near the top of `<body>`:

```tsx
import PreviewWalletHost from "./PreviewWalletHost";

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

Add these scripts to the target app root:

```json
{
  "scripts": {
    "wallet:install": "npm --prefix tools/preview-wallet install",
    "wallet:start": "npm --prefix tools/preview-wallet start",
    "wallet:check": "npm --prefix tools/preview-wallet run check"
  }
}
```
