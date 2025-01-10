import { generateKeyPairSigner } from "@solana/web3.js";

(async () => {
  try {
    const keypair = await generateKeyPairSigner();

    console.log(`You've generated a new Solana wallet: ${keypair.address}`);
    // console.log(`Solana Wallet Secret Key: [${keypair.secretKey}]`);
  } catch (err) {
    console.error(`Oops, something went wrong: ${err}`);
  }
})();
