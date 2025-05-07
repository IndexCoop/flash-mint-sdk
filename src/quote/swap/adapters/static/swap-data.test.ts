import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ETH } from 'constants/tokens'
import { Exchange } from 'utils'
import { base } from 'viem/chains'
import { getSwapData } from './swap-data'

import type { StaticQuoteRequest } from 'quote/swap/adapters/static'

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

  test('reverses swap data for redeeming', () => {
    const request: StaticQuoteRequest = {
      chainId: 1,
      isMinting: false,
      inputToken: getTokenByChainAndSymbol(1, 'ETH2X'),
      outputToken: getTokenByChainAndSymbol(1, 'USDC'),
      outputAmount: BigInt(1),
      inputAmount: BigInt(1),
      slippage: 0.5,
      taker: '0x',
    }
    const result = getSwapData(request)
    if (!result) fail()
    expect(result.swapDataDebtForCollateral).toEqual({
      exchange: 3,
      fees: [500],
      path: [
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      ],
      pool: '0x0000000000000000000000000000000000000000',
    })
    expect(result.swapDataInputToken).toEqual({
      exchange: 3,
      fees: [500],
      path: [
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      ],
      pool: '0x0000000000000000000000000000000000000000',
    })
  })

  test('reverses swap data for redeeming icETH', () => {
    const request: StaticQuoteRequest = {
      chainId: 1,
      isMinting: false,
      inputToken: getTokenByChainAndSymbol(1, 'icETH'),
      outputToken: ETH,
      outputAmount: BigInt(1),
      inputAmount: BigInt(1),
      slippage: 0.5,
      taker: '0x',
    }
    const result = getSwapData(request)
    if (!result) fail()
    expect(result.swapDataDebtForCollateral).toEqual({
      exchange: Exchange.Curve,
      fees: [],
      path: [
        '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      ],
      pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
    })
    expect(result.swapDataInputToken).toEqual({
      exchange: Exchange.Curve,
      fees: [],
      path: [
        '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      ],
      pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
    })
  })

  test('reverses swap data for redeeming - base', () => {
    const chainId = base.id
    const request: StaticQuoteRequest = {
      chainId,
      isMinting: false,
      inputToken: getTokenByChainAndSymbol(chainId, 'wstETH15x'),
      outputToken: getTokenByChainAndSymbol(chainId, 'USDC'),
      outputAmount: BigInt(1),
      inputAmount: BigInt(1),
      slippage: 0.5,
      taker: '0x',
    }
    const result = getSwapData(request)
    if (!result) fail()
    expect(result.swapDataDebtForCollateral).toEqual({
      exchange: 7,
      fees: [],
      path: [
        '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
        '0x4200000000000000000000000000000000000006',
      ],
      pool: '0x0000000000000000000000000000000000000000',
      poolIds: [],
      tickSpacing: [1],
    })
    expect(result.swapDataInputToken).toEqual({
      exchange: 7,
      fees: [],
      path: [
        '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
        '0x4200000000000000000000000000000000000006',
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      ],
      pool: '0x0000000000000000000000000000000000000000',
      poolIds: [],
      tickSpacing: [1, 100],
    })
  })
})
