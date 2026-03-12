# Preview Wallet Tool

`tools/preview-wallet` is the local wallet sidecar used by the demo app in
`examples/next-demo`.

It provides:

- a local signer runtime
- an injected EIP-1193/EIP-6963 browser provider
- a Shadow DOM approval overlay

For public installation into another app, copy the canonical sidecar from
`integration/next-app-router-wagmi/tools/preview-wallet`.

The demo sidecar is started from the repository root with:

```bash
npm run wallet:start
```

It reads `examples/next-demo/.env.local` via the `start` script so the demo app
and sidecar use the same env file.

Relevant env variables:

```bash
PREVIEW_WALLET_PRIVATE_KEY=0x...
PREVIEW_WALLET_NETWORK=sepolia
PREVIEW_WALLET_RPC_URL=https://sepolia.base.org
PREVIEW_WALLET_HOST=127.0.0.1
PREVIEW_WALLET_PORT=43199
```
