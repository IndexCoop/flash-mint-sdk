import { Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'

import { AddressZero } from 'constants/addresses'
import { getAlchemyProviderUrl } from 'tests/utils'

import { getPool } from './pools'

const rpcUrl = getAlchemyProviderUrl(1)

export const weth = new Token(
  1,
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  18,
)

const wstEth = new Token(1, '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', 18)

export const usdc = new Token(
  1,
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  6,
)

describe('getPool', () => {
  test('returns pool data for given tokens and fee (100)', async () => {
    const pool = await getPool(weth, wstEth, FeeAmount.LOWEST, rpcUrl)
    expect(pool).toBeDefined()
    if (!pool) fail()
    expect(pool.address).toEqual('0x109830a1AAaD605BbF02a9dFA7B0B92EC2FB7dAa')
    expect(pool.token0).toEqual(wstEth.address)
    expect(pool.token1).toEqual(weth.address)
    expect(pool.fee).toEqual(100)
  })

  test('returns pool data for given tokens and fee (500)', async () => {
    const pool = await getPool(weth, usdc, FeeAmount.LOW, rpcUrl)
    expect(pool).toBeDefined()
    if (!pool) fail()
    expect(pool.address).toEqual('0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640')
    expect(pool.token0).toEqual(usdc.address)
    expect(pool.token1).toEqual(weth.address)
    expect(pool.fee).toEqual(500)
  })

  test('returns pool data for given tokens and fee (3000)', async () => {
    const pool = await getPool(weth, usdc, FeeAmount.MEDIUM, rpcUrl)
    expect(pool).toBeDefined()
    if (!pool) fail()
    expect(pool.address).toEqual('0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8')
    expect(pool.token0).toEqual(usdc.address)
    expect(pool.token1).toEqual(weth.address)
    expect(pool.fee).toEqual(3000)
  })

  test('returns null if no pool exists', async () => {
    const nonExistantToken = new Token(1, AddressZero, 18)
    const pool = await getPool(nonExistantToken, usdc, FeeAmount.MEDIUM, rpcUrl)
    expect(pool).toBeNull()
  })

  test('returns null if no pool for given fee exists', async () => {
    const pool = await getPool(wstEth, weth, FeeAmount.HIGH, rpcUrl)
    expect(pool).toBeNull()
  })
})
