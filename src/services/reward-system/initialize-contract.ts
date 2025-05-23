import { Provider } from "../../interfaces/phantom/phantom";
import { RewardSystem } from "../../interfaces/reward-system/reward_system";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { CONSTANTS } from "../../constants";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getTxStatus } from "../solana";
import { Program } from "@coral-xyz/anchor/dist/cjs/program";
import { getSolanaConnection } from "../solana/solana.connection";

interface InitializeContractProps {
    program: Program<RewardSystem>,
    provider: Provider;
    tokenMint: PublicKey;
    network?: keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]
}

export const initializeContract = async ({ program, provider, tokenMint, network }: InitializeContractProps) => {
    try {
        const connection = getSolanaConnection(network);

        const [adminAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );
        const [programDataAddress] = PublicKey.findProgramAddressSync(
            [program.programId.toBuffer()],
            CONSTANTS.BPF_UPGRADE_LOADER_ID
        );

        const accounts = {
            user: provider?.publicKey, 
            adminAccount: adminAccountPda,
            tokenMint: tokenMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            program: program.programId,
            programData: programDataAddress,
            systemProgram: SystemProgram.programId,
            mintAuthority: provider?.publicKey
        } as const

        const transaction = await program.methods
            .initializeSystem()
            .accounts(accounts)
            .transaction();

        // last block
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.feePayer = provider?.publicKey;
        if (!provider?.publicKey) {
            throw new Error("Provider public key not found");
        }
        const { signature } = await provider.signAndSendTransaction(transaction);

        // wait for confirmation
        const txStatus = await getTxStatus(signature, network as keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]);
        console.log("txStatus", txStatus);
        return txStatus;
    } catch (error) {
        console.error("Error initializing contract:", error);
        throw error;
    }
}