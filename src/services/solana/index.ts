import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getMint } from '@solana/spl-token';
import { CONSTANTS } from 'src/constants';

export const getTokenDetails = async (tokenAddress: string, network: keyof  CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]) => {
    const networkConnection = network === "mainnet" ? "mainnet-beta" : 'devnet';
    const connection = new Connection(clusterApiUrl(networkConnection), "confirmed");
    
    try {
        const tokenPublicKey = new PublicKey(tokenAddress);
        
        // get token info using getMint
        const tokenInfo = await getMint(
            connection,
            tokenPublicKey,
            'confirmed',
            TOKEN_PROGRAM_ID
        );
        
        return {
            address: tokenAddress,
            decimals: tokenInfo.decimals,
            supply: Number(tokenInfo.supply).toLocaleString(),
            isInitialized: !tokenInfo.isInitialized,
            freezeAuthority: tokenInfo.freezeAuthority?.toBase58(),
            mintAuthority: tokenInfo.mintAuthority?.toBase58()
        };
    } catch (error) {
        console.error('error getting token details:', error);
        return undefined;
    }
}

interface TransactionStatus {
    signature: string;
    status?: string;
    updated?: boolean;
}

export const getTxStatus = async (
    signature: string,
    network: keyof  CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"],
    maxRetries: number = 30
): Promise<TransactionStatus> => {
    const networkConnection = network === "mainnet" ? "mainnet-beta" : 'devnet';
    const connection = new Connection(clusterApiUrl(networkConnection), "confirmed");
    let status = await connection.getSignatureStatus(signature);
    let retries = maxRetries;

    while (retries > 0 && status.value?.confirmationStatus !== 'confirmed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        status = await connection.getSignatureStatus(signature);
        
        if (status.value?.err) {
            throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
        }
        
        retries--;
        if (retries === 0) {
            throw new Error('Transaction confirmation timeout');
        }
    }

    return {
        signature,
        status: status.value?.confirmationStatus
    };
};