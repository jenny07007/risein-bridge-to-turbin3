import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import wallet from "./dev-wallet.json";
const sender = Keypair.fromSecretKey(new Uint8Array(wallet));
const recipient = Keypair.generate();
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

(async () => {
  try {
    console.log(
      "We're going empty our wallet and send all the sol to this wallet: ",
      recipient.publicKey.toBase58(),
    );

    // Get balance and fetch the recent blockhash
    const balance = await connection.getBalance(sender.publicKey);
    const blockhash = (await connection.getLatestBlockhash("confirmed"))
      .blockhash;

    // Create a new transaction to transfer the entire balance to the recipient
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: recipient.publicKey,
        lamports: balance,
      }),
    );

    // Set the fee payer and recent blockhash for the transaction
    transaction.feePayer = sender.publicKey;
    transaction.recentBlockhash = blockhash;

    // Estimate the transaction fee
    const fee =
      (await connection.getFeeForMessage(transaction.compileMessage())).value ||
      0;

    // Remove the initial transfer instruction
    transaction.instructions.pop();

    // Add a new transfer instruction with the balance - fee
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: recipient.publicKey,
        lamports: balance - fee,
      }),
    );

    // The preflight step simulates the transaction to catch errors before actually sending it. Set to true to save time in this case.
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [sender],
      { commitment: "confirmed", skipPreflight: true },
    );
    console.log(
      `Success! Check out your TX here: https://explorer.solana.com/tx/${txSignature}?cluster=devnet`,
    );
  } catch (err) {
    console.error(`Oops, something went wrong: ${err}`);
  }
})();
