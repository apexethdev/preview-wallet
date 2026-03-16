export function createPreviewWalletServer(options?: {
  host?: string;
  port?: number;
}): {
  host: string;
  port: number;
  runtime: unknown;
  server: import("node:http").Server;
};

export function startPreviewWalletServer(options?: {
  host?: string;
  port?: number;
}): Promise<{
  host: string;
  port: number;
  runtime: unknown;
  server: import("node:http").Server;
}>;
