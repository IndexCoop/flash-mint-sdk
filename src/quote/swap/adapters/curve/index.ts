import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

import {
  SwapQuoteProvider,
  SwapQuoteRequest,
  SwapQuote,
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
    const quoteAmount = await pool.get_dy(
      0,
      1,
      BigNumber.from('1000000000000000000')
    )
    console.log(quoteAmount.toString())
    return {
      chainId,
      inputToken,
      outputToken,
      inputAmount: BigNumber.from(0).toString(),
      outputAmount: BigNumber.from(0).toString(),
      callData: '0x', // TOOD: result.transactionRequest?.data ?? '0x',
      slippage: slippage ?? 0,
      swapData: getSwapData(),
    }
  }
}
