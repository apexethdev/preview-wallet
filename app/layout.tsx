import type { ReactNode } from "react";

import PreviewWalletHost from "./PreviewWalletHost";
import "./globals.css";

export const metadata = {
  title: "Preview Wallet In-Repo Example",
  description: "Next.js app with a colocated preview wallet tool.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PreviewWalletHost />
        {children}
      </body>
    </html>
  );
}
