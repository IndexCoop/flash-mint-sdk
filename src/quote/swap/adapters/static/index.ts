import { getSwapDataDebtForCollateral } from 'quote/swap/adapters/static/swap-data'

export interface StaticSwapQuoteProviderQuoteRequest {
  chainId: number
  isMinting: boolean
  inputToken: string
  outputToken: string
  indexTokenAmount: bigint
  inputAmount: bigint
  slippage: number
}

export interface StaticSwapQuoteProviderQuote {
  chainId: number
  inputToken: string
  outputToken: string
  inputAmount: string
  outputAmount: string
  slippage: number
  // TODO:
  //   swapData: SwapDataV2 | null
}

export class StaticSwapQuoteProvider {
  async getSwapQuote(
    request: StaticSwapQuoteProviderQuoteRequest,
  ): Promise<StaticSwapQuoteProviderQuote | null> {
    const {
      chainId,
      indexTokenAmount,
      // TODO: use when doing static contract call
      inputAmount: maxInputAmount,
      inputToken,
      isMinting,
      outputToken,
      slippage,
    } = request

    // TODO: get swap data debt for collateral, swap data input/output token
    const swapData = getSwapDataDebtForCollateral(request)

    console.log(swapData)

    // TODO: static call contract to get quote amount
    // TODO: apply slippage
    const inputOutputAmount = BigInt(0)

    const inputAmount = (
      isMinting ? inputOutputAmount : indexTokenAmount
    ).toString()
    const outputAmount = (
      isMinting ? indexTokenAmount : inputOutputAmount
    ).toString()

    return {
      chainId,
      inputToken,
      outputToken,
      inputAmount,
      outputAmount,
      slippage,
      // TODO: add call data?
    }
  }
}
