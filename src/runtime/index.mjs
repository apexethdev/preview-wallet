import { randomUUID } from "node:crypto";
import {
  createPublicClient,
  createWalletClient,
  formatEther,
  hexToNumber,
  http,
  isAddress,
  isHex,
  numberToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

const REQUEST_TIMEOUT_MS = 5 * 60 * 1000;

function rpcError(code, message, data) {
  return { code, message, data };
}

function getConfiguredChain() {
  const network = process.env.NEXT_PUBLIC_NETWORK || "mainnet";
  return network === "sepolia" ? baseSepolia : base;
}

function getRpcUrl(chain) {
  if (chain.id === baseSepolia.id) {
    return process.env.BSEP_RPC_URL || process.env.BASE_RPC_URL;
  }
  return process.env.BASE_RPC_URL;
}

function normalizeChainId(chainId) {
  return typeof chainId === "number"
    ? chainId
    : chainId.startsWith("0x")
      ? hexToNumber(chainId)
      : Number(chainId);
}

function normalizePersonalSignParams(params) {
  const [first, second] = params || [];
  const isAccount = (value) =>
    typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value);

  if (isAccount(first) && typeof second === "string") {
    return { message: second, address: first.toLowerCase() };
  }
  if (isAccount(second) && typeof first === "string") {
    return { message: first, address: second.toLowerCase() };
  }
  return {
    message: typeof first === "string" ? first : "",
    address: typeof second === "string" ? second.toLowerCase() : undefined,
  };
}

function toSignableMessage(message) {
  if (typeof message === "string" && isHex(message)) {
    return { raw: message };
  }

  return message;
}

function normalizeTransactionRequest(value) {
  if (!value || typeof value !== "object") {
    throw rpcError(32602, "Invalid transaction request");
  }

  const request = { ...value };
  for (const field of ["gas", "gasPrice", "maxFeePerGas", "maxPriorityFeePerGas", "value"]) {
    if (typeof request[field] === "string") {
      request[field] = request[field].startsWith("0x")
        ? BigInt(request[field])
        : BigInt(Number(request[field]));
    }
  }

  if (typeof request.nonce === "string") {
    request.nonce = request.nonce.startsWith("0x")
      ? Number(BigInt(request.nonce))
      : Number(request.nonce);
  }

  return request;
}

function truncateMiddle(value, start = 6, end = 4) {
  if (!value || value.length <= start + end) return value || "";
  return `${value.slice(0, start)}...${value.slice(-end)}`;
}

function summarizeRequest(method, params, address) {
  if (method === "personal_sign") {
    const { message } = normalizePersonalSignParams(params);
    return {
      summary: "Approve message signature",
      details: [
        {
          label: "Message",
          value: message.length > 120 ? `${message.slice(0, 117)}...` : message,
        },
      ],
    };
  }

  if (method === "eth_signTypedData_v4") {
    const [, typedData] = params;
    const payload = typeof typedData === "string" ? JSON.parse(typedData) : typedData;
    const primaryType =
      typeof payload?.primaryType === "string" ? payload.primaryType : "Typed data";
    return {
      summary: `Approve ${primaryType} typed signature`,
      details: [
        { label: "Type", value: primaryType },
        { label: "Signer", value: truncateMiddle(address) },
      ],
    };
  }

  const [transaction] = params;
  const request = normalizeTransactionRequest(transaction);
  return {
    summary: request.to
      ? `Approve transaction to ${truncateMiddle(request.to)}`
      : "Approve transaction",
    details: [
      { label: "From", value: truncateMiddle(address) },
      ...(request.to ? [{ label: "To", value: truncateMiddle(request.to) }] : []),
      { label: "Value", value: request.value ? `${formatEther(request.value)} ETH` : "0 ETH" },
      ...(request.data ? [{ label: "Data", value: `${request.data.slice(0, 18)}...` }] : []),
    ],
  };
}

export class PreviewWalletRuntime {
  constructor() {
    this.chain = getConfiguredChain();
    this.rpcUrl = getRpcUrl(this.chain);
    this.privateKey = process.env.PREVIEW_WALLET_PRIVATE_KEY;
    this.pendingRequests = new Map();
    this.connected = false;
  }

  get enabled() {
    return Boolean(
      this.privateKey &&
        isHex(this.privateKey) &&
        this.privateKey.length === 66 &&
        this.rpcUrl
    );
  }

  get account() {
    if (!this.enabled) {
      return null;
    }
    return privateKeyToAccount(this.privateKey);
  }

  get publicClient() {
    if (!this.rpcUrl) {
      throw rpcError(5000, "RPC URL is not configured");
    }

    return createPublicClient({
      chain: this.chain,
      transport: http(this.rpcUrl),
    });
  }

  get walletClient() {
    const account = this.account;
    if (!account) {
      throw rpcError(5000, "PREVIEW_WALLET_PRIVATE_KEY is missing or invalid");
    }

    return createWalletClient({
      account,
      chain: this.chain,
      transport: http(this.rpcUrl),
    });
  }

