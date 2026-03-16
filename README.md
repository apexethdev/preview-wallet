# Preview Wallet

A local wallet sidecar for Next.js apps running in preview browsers (Cursor,
Claude Code) where browser extensions are unavailable.

The reference integration uses wagmi + RainbowKit, but the underlying provider
implements EIP-1193 and EIP-6963 — so it should work with any wallet framework
that supports standard provider discovery (e.g. ConnectKit, Web3Modal, or plain
wagmi).

```bash
npm install @apexethdev/preview-wallet
```

## Demo

This repo includes a working reference app in `next-demo/` that consumes the
published package. It demonstrates the full integration: wallet sidecar,
injected browser provider, RainbowKit connection, and message signing — all
without a browser extension.

```bash
npm install
cd next-demo
cp .env.local.example .env.local

# terminal 1
npm run dev

# terminal 2
npm run wallet:start
```

The app runs at `http://localhost:3000` and the wallet sidecar at
`http://127.0.0.1:43199`.

## Integrate into your own app

See [next-demo/README.md](./next-demo/README.md) for step-by-step instructions
on adding the package to an existing Next.js + wagmi + RainbowKit app.

## Repository layout

```
packages/preview-wallet/   # published npm package
next-demo/                  # reference integration app
```
