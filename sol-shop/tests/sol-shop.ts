import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolShop } from "../target/types/sol_shop";

describe("sol-shop", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.solShop as Program<SolShop>;
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  it("Is initialized!", async () => {
    // Add your test here.
    const tx_sig = await program.methods.initialize().rpc();
    const tx = await provider.connection.getTransaction(tx_sig, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    console.log(tx.meta.logMessages);
  });
});
