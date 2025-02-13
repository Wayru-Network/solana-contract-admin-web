import { PublicKey, Transaction } from "@solana/web3.js";

export interface Provider {
  isPhantom: boolean;
  publicKey: PublicKey;
  isConnected: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, encoding?: string) => Promise<{ signature: Uint8Array }>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signAndSendTransaction: (transaction: Transaction, options?: any) => Promise<{ signature: string }>;
  signAndSendAllTransactions: (transactions: Transaction[], options?: any) => Promise<{ signatures: string[] }>;
  signIn: (options?: any) => Promise<any>;
  request: (params: { method: string; params: any }) => Promise<any>;
  on: (event: 'connect' | 'disconnect' | 'accountChanged', handler: (args: any) => void) => void;
  removeAllListeners: (event: string) => void;
}
// ... existing code ...