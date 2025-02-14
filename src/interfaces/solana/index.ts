export interface TokenDetails {
    address: string;
    decimals: number;
    supply: string;
    isInitialized: boolean;
    freezeAuthority: string | undefined;
    mintAuthority: string | undefined;
}

export interface TokenBalanceInfo {
    uiAmount: number | null;
    decimals: number;
    exists: boolean;
    address: string;
}