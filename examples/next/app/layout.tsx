import type { ReactNode } from "react";

import PreviewWalletHost from "./PreviewWalletHost";

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
