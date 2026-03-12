# Preview Wallet

Local development wallet sidecar for Next.js and other browser apps.

Preview Wallet exposes:

- a local signer runtime
- an injected EIP-1193/EIP-6963 browser provider
- a Shadow DOM approval overlay

The private key stays in the local runtime process. The browser bundle only gets provider behavior.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.local.example .env.local
```

3. Fill in `.env.local`:

```bash
PREVIEW_WALLET_PRIVATE_KEY=0x...
NEXT_PUBLIC_NETWORK=sepolia
BSEP_RPC_URL=https://sepolia.base.org
```

4. Start the sidecar:

```bash
npm start
```

Default endpoints:

- `http://127.0.0.1:43199/health`
- `http://127.0.0.1:43199/client.js`

## Consuming From A Next.js App

In the app repo:

- add a tiny client host component that loads `NEXT_PUBLIC_PREVIEW_WALLET_URL`
- gate it behind `NEXT_PUBLIC_PREVIEW_WALLET_ENABLED=true`
- start the app and this repo together in local dev

See [`examples/next`](./examples/next) for the minimal host pattern.
