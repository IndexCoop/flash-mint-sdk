import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

import { createERC20Contract } from '.'
import UniswapV3PoolAbi from './UniswapV3PoolAbi.json'

const UNISWAPV3_SWAPROUTER_ADDRESS =
  '0xE592427A0AEce92De3Edee1F18E0157C05861564'

type SwapExactInputParams = {
  tokenIn: string
  tokenOut: string
  amountIn: BigNumber
  amountOutMin: BigNumber
}

/**
 * Uses UniswapV3 to swap w/ exact input.
 * @param
 * @param poolAddress   The pool address of the given token pair (find it on https://info.uniswap.org/).
 * @param swapParams    Similar to the actual swap param of `exactInputSingle()`
 * @param provider      A provider
 * @param signer        A signer
 */
export async function swapExactInput(
  poolAddress: string,
  swapParams: SwapExactInputParams,
  provider: JsonRpcProvider,
  signer: Wallet
) {
  // Get pool state to fetch the `sqrtPriceX96`
  const poolContract = new Contract(poolAddress, UniswapV3PoolAbi, provider)
  const [state] = await Promise.all([getPoolState(poolContract)])

  const { amountIn, amountOutMin, tokenIn, tokenOut } = swapParams

  const uniswap = new Contract(
    UNISWAPV3_SWAPROUTER_ADDRESS,
    UNISWAPV3_SWAPROUTER_ABI,
    signer
  )

  // On UniswapV3 the input token amount has to be approved before swapping
  const erc20TokenIn = createERC20Contract(tokenIn, signer)
  const approveTokenInTx = await erc20TokenIn.approve(uniswap.address, amountIn)
  await approveTokenInTx.wait()

  const block = await provider.getBlock('latest')
  console.log('BLOCK', block)

  const feeTier = 3000
  const priceLimit = state.sqrtPriceX96.toString()
  const params = {
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    fee: feeTier,
    recipient: signer.address,
    deadline: block.timestamp + 10000,
    amountIn: amountIn,
    amountOutMinimum: amountOutMin,
    sqrtPriceLimitX96: 0,
  }
  await uniswap.exactInputSingle(params, {
    gasLimit: 500_000,
  })
}

async function getPoolState(poolContract: Contract) {
  const [liquidity, slot] = await Promise.all([
    poolContract.liquidity(),
    poolContract.slot0(),
  ])

  const PoolState = {
    liquidity,
    sqrtPriceX96: slot[0],
    tick: slot[1],
    observationIndex: slot[2],
    observationCardinality: slot[3],
    observationCardinalityNext: slot[4],
    feeProtocol: slot[5],
    unlocked: slot[6],
  }

  return PoolState
}

const UNISWAPV3_SWAPROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'tokenIn', type: 'address' },
          { internalType: 'address', name: 'tokenOut', type: 'address' },
          { internalType: 'uint24', name: 'fee', type: 'uint24' },
          { internalType: 'address', name: 'recipient', type: 'address' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'amountOutMinimum',
            type: 'uint256',
          },
          {
            internalType: 'uint160',
            name: 'sqrtPriceLimitX96',
            type: 'uint160',
          },
        ],
        internalType: 'struct ISwapRouter.ExactInputSingleParams',
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'exactInputSingle',
    outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
]
