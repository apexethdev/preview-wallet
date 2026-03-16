# @preview-wallet/wallet

`@preview-wallet/wallet` is the published npm package that powers the local
wallet sidecar and browser integration.

It provides:

- a local signer runtime
- an injected EIP-1193/EIP-6963 browser provider
- a Shadow DOM approval overlay
- a `preview-wallet` CLI for starting the local server
- a `PreviewWalletHost` React export for Next.js apps

## Consumer usage

Install the package via npm:

```bash
npm install @preview-wallet/wallet
```

Start the sidecar:

```bash
preview-wallet
```

Render the browser host in a client-capable Next.js layout:

```tsx
import { PreviewWalletHost } from "@preview-wallet/wallet/react";
```

Relevant env variables:

```bash
NEXT_PUBLIC_PREVIEW_WALLET_ENABLED=true
NEXT_PUBLIC_PREVIEW_WALLET_URL=http://127.0.0.1:43199/client.js

PREVIEW_WALLET_PRIVATE_KEY=0x...
PREVIEW_WALLET_NETWORK=sepolia
PREVIEW_WALLET_RPC_URL=https://sepolia.base.org
PREVIEW_WALLET_HOST=127.0.0.1
PREVIEW_WALLET_PORT=43199
```
