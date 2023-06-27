import { decodePool, extractPoolFees } from './UniswapPath'

describe('UniswapPath', () => {
  describe('decodePool()', () => {
    test('should extract tokens and fees for a single pool - USDC-WBTC', async () => {
      // Path: USDC (0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48) + fee 0001f4 (500) + WBTC ((0x)2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599)
      const path =
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f42260fac5e5542a773aa44fbcfedf7c193bc2c599'
      const { tokens, fees } = decodePool(path)
      expect(tokens.length).toEqual(2)
      expect(tokens[0]).toEqual('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
      expect(tokens[1]).toEqual('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599')
      expect(fees).toEqual([500])
    })

    test('should extract fees for multiple pools USDC-WETH-WBTC', async () => {
      // Path: USDC (0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) + fee 000064 (100) + WETH ((0x)c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2) + fee 0001f4 + WBTC ((0x)2260fac5e5542a773aa44fbcfedf7c193bc2c599)
      const path =
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000064c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20001f42260fac5e5542a773aa44fbcfedf7c193bc2c599'
      const { tokens, fees } = decodePool(path)
      expect(tokens.length).toEqual(3)
      expect(tokens[0]).toEqual('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
      expect(tokens[1]).toEqual('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
      expect(tokens[2]).toEqual('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599')
      expect(fees).toEqual([100, 500])
    })

    test('should extract fees for multiple pools DAI-WETH-USDC', async () => {
      // Path: DAI (0x8f3cf7ad23cd3cadbd9735aff958023239c6a063) + fee 0001f4 + WETH (7ceb23fd6bc0add59e62ac25578270cff1b9f619) + fee 0001f4 + USDC (2791Bca1f2de4661ED88A30C99A7a9449Aa84174)
      const path =
        '0x8f3cf7ad23cd3cadbd9735aff958023239c6a0630001f47ceb23fd6bc0add59e62ac25578270cff1b9f6190001f42791bca1f2de4661ed88a30c99a7a9449aa84174'
      const { tokens, fees } = decodePool(path)
      expect(tokens.length).toEqual(3)
      expect(tokens[0]).toEqual('0x8f3cf7ad23cd3cadbd9735aff958023239c6a063')
      expect(tokens[1]).toEqual('0x7ceb23fd6bc0add59e62ac25578270cff1b9f619')
      expect(tokens[2]).toEqual('0x2791bca1f2de4661ed88a30c99a7a9449aa84174')
      expect(fees).toEqual([500, 500])
    })
  })

  describe('extractPoolFees()', () => {
    test('should extract a fee for a single pool - USDC-WBTC', async () => {
      // Path: USDC (0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48) + fee 0001f4 (500) + WBTC ((0x)2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599)
      const path =
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f42260fac5e5542a773aa44fbcfedf7c193bc2c599'
      const result = extractPoolFees(path)
      expect(result).toBeDefined()
      expect(result).toEqual([500])
    })

    test('should extract fees for multiple pools USDC-WETH-WBTC', async () => {
      // Path: USDC (0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) + fee 000064 (100) + WETH ((0x)c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2) + fee 0001f4 + WBTC ((0x)2260fac5e5542a773aa44fbcfedf7c193bc2c599)
      const path =
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000064c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20001f42260fac5e5542a773aa44fbcfedf7c193bc2c599'
      const result = extractPoolFees(path)
      expect(result).toBeDefined()
      expect(result).toEqual([100, 500])
    })

    test('should extract fees for multiple pools DAI-WETH-USDC', async () => {
      // Path: DAI (0x8f3cf7ad23cd3cadbd9735aff958023239c6a063) + fee 0001f4 + WETH (7ceb23fd6bc0add59e62ac25578270cff1b9f619) + fee 0001f4 + USDC (2791Bca1f2de4661ED88A30C99A7a9449Aa84174)
      const path =
        '0x8f3cf7ad23cd3cadbd9735aff958023239c6a0630001f47ceb23fd6bc0add59e62ac25578270cff1b9f6190001f42791bca1f2de4661ed88a30c99a7a9449aa84174'
      const result = extractPoolFees(path)
      expect(result).toBeDefined()
      expect(result).toEqual([500, 500])
    })
  })
})
