import type { ReactNode } from "react";

// 1. Import the PreviewWalletHost component from the package.
//    This client component loads the wallet's browser script from the local
//    sidecar server and handles retry/cleanup automatically. It renders nothing
//    visible — it only injects the EIP-1193 / EIP-6963 provider so that
//    RainbowKit (or any wagmi-based UI) discovers the wallet.
import { PreviewWalletHost } from "@apexethdev/preview-wallet/react";
import Providers from "./providers";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

export const metadata = {
  title: "Preview Wallet Demo",
  description: "Example Next.js App Router app wired to the preview wallet integration.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* 2. Place PreviewWalletHost before your providers so the injected
               wallet provider is available when wagmi/RainbowKit initialise.
               It is gated by NEXT_PUBLIC_PREVIEW_WALLET_ENABLED and will
               no-op in production builds. */}
        <PreviewWalletHost />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
