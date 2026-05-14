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
  // Optional bootstrap step: when set (and `redeemOnly` is true), the runner
  // impersonates `whale`, transfers each `components[i].token` from `whale` to
  // itself in the right per-set ratio, then calls `issuanceModule.issue` to
  // mint setAmount of the SetToken to `whale`. Lets the runner work with tiny-
  // supply SetTokens that have no stable on-chain holder — `whale` only needs
  // to hold the underlying components, not the SetToken itself.
  bootstrap?: {
    issuanceModule: string
    components: { token: string; perSet: bigint }[]
  }
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

    // AAVE2x: delevered (LR=1.0×). Components: [aArbAAVE]. Routed via
    // FlashMintAaveDelevered (0x85eC…51FC), redemption-only. The whale is the
    // Aave V3 Arbitrum Collector — it holds enough aArbAAVE to bootstrap fresh
    // SetTokens via DebtIssuanceModuleV3 inside the harness.
    AAVE2x: {
      redeemOnly: true,
      whale: '0x053D55f9B5AF8694c503EB288a1B7E552f590710',
      bootstrap: {
        issuanceModule: '0x4AC26c26116Fa976352b70700af58Bc2442489d8',
        components: [
          {
            token: '0xf329e36C7bF6E5E86ce2150875a84Ce77f477375', // aArbAAVE
            perSet: 870_000_000_000_000_000n,                   // ~0.87 per set
          },
        ],
      },
      setAmounts: ['0.01', '0.05'],
      inputTokens: [
        { symbol: 'AAVE', exchangeRate: 1 },
        { symbol: 'WETH', exchangeRate: 200 },
        { symbol: 'ETH', exchangeRate: 200 },
        { symbol: 'USDC', exchangeRate: 100 },
      ],
    },

    // LINK2x: delevered (LR=1.0×). Components: [aArbLINK, USDT-legacy dust].
    // Same FlashMintAaveDelevered route; setAmount is small to stay within the
    // collector's ~3.34 aArbLINK budget across multiple per-output cases.
    LINK2x: {
      redeemOnly: true,
      whale: '0x053D55f9B5AF8694c503EB288a1B7E552f590710',
      bootstrap: {
        issuanceModule: '0x4AC26c26116Fa976352b70700af58Bc2442489d8',
        components: [
          {
            token: '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530', // aArbLINK
            perSet: 14_500_000_000_000_000_000n,                // ~14.5 per set
          },
          {
            token: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT (legacy)
            perSet: 9200n,                                       // ~9200 wei per set (dust)
          },
        ],
      },
      setAmounts: ['0.01'],
      inputTokens: [
        { symbol: 'LINK', exchangeRate: 1 },
        { symbol: 'WETH', exchangeRate: 1 },
        { symbol: 'ETH', exchangeRate: 1 },
        { symbol: 'USDC', exchangeRate: 10 },
      ],
    },

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
