import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import type { StaticQuoteRequest } from 'quote/swap/adapters/static'
import { getSwapData } from './swap-data'

describe('Static swap data', () => {
  test('returns null for unsupported chain', () => {
    const request: StaticQuoteRequest = {
      chainId: 9999,
      isMinting: true,
      inputToken: getTokenByChainAndSymbol(1, 'USDC'),
      outputToken: getTokenByChainAndSymbol(1, 'ETH2X'),
      outputAmount: BigInt(1),
      inputAmount: BigInt(1),
      slippage: 0.5,
      taker: '0x',
    }
    const result = getSwapData(request)
    expect(result).toBeNull()
  })

  test('returns null for unsupported currency token', () => {
    const request: StaticQuoteRequest = {
      chainId: 1,
      isMinting: true,
      inputToken: getTokenByChainAndSymbol(1, 'USDT'),
      outputToken: getTokenByChainAndSymbol(1, 'ETH2X'),
      outputAmount: BigInt(1),
      inputAmount: BigInt(1),
      slippage: 0.5,
      taker: '0x',
    }
    const result = getSwapData(request)
    expect(result).toBeNull()
  })
})
