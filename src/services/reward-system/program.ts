import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RewardSystem } from "@interfaces/reward-system/reward_system";
import { clusterApiUrl } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";

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