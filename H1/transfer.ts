import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import wallet from "./dev-wallet.json";
const sender = Keypair.fromSecretKey(new Uint8Array(wallet));
const recipient = new PublicKey("DsrE3jGUeo58Qx4pppQJ2bdiqAxmdxY9DoEDWxcDS481");

(async () => {
  try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    let balance = await connection.getBalance(sender.publicKey);
    console.log(`Sender Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    const transaction = SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: recipient,
      lamports: 1 * LAMPORTS_PER_SOL,
    });

    const tx = new Transaction().add(transaction);
    tx.feePayer = sender.publicKey;
    const txSignature = await sendAndConfirmTransaction(
      connection,
      tx,
      [sender],
      { commitment: "confirmed", skipPreflight: true },
    );

    // const signature = await connection.sendTransaction(transaction, [sender]);
    console.log(
      `Success! Check out your TX here: https://explorer.solana.com/tx/${txSignature}?cluster=devnet`,
    );

    balance = await connection.getBalance(sender.publicKey);
    console.log(`Sender Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  } catch (err) {
    console.error(`Oops, something went wrong: ${err}`);
  }
})();