  getState() {
    return {
      enabled: this.enabled,
      configured: Boolean(this.account),
      connected: this.connected,
      address: this.account?.address ?? null,
      chainId: this.chain.id,
      chainName: this.chain.name,
      pendingRequests: [...this.pendingRequests.values()].map((request) => ({
        id: request.id,
        method: request.method,
        summary: request.summary,
        details: request.details,
        createdAt: request.createdAt,
      })),
      error: this.enabled ? null : "Preview Wallet is not configured.",
    };
  }

  requireEnabled() {
    if (!this.enabled) {
      throw rpcError(503, "Preview Wallet is not configured");
    }
  }

  requireConnected(address) {
    this.requireEnabled();
    if (!this.connected || !this.account) {
      throw rpcError(4100, "Preview Wallet is not connected");
    }
    if (address && address.toLowerCase() !== this.account.address.toLowerCase()) {
      throw rpcError(4100, "Requested account does not match Preview Wallet");
    }
  }

  queueApproval(method, params, execute) {
    this.requireConnected(
      method === "personal_sign"
        ? normalizePersonalSignParams(params).address
        : Array.isArray(params) && params[0]?.from
    );

    return new Promise((resolve, reject) => {
      const id = randomUUID();
      const { summary, details } = summarizeRequest(method, params, this.account.address);
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(rpcError(4001, "Approval request expired"));
      }, REQUEST_TIMEOUT_MS);

      this.pendingRequests.set(id, {
        id,
        method,
        summary,
        details,
        createdAt: new Date().toISOString(),
        timeout,
        execute,
        resolve,
        reject,
      });
    });
  }

  async approveRequest(id) {
    const request = this.pendingRequests.get(id);
    if (!request) {
      throw rpcError(404, "Pending request not found");
    }

    this.pendingRequests.delete(id);
    clearTimeout(request.timeout);

    try {
      const result = await request.execute();
      request.resolve(result);
      return this.getState();
    } catch (error) {
      request.reject(error?.code ? error : rpcError(5000, error?.message || "Approval failed"));
      return this.getState();
    }
  }

  async rejectRequest(id, message = "User rejected the request") {
    const request = this.pendingRequests.get(id);
    if (!request) {
      throw rpcError(404, "Pending request not found");
    }

    this.pendingRequests.delete(id);
    clearTimeout(request.timeout);
    request.reject(rpcError(4001, message));
    return this.getState();
  }

  async handleRpc({ method, params = [] }) {
    this.requireEnabled();

    switch (method) {
      case "wallet_requestPermissions":
        this.connected = true;
        return [{ parentCapability: "eth_accounts" }];
      case "wallet_revokePermissions":
        this.connected = false;
        return null;
      case "eth_requestAccounts":
        this.connected = true;
        return [this.account.address];
      case "eth_accounts":
        return this.connected ? [this.account.address] : [];
      case "eth_chainId":
        return numberToHex(this.chain.id);
      case "net_version":
        return String(this.chain.id);
      case "wallet_switchEthereumChain": {
        const requestedChainId = normalizeChainId(params?.[0]?.chainId);
        if (requestedChainId !== this.chain.id) {
          throw rpcError(4902, `${params?.[0]?.chainId} is not configured`);
        }
        return null;
      }
      case "wallet_addEthereumChain": {
        const requestedChainId = normalizeChainId(params?.[0]?.chainId);
        if (requestedChainId !== this.chain.id) {
          throw rpcError(4902, `${params?.[0]?.chainId} is not configured`);
        }
        return null;
      }
      case "eth_blockNumber":
        return numberToHex(await this.publicClient.getBlockNumber());
      case "eth_getBalance":
        return numberToHex(
          await this.publicClient.getBalance({
            address: isAddress(params?.[0]) ? params[0] : this.account.address,
          })
        );
      case "eth_getTransactionReceipt": {
        const receipt = await this.publicClient.getTransactionReceipt({ hash: params?.[0] });
        return receipt ?? null;
      }
      case "eth_call":
        return await this.publicClient.call(params?.[0] || {});
      case "eth_estimateGas": {
        const request = normalizeTransactionRequest(params?.[0]);
        this.requireConnected(request.from);
        return numberToHex(
          await this.publicClient.estimateGas({
            account: this.account,
            ...request,
          })
        );
      }
      case "personal_sign":
        return this.queueApproval(method, params, async () => {
          const { message } = normalizePersonalSignParams(params);
          return this.walletClient.signMessage({
            account: this.account,
            message: toSignableMessage(message),
          });
        });
      case "eth_signTypedData_v4":
        return this.queueApproval(method, params, async () => {
          const [, typedData] = params;
          const payload = typeof typedData === "string" ? JSON.parse(typedData) : typedData;
          return this.walletClient.signTypedData({
            account: this.account,
            domain: payload.domain || {},
            types: payload.types || {},
            primaryType: payload.primaryType,
            message: payload.message || {},
          });
        });
      case "eth_sendTransaction":
        return this.queueApproval(method, params, async () => {
          const request = normalizeTransactionRequest(params?.[0]);
          this.requireConnected(request.from);
          return this.walletClient.sendTransaction({
            account: this.account,
            ...request,
          });
        });
      default:
        throw rpcError(4200, `Unsupported method: ${method}`);
    }
  }
}
