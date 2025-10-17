export interface InputTokenConfig {
  symbol: string
  exchangeRate: number
}

export interface ProductScenario {
  setAmounts: string[]
  inputTokens: InputTokenConfig[]
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
      setAmounts: ['1', '10', '20'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 1000 },
        { symbol: 'ETH', exchangeRate: 0.5 },
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
    uSUI3x: {
      setAmounts: ['1', '10', '20'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 1000 },
        { symbol: 'ETH', exchangeRate: 0.5 },
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
    uSOL2x: {
      setAmounts: ['1', '10', '20'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 1000 },
        { symbol: 'ETH', exchangeRate: 0.5 },
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
    uSOL3x: {
      setAmounts: ['1', '10', '20'],
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 1000 },
        { symbol: 'ETH', exchangeRate: 0.5 },
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'cbBTC', exchangeRate: 0.1 },
      ],
    },
    uXRP2x: {
      setAmounts: ['1', '5'],
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
      setAmounts: ['1', '2'], // TODO: Higher amounts result in errors around
      inputTokens: [
        { symbol: 'USDT', exchangeRate: 1500 },
        { symbol: 'USDC', exchangeRate: 1500 },
        { symbol: 'WETH', exchangeRate: 0.5 },
        { symbol: 'WBTC', exchangeRate: 0.02 },
        { symbol: 'XAUt', exchangeRate: 0.3 },
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
    ARB2x: {
      setAmounts: ['1', '2'], // TODO: Review LINK liquidity on alternative flashloan providers for higher amounts
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'USD₮0', exchangeRate: 3000 },
        { symbol: 'WETH', exchangeRate: 1 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
        { symbol: 'ARB', exchangeRate: 2500 },
      ],
    },
    // TODO: There seems to be no flashloan liquidity on balancer for AAVE2x so we have to find an alternative flashloan source for this
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
      setAmounts: ['1', '5'], // TODO: Review LINK liquidity on alternative flashloan providers for higher amounts
      inputTokens: [
        { symbol: 'USDC', exchangeRate: 3000 },
        { symbol: 'USD₮0', exchangeRate: 3000 },
        { symbol: 'WETH', exchangeRate: 1 },
        { symbol: 'WBTC', exchangeRate: 0.1 },
        { symbol: 'LINK', exchangeRate: 60 },
      ],
    },
  },
}

export default testScenarios
