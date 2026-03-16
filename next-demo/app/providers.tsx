"use client";

// Standard wagmi + RainbowKit provider setup.
// No preview-wallet-specific configuration is needed here — the wallet
// registers itself via EIP-6963 provider discovery and is picked up by
// RainbowKit automatically.

import * as React from "react";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID &&
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID !== "preview-wallet-dev"
    ? process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    : "YOUR_PROJECT_ID";

const config = getDefaultConfig({
  appName: "Preview Wallet",
  projectId: walletConnectProjectId,
  chains: [baseSepolia, base],
  ssr: true,
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
