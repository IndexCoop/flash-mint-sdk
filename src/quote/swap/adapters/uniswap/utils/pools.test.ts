import { SUPPORTED_CHAINS, Token } from '@uniswap/sdk-core'

import { getPool } from './pools'
import { FeeAmount } from '@uniswap/v3-sdk'
import { AlchemyProviderUrl } from 'tests/utils'

const rpcUrl = AlchemyProviderUrl

export const WETH_TOKEN = new Token(
  SUPPORTED_CHAINS[0],
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  18,
  'WETH'
)

export const USDC_TOKEN = new Token(
  SUPPORTED_CHAINS[0],
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  6,
  'USDC'
)

describe('getPool', () => {
  test('returns pool data for given tokens and fee (500)', async () => {
    const pool = await getPool(WETH_TOKEN, USDC_TOKEN, FeeAmount.LOW, rpcUrl)
    expect(pool.address).toEqual('0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640')
    expect(pool.token0).toEqual(USDC_TOKEN.address)
    expect(pool.token1).toEqual(WETH_TOKEN.address)
    expect(pool.fee).toEqual(500)
  })

  test('returns pool data for given tokens and fee (3000)', async () => {
    const pool = await getPool(WETH_TOKEN, USDC_TOKEN, FeeAmount.MEDIUM, rpcUrl)
    expect(pool.address).toEqual('0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8')
    expect(pool.token0).toEqual(USDC_TOKEN.address)
    expect(pool.token1).toEqual(WETH_TOKEN.address)
    expect(pool.fee).toEqual(3000)
  })
})
