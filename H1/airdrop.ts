import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  lamports,
  createKeyPairSignerFromBytes,
  createKeyPairFromPrivateKeyBytes,
  createKeyPairSignerFromPrivateKeyBytes,
} from "@solana/web3.js";
import wallet from "./dev-wallet.json";

const rpc = createSolanaRpc("http://localhost:8899");
const rpcSubscriptions = createSolanaRpcSubscriptions(
  "ws://api.devnet.solana.com",
);

(async () => {
  const keypair = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
  console.log(keypair);
  try {
    const txhash = await rpc
      .requestAirdrop(keypair.address, lamports(BigInt(10e9)))
      .send();

    console.log(`Success! Check out your TX here:
        https://explorer.solana.com/tx/${txhash}?cluster=custom&customUrl=127.0.0.1:8899`);
  } catch (err) {
    console.error(`Oops, something went wrong: ${err}`);
  }
})();
