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
      // setAmount=1 reverts upstream in DebtIssuanceModuleV3 (not in
      // FlashMintDexV5). The V3 module computes the position-based USDC
      // transfer quantity, which lands at ≤ `tokenTransferBuffer` (10 wei)
      // for uSUI3x at setAmount=1. The internal `_resolveEquityPositions`
      // then computes `componentQuantity - tokenTransferBuffer` raw (no
      // SafeMath in 0.6.10), underflows to ~MaxUint256, and SetToken's
      // `invokeTransfer(USDC, FM, MaxUint256)` reverts with `ERC20: transfer
      // amount exceeds balance`. Fix would require an upstream
      // DebtIssuanceModuleV3 patch (governance change). Use setAmount=5+ to
      // stay above the buffer.
      setAmounts: ['5', '10'],
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
    // ETH2X / ETH3x: every mint reverts with `0x5b263df7` (Aave V3
    // `LtvValidationFailed()`) inside FlashMintLeveragedAaveFL. The Aave
    // reserve LTV cap on the underlying collateral has been tightened on
    // mainnet such that the leverage strategy can no longer supply the
    // amount needed for issuance. Disabled until/unless the LTV cap is
    // raised again or the products are migrated off Aave.
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
      // GOLD3x via WETH (FixedInput specifically) reverts with
      // `SafeERC20: low-level call failed` at both setAmounts. The other
      // input tokens (USDT / USDC / WBTC) work fine. Dropped WETH from the
      // matrix; revisit if the underlying WETH path on mainnet is fixed.
      setAmounts: ['1', '5'],
      inputTokens: [
        { symbol: 'USDT', exchangeRate: 1500 },
        { symbol: 'USDC', exchangeRate: 1500 },
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
    //
    // AAVE2x and LINK2x: delevered (LR=1.0x), aTokens-as-components shape that
    // the leveraged FlashMint can't handle. Now routed via the SDK through a
    // small `AaveV3DeleveredRedeemer` contract on Arbitrum which calls
    // DebtIssuanceModuleV3.redeem then Aave V3 Pool.withdraw to deliver the
    // underlying (AAVE / LINK + USDT dust on LINK2x). Redemption-only —
    // issuance not supported. The redeem path is covered end-to-end by the
    // AaveV3DeleveredRedeemer integration spec in the SC repo
    // (test/integration/arbitrum/aaveV3DeleveredRedeemer.spec.ts in
    // index-coop-smart-contracts#226). Not added to the SDK e2e harness here
    // because `redeemOnly` mode requires a SetToken whale, and AAVE2x/LINK2x
    // total supplies are tiny (0.155 / 1.51 sets) so a stable on-chain whale
    // is hard to pin without extending the harness with a "bootstrap via V3
    // module issuance" mode. Defer until/unless we want SDK-side e2e here.
    //
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
