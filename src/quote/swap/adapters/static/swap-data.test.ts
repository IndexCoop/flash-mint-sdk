import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ETH } from 'constants/tokens'
import { Exchange } from 'utils'
import { arbitrum, base } from 'viem/chains'
import { getSwapData } from './swap-data'
import {
  isAaveDeleveredRedeemEntry,
  isDexV5Entry,
  type LeveragedConfigEntry,
} from './swap-data-config'

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
    const result = getSwapData(request) as LeveragedConfigEntry
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
    const result = getSwapData(request) as LeveragedConfigEntry
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

  test('returns dexV5 entry for delevered Morpho leverage tokens (uSOL2x)', () => {
    const chainId = base.id
    const WETH = '0x4200000000000000000000000000000000000006'
    const uSOL = '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55'
    const request: StaticQuoteRequest = {
      chainId,
      isMinting: true,
      inputToken: getTokenByChainAndSymbol(chainId, 'WETH'),
      outputToken: getTokenByChainAndSymbol(chainId, 'uSOL2x'),
      outputAmount: BigInt(1),
      inputAmount: BigInt(1),
      slippage: 0.5,
      taker: '0x',
    }
    const result = getSwapData(request)
    if (!result) fail()
    if (!isDexV5Entry(result)) fail('expected dexV5 entry')
    expect(result.contract).toBe('FlashMintDexV5')
    expect(result.componentSwapDataIssue).toEqual([
      {
        exchange: Exchange.AerodromeSlipstream,
        path: [WETH, uSOL],
        fees: [],
        tickSpacing: [200],
        pool: '0x0000000000000000000000000000000000000000',
        poolIds: [],
      },
    ])
    expect(result.componentSwapDataRedeem).toEqual([
      {
        exchange: Exchange.AerodromeSlipstream,
        path: [uSOL, WETH],
        fees: [],
        tickSpacing: [200],
        pool: '0x0000000000000000000000000000000000000000',
        poolIds: [],
      },
    ])
    // WETH input → noopSwap (contract short-circuits internally).
    expect(result.swapDataInputToWeth.exchange).toBe(Exchange.None)
    expect(result.swapDataWethToInput.exchange).toBe(Exchange.None)
  })

  test('returns dexV5 entry with USDC dust component for 3x products (uSOL3x)', () => {
    const chainId = base.id
    const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    const request: StaticQuoteRequest = {
      chainId,
      isMinting: true,
      inputToken: getTokenByChainAndSymbol(chainId, 'USDC'),
      outputToken: getTokenByChainAndSymbol(chainId, 'uSOL3x'),
      outputAmount: BigInt(1),
      inputAmount: BigInt(1),
      slippage: 0.5,
      taker: '0x',
    }
    const result = getSwapData(request)
    if (!result) fail()
    if (!isDexV5Entry(result)) fail('expected dexV5 entry')
    // 3x products carry two component swaps (collateral + USDC dust).
    expect(result.componentSwapDataIssue).toHaveLength(2)
    expect(result.componentSwapDataRedeem).toHaveLength(2)
    // USDC bridge must be UniV3 fee=500 (no Aerodrome path for the bridge).
    expect(result.swapDataInputToWeth.exchange).toBe(Exchange.UniV3)
    expect(result.swapDataInputToWeth.fees).toEqual([500])
    expect(result.swapDataInputToWeth.path).toEqual([
      USDC,
      '0x4200000000000000000000000000000000000006',
    ])
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
    const result = getSwapData(request) as LeveragedConfigEntry
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

  test('returns aaveDeleveredRedeem entry for AAVE2x → AAVE (passthrough)', () => {
    const chainId = arbitrum.id
    const aave = getTokenByChainAndSymbol(chainId, 'AAVE')
    const request: StaticQuoteRequest = {
      chainId,
      isMinting: false,
      inputToken: getTokenByChainAndSymbol(chainId, 'AAVE2x'),
      outputToken: aave,
      outputAmount: BigInt(1),
      inputAmount: BigInt(1),
      slippage: 0.5,
      taker: '0x',
    }
    const result = getSwapData(request)
    if (!result) fail()
    if (!isAaveDeleveredRedeemEntry(result))
      fail('expected aaveDeleveredRedeem entry')
    expect(result.contract).toBe('FlashMintAaveDelevered')
    expect(result.outputToken.toLowerCase()).toBe(aave.address.toLowerCase())
    // single component, noop swap (AAVE-as-underlying = output)
    expect(result.componentSwapData).toHaveLength(1)
    expect(result.componentSwapData[0].path).toHaveLength(0)
  })

  test('returns aaveDeleveredRedeem entry for AAVE2x → USDC (multi-hop)', () => {
    const chainId = arbitrum.id
    const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
    const request: StaticQuoteRequest = {
      chainId,
      isMinting: false,
      inputToken: getTokenByChainAndSymbol(chainId, 'AAVE2x'),
      outputToken: usdc,
      outputAmount: BigInt(1),
      inputAmount: BigInt(1),
      slippage: 0.5,
      taker: '0x',
    }
    const result = getSwapData(request)
    if (!result) fail()
    if (!isAaveDeleveredRedeemEntry(result))
      fail('expected aaveDeleveredRedeem entry')
    expect(result.componentSwapData).toHaveLength(1)
    // AAVE → WETH → USDC, fees [3000, 500]
    expect(result.componentSwapData[0].fees).toEqual([3000, 500])
    expect(result.componentSwapData[0].path).toHaveLength(3)
  })

  test('returns aaveDeleveredRedeem entry for LINK2x → LINK (collateral passthrough + USDT swap)', () => {
    const chainId = arbitrum.id
    const link = getTokenByChainAndSymbol(chainId, 'LINK')
    const request: StaticQuoteRequest = {
      chainId,
      isMinting: false,
      inputToken: getTokenByChainAndSymbol(chainId, 'LINK2x'),
      outputToken: link,
      outputAmount: BigInt(1),
      inputAmount: BigInt(1),
      slippage: 0.5,
      taker: '0x',
    }
    const result = getSwapData(request)
    if (!result) fail()
    if (!isAaveDeleveredRedeemEntry(result))
      fail('expected aaveDeleveredRedeem entry')
    expect(result.componentSwapData).toHaveLength(2)
    // [0] = noop (LINK passthrough); [1] = USDT → WETH → LINK
    expect(result.componentSwapData[0].path).toHaveLength(0)
    expect(result.componentSwapData[1].path).toHaveLength(3)
    expect(result.componentSwapData[1].fees).toEqual([3000, 3000])
  })
})
