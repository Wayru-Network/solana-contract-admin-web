import { Connection, Commitment, clusterApiUrl } from '@solana/web3.js';
import { CONSTANTS } from '../../constants';

/**
 * Singleton class to manage Solana RPC connection
 * Provides a single reusable connection instance with automatic renewal
 */
class SolanaConnection {
    private static instance: Connection | null = null;
    private static lastInitTime: number = 0;
    private static readonly RECONNECT_INTERVAL = 1000 * 60 * 30; // 30 minutes

    private constructor() {} // Private constructor for Singleton pattern

    /**
     * Gets the Solana connection instance
     * Creates a new connection if none exists or if the current one is older than RECONNECT_INTERVAL
     * @returns {Connection} The Solana connection instance
     */
    public static getInstance(network?: keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]): Connection {
        const currentTime = Date.now();

        // Create new connection if none exists or if it's time to renew
        if (!SolanaConnection.instance || (currentTime - SolanaConnection.lastInitTime) > SolanaConnection.RECONNECT_INTERVAL) {
            const connectionEndpoint = network === "mainnet"
            ? import.meta.env.VITE_SOLANA_MAINNET_RPC_URL || ""
            : clusterApiUrl('devnet');

            SolanaConnection.instance = new Connection(connectionEndpoint, {
                commitment: 'confirmed',
                disableRetryOnRateLimit: false,
                confirmTransactionInitialTimeout: 60000
            });
            SolanaConnection.lastInitTime = currentTime;
        }

        return SolanaConnection.instance;
    }

    /**
     * Forces creation of a new connection instance
     * Useful when current connection is having issues
     */
    public static resetConnection(): void {
        SolanaConnection.instance = null;
        SolanaConnection.getInstance();
    }
}

/**
 * Helper function to get a Solana connection with optional commitment level
 * @param {Commitment} commitment - Optional commitment level for the connection
 * @returns {Connection} Solana connection instance
 */
export const getSolanaConnection = (network?: keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"], commitment?: Commitment): Connection => {
    const connection = SolanaConnection.getInstance(network);
    if (commitment) {
        return new Connection(connection.rpcEndpoint, { commitment });
    }
    return connection;
};