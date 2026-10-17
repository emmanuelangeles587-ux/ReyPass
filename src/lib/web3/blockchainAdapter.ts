import { createPublicClient, http, formatEther, isAddress, parseEther } from 'viem';
import { mainnet, polygon, arbitrum, optimism, base, sepolia } from 'viem/chains';

export interface NetworkConfig {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
}

export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  1: { id: 1, name: 'Ethereum Mainnet', symbol: 'ETH', rpcUrl: 'https://cloudflare-eth.com', explorerUrl: 'https://etherscan.io' },
  137: { id: 137, name: 'Polygon PoS', symbol: 'POL', rpcUrl: 'https://polygon-rpc.com', explorerUrl: 'https://polygonscan.com' },
  8453: { id: 8453, name: 'Base Mainnet', symbol: 'ETH', rpcUrl: 'https://mainnet.base.org', explorerUrl: 'https://basescan.org' },
  42161: { id: 42161, name: 'Arbitrum One', symbol: 'ETH', rpcUrl: 'https://arb1.arbitrum.io/rpc', explorerUrl: 'https://arbiscan.io' },
  11155111: { id: 11155111, name: 'Sepolia Testnet', symbol: 'ETH', rpcUrl: 'https://rpc.sepolia.org', explorerUrl: 'https://sepolia.etherscan.io' }
};

export interface TransactionVerificationResult {
  verified: boolean;
  blockNumber?: number;
  confirmations?: number;
  from?: string;
  to?: string;
  amountEth?: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'UNKNOWN';
  error?: string;
}

export class BlockchainAdapter {
  private chainId: number;

  constructor(chainId: number = 137) {
    this.chainId = chainId;
  }

  private getViemChain(chainId: number) {
    switch (chainId) {
      case 1: return mainnet;
      case 137: return polygon;
      case 8453: return base;
      case 42161: return arbitrum;
      case 11155111: return sepolia;
      default: return polygon;
    }
  }

  public getClient() {
    const chain = this.getViemChain(this.chainId);
    return createPublicClient({
      chain,
      transport: http()
    });
  }

  public async getBalance(address: string): Promise<string> {
    if (!isAddress(address)) throw new Error('Dirección de wallet inválida');
    const client = this.getClient();
    const balance = await client.getBalance({ address: address as `0x${string}` });
    return formatEther(balance);
  }

  public async verifyTransaction(
    txHash: string,
    expectedRecipient?: string,
    expectedAmountEth?: number
  ): Promise<TransactionVerificationResult> {
    try {
      const client = this.getClient();
      const tx = await client.getTransaction({ hash: txHash as `0x${string}` });
      if (!tx) {
        return { verified: false, status: 'UNKNOWN', error: 'Transacción no encontrada en mempool' };
      }

      const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
      if (!receipt) {
        return { verified: false, status: 'PENDING' };
      }

      const currentBlock = await client.getBlockNumber();
      const confirmations = Number(currentBlock - receipt.blockNumber);
      const amountEth = formatEther(tx.value);
      const status = receipt.status === 'success' ? 'CONFIRMED' : 'FAILED';

      let verified = receipt.status === 'success';

      if (expectedRecipient && tx.to?.toLowerCase() !== expectedRecipient.toLowerCase()) {
        verified = false;
      }

      if (expectedAmountEth && Math.abs(Number(amountEth) - expectedAmountEth) > 0.0001) {
        verified = false;
      }

      return {
        verified,
        blockNumber: Number(receipt.blockNumber),
        confirmations,
        from: tx.from,
        to: tx.to || undefined,
        amountEth,
        status
      };
    } catch (err: any) {
      return {
        verified: false,
        status: 'FAILED',
        error: err.message || 'Error consultando nodo RPC'
      };
    }
  }

  public getExplorerTxUrl(txHash: string): string {
    const net = SUPPORTED_NETWORKS[this.chainId] || SUPPORTED_NETWORKS[137];
    return `${net.explorerUrl}/tx/${txHash}`;
  }
}
