import { BigNumber } from '@ethersproject/bignumber'

import { AddressZero, HashZero } from 'constants/addresses'
import { Contracts } from 'constants/contracts'

import type {
  SwapQuoteProviderV2,
  SwapQuoteRequestV2,
  SwapQuoteV2,
} from 'quote/swap'
import type { QuoteToken } from '../../interfaces'

export type ComponentQuotesResult = {
  componentQuotes: string[]
  inputOutputTokenAmount: BigNumber
}
export class ComponentsQuoteProvider {
  constructor(
    readonly chainId: number,
    readonly slippage: number,
    readonly wethAddress: string,
    readonly swapQuoteProvider: SwapQuoteProviderV2,
  ) {}

  /**
   * Returns the component quotes and input/output token amount for given components
   * and positions.
   *
   * @param components      An array of components
   * @param positions       An array of positions
   * @param isMinting       Minting or redeeming
   * @param inputToken      The input token
   * @param outputToken     The output token
   *
   * @returns a ComponentQuotesResult
   */
  async getComponentQuotes(
    components: string[],
    positions: BigNumber[],
    isMinting: boolean,
    inputToken: QuoteToken,
    outputToken: QuoteToken,
  ): Promise<ComponentQuotesResult | null> {
    if (components.length === 0 || positions.length === 0) return null
    if (components.length !== positions.length) return null

    const { chainId, slippage, swapQuoteProvider } = this

    const inputTokenAddress = this.getTokenAddressOrWeth(inputToken)
    const outputTokenAddress = this.getTokenAddressOrWeth(outputToken)

    const quotePromises: Promise<SwapQuoteV2 | null>[] = []

    for (let i = 0; i < components.length; i += 1) {
      const index = i
      const component = components[index]
      const buyToken = isMinting ? component : outputTokenAddress
      const sellToken = isMinting ? inputTokenAddress : component
      const sellAmount = positions[index]

      if (buyToken === sellToken) {
        const fakeResponse = this.getFakeSwapQuote(sellAmount)
        quotePromises.push(fakeResponse)
      } else {
        const params: SwapQuoteRequestV2 = {
          chainId,
          inputToken: sellToken,
          outputToken: buyToken,
          inputAmount: sellAmount.toString(),
          slippage,
          taker: Contracts[1].ExchangeIssuanceZeroEx,
          sellEntireBalance: true,
        }
        const quotePromise = swapQuoteProvider.getSwapQuote(params)
        quotePromises.push(quotePromise)
      }
    }

    const resultsWithNull = await Promise.all(quotePromises)
    const results: SwapQuoteV2[] = resultsWithNull.filter(
      (e): e is Exclude<typeof e, null> => e !== null,
    )
    if (results.length !== resultsWithNull.length) return null
    const componentQuotes = results.map((result) => result.swapData!.callData)
    const inputOutputTokenAmount = results
      .map((result) =>
        BigNumber.from(isMinting ? result.inputAmount : result.outputAmount),
      )
      .reduce((prevValue, currValue) => {
        return currValue.add(prevValue)
      })
    return {
      componentQuotes: componentQuotes,
      inputOutputTokenAmount,
    }
  }

  /**
   * This is just a helper function to return a fake swap quote when the
   * component and input/output token are the same.
   */
  async getFakeSwapQuote(amount: BigNumber): Promise<SwapQuoteV2> {
    return Promise.resolve({
      chainId: 1,
      inputToken: '',
      outputToken: '',
      inputAmount: amount.toString(),
      outputAmount: amount.toString(),
      slippage: 0,
      swapData: {
        swapTarget: AddressZero,
        // Needs valid formatted hash - as otherwise validation will fail
        callData: HashZero, // TODO: check
      },
    })
  }

  /**
   * Returns the WETH address if token is ETH. Otherwise the token's address.
   * @param token A token of type QuoteToken.
   * @returns a token address as string
   */
  getTokenAddressOrWeth(token: QuoteToken): string {
    return token.symbol === 'ETH' ? this.wethAddress : token.address
  }
}
