import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'

import {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'
import { getRpcProvider } from 'utils/rpc-provider'

const QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'

export class UniswapSwapQuoteProvider implements SwapQuoteProvider {
  constructor(readonly rpcUrl: string) {}

  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null> {
    const {
      chainId,
      inputAmount,
      inputToken,
      outputAmount,
      outputToken,
      slippage,
    } = request
    if (!inputAmount && !outputAmount) {
      throw new Error('Error - either input or output amount must be set')
    }
    try {
      const rpcProvider = getRpcProvider(this.rpcUrl)
      const quoterContract = new Contract(
        QUOTER_CONTRACT_ADDRESS,
        Quoter.abi,
        rpcProvider
      )
      //   const poolConstants = await getPoolConstants()
      console.log(inputToken)
      console.log(outputToken)
      console.log(BigNumber.from(inputAmount).toString())
      const quotedAmountOut =
        await quoterContract.callStatic.quoteExactInputSingle(
          '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          outputToken,
          500,
          // TODO: decimals? (probably not needed)
          BigNumber.from(inputAmount),
          0
        )
      console.log(quotedAmountOut.toString())
      // TODO: fetch pool
      // TODO: create convenience function to fetch best pool (best fees)
      // TODO: get quote
      // TODO: construct swap data
      //   const swapData = getSwapData(result)
      //   return {
      //     chainId,
      //     inputToken,
      //     outputToken,
      //     inputAmount: estimate.fromAmount,
      //     outputAmount: estimate.toAmount,
      //     callData: result.transactionRequest?.data ?? '0x',
      //     slippage: slippage ?? 0,
      //     swapData,
      //   }
      return null
    } catch (error) {
      console.log('Error getting Uniswap swap quote:')
      console.log(error)
      return null
    }
  }
}
