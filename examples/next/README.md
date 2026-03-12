# Next.js Example

This folder shows the minimal host pattern for a Next.js app.

## App Env

```bash
NEXT_PUBLIC_PREVIEW_WALLET_ENABLED=true
NEXT_PUBLIC_PREVIEW_WALLET_URL=http://127.0.0.1:43199/client.js
```

## App Shell

Render the host component once near the root layout or provider tree.

The app does not own signer logic, approval UI, or wallet RPC routes. It only loads the browser bundle.
