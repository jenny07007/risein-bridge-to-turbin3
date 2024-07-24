import dynamic from "next/dynamic";
import { FC } from "react";

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

export const AppBar: FC = () => {
  return (
    <div className="flex w-full justify-end ">
      <WalletMultiButton />
    </div>
  );
};
