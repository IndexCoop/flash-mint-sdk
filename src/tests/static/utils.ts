import type { TestCase } from 'tests/utils'
import { base } from 'viem/chains'

export function buildTestCases(symbols: string[], chainId: number): TestCase[] {
  const testCasesEth: TestCase[] = symbols.map((symbol) => ({
    indexToken: symbol,
    setAmount: '1',
    inputAmount: '1.5',
    inputToken: 'ETH',
  }))
  const testCasesUsdc: TestCase[] = symbols.map((symbol) => ({
    indexToken: symbol,
    setAmount: '1',
    inputAmount: '5000',
    inputToken: 'USDC',
  }))
  const testCasesBtc: TestCase[] = symbols.map((symbol) => ({
    indexToken: symbol,
    setAmount: '1',
    inputAmount: '1',
    inputToken: chainId === base.id ? 'cbBTC' : 'WBTC',
  }))
  return [...testCasesEth, ...testCasesUsdc, ...testCasesBtc]
}

export function getWhale(symbol: string, chainId: number): string {
  switch (chainId) {
    case base.id:
      return symbol === 'USDC'
        ? '0x621e7c767004266c8109e83143ab0Da521B650d6'
        : '0xA8401BE86a024763A6092Be372b8762e279769F1' // cbBTC
    case 1:
      return symbol === 'USDC'
        ? '0x768145BcC76a744E7F267b515d6E2488BdA48f0d'
        : '0xE940ae8cF59fE2709BBc572CBAD2633fB45Abf46' // WBTC
    case 42161:
      return '0x0F896345B538Ac140Ac84f3367a65a34eFD8fcBf' // WBTC
    default:
      throw new Error('Unsupported chainId')
  }
}
