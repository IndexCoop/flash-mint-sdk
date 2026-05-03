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
      setAmounts: ['1', '10'],
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
    // uXRP2x / uXRP3x: deprecated post-disengage Morpho leverage products.
    // Issuance via FlashMintDexV5 0.45.1 overshoots the per-share equity buffer
    // at non-trivial setAmounts because the SetToken's stored external Morpho
    // position unit for uXRP has drifted vs the actual Morpho collateral; V3's
    // external getRequiredComponentIssuanceUnits returns balance-derived units
    // while issue() pulls position-derived units, so FlashMint runs short.
    // Redemption uses position-derived math in BOTH the external view AND the
    // internal pull, so it is unaffected — `redeemOnly: true` skips mint and
    // exercises redeem only, by impersonating the largest-holder whale and
    // transferring the SetToken to the taker before redeeming. The other 4
    // delevered products (uSOL2x/3x, uSUI2x/3x) still cover mint+redeem above.
    uXRP2x: {
      redeemOnly: true,
      whale: '0xaB8131FE3C0cB081630502ED26C89C51103E37ce',
      // Whale only holds ~0.011 uXRP2x — supply is tiny (~0.024). Use 0.01 to
      // leave a sliver as headroom across repeated test runs.
      setAmounts: ['0.01'],
      inputTokens: [
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'USDC', exchangeRate: 2000 },
        { symbol: 'cbBTC', exchangeRate: 0.05 },
      ],
    },
    uXRP3x: {
      redeemOnly: true,
      whale: '0x5E7732D6407C332cf91780DC084B36102cDeA094',
      // whale balance ~85 uXRP3x
      setAmounts: ['5'],
      inputTokens: [
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'USDC', exchangeRate: 2000 },
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
    ETH2X: {
      setAmounts: ['1', '10', '100'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 2000 },
        // { symbol: 'ETH', exchangeRate: 0.5 },
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
    ETH3X: {
      setAmounts: ['1', '10', '100'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 2000 },
        // { symbol: 'ETH', exchangeRate: 0.5 },
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
    wstETH15x: {
      setAmounts: ['1', '10'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 5000 },
        { symbol: 'ETH', exchangeRate: 2 },
        { symbol: 'WETH', exchangeRate: 2 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
    iETH1x: {
      setAmounts: ['1', '10'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 2 },
        { symbol: 'WETH', exchangeRate: 2 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
    iETH2x: {
      setAmounts: ['1', '10'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 2 },
        { symbol: 'WETH', exchangeRate: 2 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
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
    ETH2X: {
      setAmounts: ['1', '10', '100'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 600 },
        { symbol: 'ETH', exchangeRate: 0.2 },
        { symbol: 'WETH', exchangeRate: 0.2 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
    BTC2X: {
      setAmounts: ['1', '10', '20'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 1 },
        { symbol: 'WETH', exchangeRate: 1 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
    ETH3X: {
      setAmounts: ['1', '10', '100'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 300 },
        { symbol: 'ETH', exchangeRate: 0.1 },
        { symbol: 'WETH', exchangeRate: 0.1 },
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
    iETH1X: {
      setAmounts: ['1', '10', '20'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 2 },
        { symbol: 'WETH', exchangeRate: 2 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
    iBTC1X: {
      setAmounts: ['1', '10', '20'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 2 },
        { symbol: 'WETH', exchangeRate: 2 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
    BTC2xETH: {
      setAmounts: ['1', '10', '20'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 2 },
        { symbol: 'WETH', exchangeRate: 2 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
    ETH2xBTC: {
      setAmounts: ['1', '10', '20'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 2 },
        { symbol: 'WETH', exchangeRate: 2 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
    AAVE2x: {
      setAmounts: ['1'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'USD₮0', exchangeRate: 3000 },
        { symbol: 'WETH', exchangeRate: 1 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
        { symbol: 'AAVE', exchangeRate: 5 },
      ],
    },
    LINK2x: {
      setAmounts: ['1'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'USD₮0', exchangeRate: 3000 },
        { symbol: 'WETH', exchangeRate: 1 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
        { symbol: 'LINK', exchangeRate: 60 },
      ],
    },
    iETH2x: {
      setAmounts: ['1', '10', '20'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'ETH', exchangeRate: 2 },
        { symbol: 'WETH', exchangeRate: 2 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
      ],
    },
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
