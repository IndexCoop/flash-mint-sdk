import { EthAddress } from 'constants/addresses'
import { stETH } from 'constants/tokens'
import { CurveSwapQuoteProvider } from 'quote/swap/adapters/curve'
import { UniswapSwapQuoteProvider } from 'quote/swap/adapters/uniswap'
import type {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'
import { isSameAddress } from 'utils'

export class IndexSwapQuoteProvider implements SwapQuoteProvider {
  constructor(readonly rpcUrl: string) {}

  public async getSwapQuote(
    request: SwapQuoteRequest,
  ): Promise<SwapQuote | null> {
    let inputToken = request.inputToken
    let outputToken = request.outputToken
    if (inputToken === 'ETH') {
      inputToken = EthAddress
    }
    if (outputToken === 'ETH') {
      outputToken = EthAddress
    }
    const eth = EthAddress
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const stEth = stETH.address!
    const isEth =
      isSameAddress(inputToken, eth) || isSameAddress(outputToken, eth)
    const isStEth =
      isSameAddress(inputToken, stEth) || isSameAddress(outputToken, stEth)
    if (isStEth && isEth) {
      const curveSwapQuoteProvider = new CurveSwapQuoteProvider(this.rpcUrl)
      return await curveSwapQuoteProvider.getSwapQuote({
        ...request,
        inputToken,
        outputToken,
      })
    }
    const uniswapSwapQuoteProvider = new UniswapSwapQuoteProvider(this.rpcUrl)
    return await uniswapSwapQuoteProvider.getSwapQuote({
      ...request,
      inputToken,
      outputToken,
    })
  }
}
