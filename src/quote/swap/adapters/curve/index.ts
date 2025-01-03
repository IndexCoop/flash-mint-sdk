import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

import type {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'
import { getRpcProvider } from 'utils/rpc-provider'

import { getSwapData } from './swap-data'

export class CurveSwapQuoteProvider implements SwapQuoteProvider {
  constructor(readonly rpcUrl: string) {}

  getPoolContract() {
    const rpcProvider = getRpcProvider(this.rpcUrl)
    const pool = '0xdc24316b9ae028f1497c275eb9192a3ea0f67022'
    const abi = [
      'function get_dy(int128 i, int128 j, uint256 dx) public view returns (uint256)',
    ]
    return new Contract(pool, abi, rpcProvider)
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
    const pool = this.getPoolContract()
    let quoteAmount = BigNumber.from(0)
    if (outputAmount) {
      quoteAmount = await pool.get_dy(0, 1, BigNumber.from(outputAmount))
    } else {
      quoteAmount = await pool.get_dy(1, 0, BigNumber.from(inputAmount))
    }
    return {
      chainId,
      inputToken,
      outputToken,
      inputAmount: inputAmount ?? quoteAmount.toString(),
      outputAmount: outputAmount ?? quoteAmount.toString(),
      // Will not be used anywhere, so no need to return constructed call data
      callData: '0x',
      slippage: slippage ?? 0,
      swapData: getSwapData(),
    }
  }
}
