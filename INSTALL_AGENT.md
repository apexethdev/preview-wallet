# Preview Wallet Install Recipe for Agents

This document is the canonical installation recipe for wiring Preview Wallet
into an existing Next.js App Router app that already uses `wagmi` and
RainbowKit.

This integration is designed for in-built preview-browser workflows where a
normal browser wallet extension is not practical, including Cursor preview tabs
and Claude Code preview browsers.

## Supported target

- Next.js App Router
- Existing `wagmi` + RainbowKit provider setup
- Node.js 20+ recommended
- npm-based project layout
- Preview-browser workflows inside coding tools such as Cursor or Claude Code

Do not use this v1 flow for Pages Router apps or apps without an existing
RainbowKit/wagmi setup.

Most examples below use `app/`, but many production apps use `src/app/`.

Use whichever matches the target app:

- `app/PreviewWalletHost.tsx` and `app/layout.tsx`
- `src/app/PreviewWalletHost.tsx` and `src/app/layout.tsx`

The integration is the same either way. Only the file paths change.

## Source repo inputs

Assume the public repository has already been cloned locally. Use these source
paths from the cloned repo:

```text
integration/next-app-router-wagmi/app/PreviewWalletHost.tsx
integration/next-app-router-wagmi/tools/preview-wallet/
integration/next-app-router-wagmi/.env.local.example
```

## Install steps

### 1. Copy files into the target app

Copy:

```text
<repo>/integration/next-app-router-wagmi/app/PreviewWalletHost.tsx -> <target-app>/app/PreviewWalletHost.tsx
<repo>/integration/next-app-router-wagmi/tools/preview-wallet -> <target-app>/tools/preview-wallet
```

Do not rename the copied `tools/preview-wallet` folder in v1.

If the target app uses `src/app`, copy the host file to
`<target-app>/src/app/PreviewWalletHost.tsx` instead.

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

Use a disposable dev-only private key.

`PREVIEW_WALLET_NETWORK=sepolia` means Base Sepolia.

`NEXT_PUBLIC_*` values are compiled into the app bundle, so restart the Next.js
dev server after adding or changing them.

### 3. Add package scripts to the target app root

Merge these scripts into `<target-app>/package.json`:

```json
{
  "scripts": {
    "wallet:install": "npm --prefix tools/preview-wallet install",
    "wallet:start": "npm --prefix tools/preview-wallet start",
    "wallet:check": "npm --prefix tools/preview-wallet run check"
  }
}
```

Inspect the target app's `package.json` before editing scripts.

If the target app already has a combined dev script that starts multiple local
processes, append `wallet:start` to that combined flow. Otherwise keep the app
dev server and `npm run wallet:start` as separate commands.

### 4. Wire the host into the target app layout

Edit `<target-app>/app/layout.tsx` and render the host once near the top of the
body:

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

Do not add a second `wagmi` or RainbowKit provider. This integration assumes
the target app already has that stack.

If the target app uses `src/app`, make the same change in
`<target-app>/src/app/layout.tsx` instead.

### 5. Install sidecar dependencies

From `<target-app>`:

```bash
npm run wallet:install
```

### 6. Start the app and sidecar

From `<target-app>`:

```bash
npm run dev
npm run wallet:start
```

Expected local endpoints:

- app: `http://localhost:3000`
- wallet health: `http://127.0.0.1:43199/health`
- wallet bundle: `http://127.0.0.1:43199/client.js`

### 7. Verify success

Confirm all of the following:

1. `http://127.0.0.1:43199/health` returns `{"ok":true,...}`.
2. `http://127.0.0.1:43199/client.js` responds with JavaScript.
3. The target app loads with no script errors.
4. RainbowKit shows a `Preview Wallet` option.
5. Connecting succeeds.
6. A sign-message action opens the approval overlay within about 1 second.

Use this as the canonical smoke test:

1. Open the app in an embedded preview browser.
2. Open the RainbowKit connect modal.
3. Confirm `Preview Wallet` appears in the wallet list.
4. Connect `Preview Wallet`.
5. Navigate to a page that performs a real wallet action, such as sign message.
6. Trigger signing.
7. Confirm the Preview Wallet approval overlay appears.
8. Approve the request.
9. Confirm the app advances into the expected connected or signed-in state.

This is a stronger verification path than checking only `/health` and
`/client.js`.

## Failure handling

### Sidecar not reachable

- Confirm `npm run wallet:start` is still running.
- Confirm `PREVIEW_WALLET_PORT` matches the `NEXT_PUBLIC_PREVIEW_WALLET_URL`.
- Check `http://127.0.0.1:43199/health` directly.

### Missing env vars

- Missing `NEXT_PUBLIC_PREVIEW_WALLET_ENABLED` or `NEXT_PUBLIC_PREVIEW_WALLET_URL` means the browser host will not load the wallet bundle.
- Missing `PREVIEW_WALLET_PRIVATE_KEY` or `PREVIEW_WALLET_RPC_URL` means the sidecar will start but report an unconfigured state.
- `PREVIEW_WALLET_NETWORK` only supports `sepolia` in v1, which means Base Sepolia.

### Port already in use

- Set `PREVIEW_WALLET_PORT` to another local port.
- Update `NEXT_PUBLIC_PREVIEW_WALLET_URL` to the same port.
- Restart both the app and the sidecar.

### Wallet not showing in RainbowKit

- Confirm the app already has working `wagmi` + RainbowKit providers.
- Confirm `PreviewWalletHost` is rendered in the root App Router layout, either `app/layout.tsx` or `src/app/layout.tsx`.
- Confirm the browser successfully loads `NEXT_PUBLIC_PREVIEW_WALLET_URL`.
- Confirm `NEXT_PUBLIC_PREVIEW_WALLET_ENABLED=true`.
- Restart the Next.js dev server after adding or changing `NEXT_PUBLIC_*` values.

### Unsupported target app

- If the target app uses Pages Router or has no existing `wagmi`/RainbowKit setup, stop and use a different integration path. This repo does not support that flow in v1.
