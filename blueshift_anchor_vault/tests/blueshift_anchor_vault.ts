import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BlueshiftAnchorVault } from "../target/types/blueshift_anchor_vault";
import { assert } from "chai";

describe("blueshift_anchor_vault", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .BlueshiftAnchorVault as Program<BlueshiftAnchorVault>;

  const signer = provider.wallet;
  let vaultPda: PublicKey;
  let vaultBump: number;

  before(async () => {
    // Derive the vault PDA
    [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), signer.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initializes program", async () => {
    const tx = await program.methods.initialize().rpc();
    console.log("Initialize tx:", tx);
  });

  it("Deposits into vault", async () => {
    const depositAmount = 0.1 * LAMPORTS_PER_SOL;

    await program.methods
      .deposit(new anchor.BN(depositAmount))
      .accounts({
        signer: signer.publicKey,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Fetch balance of vault
    const vaultBalance = await provider.connection.getBalance(vaultPda);
    assert.equal(vaultBalance, depositAmount);
  });

  it("Withdraws from vault", async () => {
    const preSignerBalance = await provider.connection.getBalance(
      signer.publicKey
    );
    const vaultBalance = await provider.connection.getBalance(vaultPda);

    await program.methods
      .withdraw()
      .accounts({
        signer: signer.publicKey,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const postSignerBalance = await provider.connection.getBalance(
      signer.publicKey
    );
    const finalVaultBalance = await provider.connection.getBalance(vaultPda);

    // Vault should be emptied
    assert.equal(finalVaultBalance, 0);

    // Signer balance should increase (minus rent/fees)
    assert.isAbove(postSignerBalance, preSignerBalance);
    assert.isAtLeast(postSignerBalance, preSignerBalance + vaultBalance - 5000); // allow small fee drift
  });
});
