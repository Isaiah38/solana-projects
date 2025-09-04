use anchor_lang::prelude::*;

declare_id!("9WhKeR5Gc6SLQmA9t9vEnmH5bx57VSTNk19eAorGMTqL");

#[program]
pub mod sol_shop {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
