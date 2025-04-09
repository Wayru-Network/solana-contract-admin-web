import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
import { CONSTANTS } from '../../constants';
import { TokenBalanceInfo } from '../../interfaces/solana';

export const getTokenDetails = async (
    tokenAddress: string, 
    network: keyof  CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"],
    programId: string
) => {
    const networkConnection = network === "mainnet" ? "mainnet-beta" : 'devnet';
    const connection = new Connection(clusterApiUrl(networkConnection), "confirmed");

    try {
        const tokenPublicKey = new PublicKey(tokenAddress);
        const programPublicKey = new PublicKey(programId);

        // get balance of the token in the contract
        const tokenBalance = await getTokenBalance(programPublicKey, tokenPublicKey, network);
        
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
            mintAuthority: tokenInfo.mintAuthority?.toBase58(),
            contractTokenBalance: Number(tokenBalance.uiAmount).toLocaleString() ?? 0
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

export const getTokenBalance = async (
    programId: PublicKey,
    mint: PublicKey,
    network: keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]
): Promise<TokenBalanceInfo> => {
    try {
        const networkConnection = network === "mainnet" ? "mainnet-beta" : 'devnet';
        const connection = new Connection(clusterApiUrl(networkConnection), "confirmed");

        // Get token storage PDA - Ensure seeds are exactly the same
        const [tokenStorageAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_storage")],
            new PublicKey(programId)
        );

        // Get storage account
        const storageAccount = await getAssociatedTokenAddress(
            mint,
            tokenStorageAuthority,
            true
        );
 
        // check if the storage account exists
        const accountInfo = await connection.getAccountInfo(storageAccount);
        
        if (!accountInfo) {
            return {
                uiAmount: 0,
                decimals: 0,
                exists: false,
                address: storageAccount.toString()
            };
        }

        const balance = await connection.getTokenAccountBalance(storageAccount);
        
        return {
            uiAmount: balance.value.uiAmount,
            decimals: balance.value.decimals,
            exists: true,
            address: storageAccount.toString()
        };
    } catch (error) {
        console.error("Error in getTokenBalance:", error);
        throw error;
    }
};