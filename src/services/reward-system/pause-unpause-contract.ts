import { Program } from "@coral-xyz/anchor/dist/cjs/program";

import { clusterApiUrl, PublicKey, Transaction } from "@solana/web3.js";
import { CONSTANTS } from "../../constants/index";
import { Connection } from "@solana/web3.js";
import { RewardSystem } from "../../interfaces/reward-system/reward_system";
import { Provider } from "../../interfaces/phantom/phantom";
import { getTxStatus } from "../solana";

interface PauseUnpauseContractProps {
    program: Program<RewardSystem>,
    provider: Provider;
    pause: boolean;
    network: keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"];
}

export const pauseUnpauseContract = async ({ program, provider, pause, network }: PauseUnpauseContractProps) => {
    try {
        const networkConnection = network === "mainnet" ? "mainnet-beta" : 'devnet';
        const connection = new Connection(clusterApiUrl(networkConnection), "confirmed");
        const [adminAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin_account")],
            program.programId
        );
        let transaction = new Transaction();
        const accounts = {
            user: provider.publicKey,
            adminAccount: adminAccountPDA,
        } as const

        if (pause) {
            transaction = await program.methods.pauseProgram()
                .accounts(accounts)
                .transaction();
        } else {
            transaction = await program.methods.unpauseProgram()
                .accounts(accounts)
                .transaction();
        }

        // last block
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.feePayer = provider.publicKey;

        const { signature } = await provider.signAndSendTransaction(transaction);

        // wait for confirmation
        const txStatus = await getTxStatus(signature, network as keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]);
        return txStatus;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

