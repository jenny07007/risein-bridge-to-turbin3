import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import wallet from "./dev-wallet.json";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const mint_address = new PublicKey(
  "FjvLium4q6Whd4rdcvpYQnA5EGwxW7rVtYR7NVHREcRj",
);

(async () => {
  try {
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint_address,
      keypair.publicKey,
    );
    const tokenAccountAddress = ata.address;

    const txSig = await mintTo(
      connection,
      keypair,
      mint_address,
      tokenAccountAddress,
      keypair.publicKey,
      100e6,
    );

    console.log("Transaction Signature: ", txSig);
  } catch (err) {
    console.error(`Oops, something went wrong: ${err}`);
  }
})();
