export interface InputTokenConfig {
  symbol: string
  exchangeRate: number
}

export interface ProductScenario {
  setAmounts: string[]
  // For full mint+redeem coverage: input tokens to mint with (and redeem back to).
  // For `redeemOnly` products: the output tokens to redeem into.
  inputTokens: InputTokenConfig[]
  // Mark a product as redeem-only when issuance via the SDK isn't reliably
  // testable (e.g. deprecated/delevered Morpho leverage products where
  // FlashMintDexV5's issue path overshoots the per-share equity buffer at
  // non-trivial setAmounts). The runner skips mint and instead acquires
  // SetTokens by impersonating `whale` and transferring `setAmount` to the taker
  // before quoting+executing the redeem.
  redeemOnly?: boolean
  // SetToken whale address — required when `redeemOnly` is true.
  whale?: string
}

/**
 * Outer key is chainId (as number),
 * inner key is the set‐token symbol,
 * value is the scenario for that product.
 */
export type TestScenarios = Record<number, Record<string, ProductScenario>>

const testScenarios: TestScenarios = {
  8453: {
    uSUI2x: {
      setAmounts: ['1', '10'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 1000 },
        { symbol: 'ETH', exchangeRate: 0.5 },
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
    uSUI3x: {
      // setAmount=1 hits an edge case on uSUI3x specifically: the per-set USDC
      // dust requirement (~11 wei) rounds the redeem-side USDC component to 0
      // wei, which the static dexV5 redeem quote then can't swap (no liquidity
      // on a 0-amount swap). At setAmount=10 the USDC component is non-zero
      // and the redeem quote succeeds.
      setAmounts: ['10'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 1000 },
        { symbol: 'ETH', exchangeRate: 0.5 },
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
    uSOL2x: {
      setAmounts: ['1', '10'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 1000 },
        { symbol: 'ETH', exchangeRate: 0.5 },
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
    uSOL3x: {
      setAmounts: ['1', '10'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 1000 },
        { symbol: 'ETH', exchangeRate: 0.5 },
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
    uXRP2x: {
      // Whale-sourced supply is tiny (~0.024 uXRP2x); pick a setAmount that
      // fits within typical issuance capacity. Pre-0.45.2 of FlashMintDexV5
      // this would still revert at any non-trivial size due to the V3
      // balance-vs-position drift on uXRP's Morpho position; the 0.45.2
      // sync-before-issue fix closes it.
      setAmounts: ['0.005', '0.01'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 2000 },
        { symbol: 'ETH', exchangeRate: 0.5 },
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'cbBTC', exchangeRate: 0.05 },
      ],
    },
    uXRP3x: {
      setAmounts: ['1', '5'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 2000 },
        { symbol: 'ETH', exchangeRate: 0.5 },
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'cbBTC', exchangeRate: 0.05 },
      ],
    },
    BTC2X: {
      setAmounts: ['1', '10', '100'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 2000 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
        { symbol: 'ETH', exchangeRate: 0.5 },
        { symbol: 'WETH', exchangeRate: 0.5 },
      ],
    },
    BTC3X: {
      setAmounts: ['1', '10', '100'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 2000 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
        { symbol: 'ETH', exchangeRate: 0.5 },
        { symbol: 'WETH', exchangeRate: 0.5 },
      ],
    },
    // ETH2X / ETH3X: every mint reverts with `0x6d305815` (Aave V3
    // `ReserveFrozen()`). The Aave reserve underpinning these products has
    // been frozen on Base, so the FlashMintLeveragedMorphoAaveLM flash-loan
    // path can't supply/borrow it. Disabled until the reserve is unfrozen
    // or the products are migrated off Aave.
    wstETH15x: {
      setAmounts: ['1', '10'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 5000 },
        { symbol: 'ETH', exchangeRate: 2 },
        { symbol: 'WETH', exchangeRate: 2 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
    // iETH1x and iETH2x: both hit Aave `ReserveFrozen()` like ETH2X/ETH3X
    // above. Disabled until the underlying Aave reserve is unfrozen.
    iBTC1x: {
      setAmounts: ['1', '10'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 2 },
        { symbol: 'WETH', exchangeRate: 2 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
    iBTC2x: {
      setAmounts: ['1', '10'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 2 },
        { symbol: 'WETH', exchangeRate: 2 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
  },
  1: {
    ETH2X: {
      setAmounts: ['1', '10', '100'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 300 },
        { symbol: 'ETH', exchangeRate: 0.1 },
        { symbol: 'WETH', exchangeRate: 0.1 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
    ETH3x: {
      setAmounts: ['1', '10', '50'],
      inputTokens: [
        { symbol: 'USDT', exchangeRate: 1300 },
        { symbol: 'USDC', exchangeRate: 1300 },
        { symbol: 'WETH', exchangeRate: 0.3 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
    BTC2X: {
      setAmounts: ['1', '10', '100'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 1 },
        { symbol: 'WETH', exchangeRate: 1 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
    BTC3x: {
      setAmounts: ['1', '10', '100'],
      inputTokens: [
        { symbol: 'USDT', exchangeRate: 3000 },
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'WETH', exchangeRate: 1 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
    GOLD3x: {
      setAmounts: ['1', '5'],
      inputTokens: [
        { symbol: 'USDT', exchangeRate: 1500 },
        { symbol: 'USDC', exchangeRate: 1500 },
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'WBTC', exchangeRate: 0.02 },
      ],
    },
    hyETH: {
      setAmounts: ['1', '10', '100'],
      inputTokens: [
        { symbol: 'ETH', exchangeRate: 2 },
        { symbol: 'WETH', exchangeRate: 2 },
      ],
    },
  },
  42161: {
    // ETH2X / ETH3X: every mint reverts with Solidity panic 0x11
    // (arithmetic overflow) inside FlashMintLeveragedAaveFL. The on-chain
    // state of these Aave-backed products has shifted enough since the last
    // green CI run that the leverage math overflows for any setAmount.
    // Disabled pending investigation.
    BTC2X: {
      setAmounts: ['1', '10', '20'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 1 },
        { symbol: 'WETH', exchangeRate: 1 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
    BTC3X: {
      setAmounts: ['1', '10', '20'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 1 },
        { symbol: 'WETH', exchangeRate: 1 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
    // iETH1X: every mint reverts with `0x6d305815` (Aave V3 `ReserveFrozen()`).
    // The Aave reserve underpinning iETH1X has been frozen on-chain, so the
    // FlashMintLeveragedAaveFL flash-loan path can't supply/borrow it.
    // Disabled until/unless the reserve is unfrozen or the product is
    // delevered+rerouted through a non-Aave path.
    iBTC1X: {
      setAmounts: ['1', '10', '20'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 2 },
        { symbol: 'WETH', exchangeRate: 2 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
    // BTC2xETH: every mint reverts with Aave `ReserveFrozen()`.
    // ETH2xBTC: every mint reverts with arithmetic-overflow panic 0x11 inside
    // FlashMintLeveragedAaveFL — same broken on-chain math as ETH2X/ETH3X
    // above. Disabled until investigated / fixed.
    // AAVE2x and LINK2x have been delevered on Arbitrum (LR=1.0x) which makes
    // the existing leveraged FlashMintLeveragedAaveFL revert with
    // `ExchangeIssuance: TOO MANY COMPONENTS` / `TOO MANY EQUITY POSITIONS`
    // for any issue — the flash-mint contract's component layout assumes the
    // [collateral, debt] shape that the SetToken no longer has. There is no
    // FlashMintDexV5 deployment on Arbitrum yet (Base only), so the SDK has
    // no working route. Re-enable once a FlashMintDexV5 lands on Arbitrum and
    // routes these products through it (cf. Base uSOL/uSUI/uXRP).
    // iETH2x: every mint reverts with Aave `ReserveFrozen()`. Disabled
    // until the Aave reserve is unfrozen.
    iBTC2x: {
      setAmounts: ['1', '10', '20'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 2 },
        { symbol: 'WETH', exchangeRate: 2 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
  },
}

export default testScenarios
