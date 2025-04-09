import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RewardSystem } from "../../interfaces/reward-system/reward_system";
import { clusterApiUrl } from "@solana/web3.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { ContractDetails } from "../../interfaces/reward-system/program";
import { getTokenBalance } from "../solana";
import { CONSTANTS } from "../../constants";

export const getRewardSystemProgram = async (rewardSystemProgramId: string, publicKey: string | anchor.web3.PublicKey) => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Ensure publicKey is a valid PublicKey object
    const walletPublicKey = typeof publicKey === 'string'
        ? new anchor.web3.PublicKey(publicKey)
        : publicKey;

    const provider = new anchor.AnchorProvider(
        connection,
        {
            publicKey: walletPublicKey,
            signTransaction: async () => { throw new Error('Signing not supported') },
            signAllTransactions: async () => { throw new Error('Signing not supported') }
        },
        { commitment: "confirmed" }
    );

    const programId = new anchor.web3.PublicKey(rewardSystemProgramId);

    //only for dev net because it required fee
    const idl = await anchor.Program.fetchIdl(programId, provider);
    if (!idl) throw new Error("IDL not found");

    const program = await anchor.Program.at(
        programId,
        provider
    ) as Program<RewardSystem>;

    return program;
}


interface getAdminAccountStateProps {
    programId: string;
    publicKey: string | anchor.web3.PublicKey;
    network: keyof  CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"];
    tokenId: string;
}
export const getContractDetails = async ({ programId, publicKey, network, tokenId }: getAdminAccountStateProps): Promise<ContractDetails | undefined> => {
    try {
        const tokenBalance = await getTokenBalance(publicKey as PublicKey, new PublicKey(tokenId), network);
        const connection = new Connection(clusterApiUrl(network === 'mainnet' ? 'mainnet-beta' : 'devnet'));

        // Get the program details
        let programAccount;
        let upgradeAuthority = null;
        let adminAccountState = null;
        
        try {
            programAccount = await connection.getParsedAccountInfo(new PublicKey(programId));
            
            if (programAccount.value) {
                const programDataAddress = await PublicKey.findProgramAddress(
                    [new PublicKey(programId).toBuffer()],
                    new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
                );
                
                try {
                    const programDataAccount = await connection.getAccountInfo(programDataAddress[0]);
                    if (programDataAccount && programDataAccount.data.length >= 45) {
                        upgradeAuthority = new PublicKey(programDataAccount.data.slice(13, 45)).toString();
                    }
                } catch (e) {
                    console.log("Error getting upgrade authority:", e);
                }
            }
        } catch (e) {
            console.log("Error getting program account:", e);
        }

        try {
            const program = await getRewardSystemProgram(
                programId,
                publicKey
            );
            
            const [adminAccountPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("admin_account")],
                program.programId
            );

            try {
                adminAccountState = await program.account.adminAccount.fetch(adminAccountPDA);
            } catch (e) {
                console.log("Error fetching admin account:", e);
            }
        } catch (e) {
            console.log("Error getting reward system program:", e);
        }

        // If we cannot get the admin account state, return partial information
        return {
            adminCandidatePubkey: adminAccountState?.adminCandidatePubkey?.toString() ?? "Not available",
            adminPubkey: adminAccountState?.adminPubkey?.toString() ?? "Not available",
            adminUpdateRequested: adminAccountState?.adminUpdateRequested ?? false,
            mintAuthorities: adminAccountState?.mintAuthorities?.map(authority => 
                authority.toString()
            ) ?? [],
            paused: adminAccountState?.paused ?? false,
            validMint: adminAccountState?.validMint?.toString() ?? "Not available",
            contractTokenBalance: tokenBalance.uiAmount?.toLocaleString() ?? "0",
            programDetails: {
                programId: programId,
                upgradeAuthority: upgradeAuthority,
                executable: programAccount?.value?.executable ?? false,
            }
        }
    } catch (error) {
        console.log("error", error);
        return undefined;
    }
}
