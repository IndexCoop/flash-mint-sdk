import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { getTokenDataByAddress } from '@indexcoop/tokenlists'
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import { Token } from '@uniswap/sdk-core'

import { AddressZero } from 'constants/addresses'
import {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'
import { getRpcProvider } from 'utils/rpc-provider'
import { Exchange, isSameAddress } from 'utils'

import { getPath } from './utils/path'
import { getPool } from './utils/pools'

const QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'

export class UniswapSwapQuoteProvider implements SwapQuoteProvider {
  constructor(readonly rpcUrl: string) {}

  getQuoterContract() {
    const rpcProvider = getRpcProvider(this.rpcUrl)
    return new Contract(QUOTER_CONTRACT_ADDRESS, Quoter.abi, rpcProvider)
  }

  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null> {
    const {
      chainId,
      inputAmount,
      inputToken,
      outputAmount,
      outputToken,
      slippage,
    } = request

    // TODO: if input/output token is ETH, change to WETH

    if (!inputAmount && !outputAmount) {
      throw new Error('Error - either input or output amount must be set')
    }

    const inputTokenData = getTokenDataByAddress(inputToken, chainId)
    const outputTokenData = getTokenDataByAddress(outputToken, chainId)

    if (!inputTokenData || !outputTokenData) {
      throw new Error('Error - either input or output token is invalid')
    }

    const path = getPath(inputToken, outputToken)
    console.log(path)

    // TODO: just for testing, remove later
    const isStEth =
      isSameAddress(
        outputToken,
        '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'
      ) ||
      isSameAddress(inputToken, '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84')

    try {
      // TODO: create convenience function to fetch best pool (best fees)?
      const fee = isStEth ? 3000 : 500
      const tokenA = new Token(1, inputToken, inputTokenData.decimals)
      const tokenB = new Token(1, outputToken, outputTokenData.decimals)
      const pool = await getPool(tokenA, tokenB, fee, this.rpcUrl)
      if (!pool) return null
      const quoterContract = this.getQuoterContract()
      let quotedAmount: BigNumber | null
      if (outputAmount) {
        quotedAmount = await quoterContract.callStatic.quoteExactInputSingle(
          pool.token0,
          pool.token1,
          pool.fee,
          BigNumber.from(outputAmount),
          0
        )
      } else {
        quotedAmount = await quoterContract.callStatic.quoteExactOutputSingle(
          pool.token0,
          pool.token1,
          pool.fee,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          BigNumber.from(inputAmount!),
          0
        )
      }
      return {
        chainId,
        inputToken,
        outputToken,
        inputAmount: (
          inputAmount ??
          quotedAmount ??
          BigNumber.from(0)
        )?.toString(),
        outputAmount: (
          outputAmount ??
          quotedAmount ??
          BigNumber.from(0)
        )?.toString(),
        callData: '0x', // TOOD: result.transactionRequest?.data ?? '0x',
        slippage: slippage ?? 0,
        swapData: {
          exchange: Exchange.UniV3,
          path,
          fees: [pool.fee],
          // For UniV3 swap data the contract only needs the path and the fees
          pool: AddressZero,
        },
      }
    } catch (error) {
      console.log('Error getting Uniswap swap quote:')
      console.log(error)
      return null
    }
  }
}
