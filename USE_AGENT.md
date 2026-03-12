# Preview Wallet Usage Notes for Agents

Use this after installation to operate the local wallet sidecar in a target app.

The intended use case is local wallet interaction inside embedded preview
browsers, especially environments like Cursor and Claude Code where browser
extensions are unavailable or inconvenient.

## Daily commands

From the target app root:

```bash
npm run wallet:start
npm run wallet:check
```

Run the app dev server separately unless the app already has a combined local
development script.

`npm run wallet:check` validates the sidecar files with `node --check`, runs the
runtime test suite, and confirms the install artifact under
`integration/next-app-router-wagmi/tools/preview-wallet` matches the canonical
tool source. A passing run exits with code `0` and no mismatch errors.

## Expected behavior

- The wallet sidecar exposes `/health`, `/state`, and `/client.js`.
- When the app loads in development, `PreviewWalletHost` injects the wallet
  bundle from `NEXT_PUBLIC_PREVIEW_WALLET_URL`.
- RainbowKit should discover a wallet named `Preview Wallet`.
- After connecting, signing a message or approving a transaction should open the
  floating wallet overlay within about 1 second.

## Shutdown

- Stopping the `wallet:start` process disables the local signer and approval UI.
- If the app keeps running while the sidecar is down, the browser host retries
  loading the wallet bundle automatically when the sidecar comes back.
