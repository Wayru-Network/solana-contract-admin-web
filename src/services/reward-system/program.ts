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

        const program = await getRewardSystemProgram(
            programId,
            publicKey
        );
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );
        const adminAccountState = await program.account.adminAccount.fetch(adminAccountPDA);
        return {
            adminCandidatePubkey: adminAccountState.adminCandidatePubkey.toString(),
            adminPubkey: adminAccountState.adminPubkey.toString(),
            adminUpdateRequested: adminAccountState.adminUpdateRequested,
            mintAuthorities: adminAccountState.mintAuthorities.map(authority => 
                authority.toString()
            ),
            paused: adminAccountState.paused,
            validMint: adminAccountState.validMint.toString(),
            contractTokenBalance: tokenBalance.uiAmount ?? 0
        }
    } catch (error) {
        console.log("error", error);
        return undefined;
    }
}
