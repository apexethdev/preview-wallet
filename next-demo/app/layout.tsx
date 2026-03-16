import type { ReactNode } from "react";

import { PreviewWalletHost } from "@preview-wallet/wallet/react";
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
        <PreviewWalletHost />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
