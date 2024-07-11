import { stETH } from 'constants/tokens'
import { CurveSwapQuoteProvider } from 'quote/swap/adapters/curve'

import {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'
import { isSameAddress } from 'utils'

export class IndexSwapQuoteProvider implements SwapQuoteProvider {
  constructor(readonly rpcUrl: string) {}

  public async getSwapQuote(
    request: SwapQuoteRequest
  ): Promise<SwapQuote | null> {
    const { chainId, inputToken, outputToken } = request
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const stEth = stETH.address!
    const isStEth =
      isSameAddress(inputToken, stEth) || isSameAddress(outputToken, stEth)
    if (isStEth) {
      // tODO: check whether input token is ETH or ERC-20
      const curveSwapQuoteProvider = new CurveSwapQuoteProvider(this.rpcUrl)
      return await curveSwapQuoteProvider.getSwapQuote(request)
    }
    return null
  }
}
