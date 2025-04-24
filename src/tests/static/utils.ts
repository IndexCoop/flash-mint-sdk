import type { TestCase } from 'tests/utils'

export function buildTestCases(symbols: string[]) {
  const testCasesEth: TestCase[] = symbols.map((symbol) => ({
    indexToken: symbol,
    setAmount: '1',
    inputAmount: '1',
    inputToken: 'ETH',
  }))
  const testCasesUsdc: TestCase[] = symbols.map((symbol) => ({
    indexToken: symbol,
    setAmount: '1',
    inputAmount: '5000',
    inputToken: 'USDC',
  }))
  return [...testCasesEth, ...testCasesUsdc]
}
