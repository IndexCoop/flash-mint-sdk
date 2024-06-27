import { Contract } from '@ethersproject/contracts'
import { Token } from '@uniswap/sdk-core'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { computePoolAddress, FeeAmount } from '@uniswap/v3-sdk'
import { getRpcProvider } from 'utils/rpc-provider'

import { Pool } from '../types'

const POOL_FACTORY_CONTRACT_ADDRESS =
  '0x1F98431c8aD98523631AE4a59f267346ea31F984'

/**
 * Returns pool if one exists for given tokens and fee.
 */
export async function getPool(
  tokenA: Token,
  tokenB: Token,
  poolFee: FeeAmount,
  rpcUrl: string
): Promise<Pool | null> {
  const provider = getRpcProvider(rpcUrl)

  const address = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA,
    tokenB,
    fee: poolFee,
  })

  try {
    const poolContract = new Contract(address, IUniswapV3PoolABI.abi, provider)
    const [token0, token1, fee] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
    ])
    return {
      address,
      token0,
      token1,
      fee,
    }
  } catch (error) {
    console.log('Error getting Uniswap V3 pool:')
    console.log(error)
    return null
  }
}
