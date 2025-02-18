interface AccountState {
    adminCandidatePubkey: string;
    adminPubkey: string;
    adminUpdateRequested: boolean;
    mintAuthorities: string[];
    paused: boolean;
    validMint: string;
}

export type AdminAccountState = AccountState | null;

export type ContractDetails = AccountState & {
    contractTokenBalance: string;
    programDetails: {
        programId: string;
        upgradeAuthority: string | null;
        executable: boolean;
    }
}
