# Preview Wallet Tool

`tools/preview-wallet` is the local wallet sidecar used by the app at the repository root.

It provides:

- a local signer runtime
- an injected EIP-1193/EIP-6963 browser provider
- a Shadow DOM approval overlay

The tool is started from the app root with:

```bash
npm run wallet:start
```

It reads the app root `.env.local` via the `start` script, so there is no second env file under `tools/preview-wallet`.

Relevant env variables:

```bash
PREVIEW_WALLET_PRIVATE_KEY=0x...
PREVIEW_WALLET_NETWORK=sepolia
PREVIEW_WALLET_RPC_URL=https://sepolia.base.org
PREVIEW_WALLET_HOST=127.0.0.1
PREVIEW_WALLET_PORT=43199
```
