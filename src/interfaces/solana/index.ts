export interface TokenDetails {
    address: string;
    decimals: number;
    supply: string;
    isInitialized: boolean;
    freezeAuthority: string | undefined;
    mintAuthority: string | undefined;
    contractTokenBalance?: string;
}

export interface TokenBalanceInfo {
    uiAmount: number | null;
    decimals: number;
    exists: boolean;
    address: string;
}

export interface TransactionStatus {
    signature: string;
    status?: 'processed' | 'confirmed' | 'finalized';
    updated?: boolean;
}