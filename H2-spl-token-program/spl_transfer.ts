import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import wallet from "./dev-wallet.json";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const mint_address = new PublicKey(
  "FjvLium4q6Whd4rdcvpYQnA5EGwxW7rVtYR7NVHREcRj",
);

const to_address = new PublicKey(
  "DsrE3jGUeo58Qx4pppQJ2bdiqAxmdxY9DoEDWxcDS481",
);

(async () => {
  try {
    let from_ata = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint_address,
      keypair.publicKey,
    );

    let to_ata = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint_address,
      to_address,
    );

    const txSig = await transfer(
      connection,
      keypair,
      from_ata.address,
      to_ata.address,
      keypair.publicKey,
      10e6,
    );

    console.log("Transaction Signature: ", txSig);
  } catch (err) {
    console.error(`Oops, something went wrong: ${err}`);
  }
})();
