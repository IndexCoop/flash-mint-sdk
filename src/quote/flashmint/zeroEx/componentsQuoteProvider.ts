import { BigNumber } from '@ethersproject/bignumber'

import { SwapQuote, SwapQuoteProvider, SwapQuoteRequest } from 'quote/swap'
import { Exchange } from 'utils'

import { QuoteToken } from '../../interfaces'

export type ComponentQuotesResult = {
  componentQuotes: string[]
  inputOutputTokenAmount: BigNumber
}
export class ComponentsQuoteProvider {
  constructor(
    readonly chainId: number,
    readonly slippage: number,
    readonly wethAddress: string,
    readonly swapQuoteProvider: SwapQuoteProvider
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
    outputToken: QuoteToken
  ): Promise<ComponentQuotesResult | null> {
    if (components.length === 0 || positions.length === 0) return null
    if (components.length !== positions.length) return null

    const { chainId, slippage, swapQuoteProvider } = this

    const inputTokenAddress = this.getTokenAddressOrWeth(inputToken)
    const outputTokenAddress = this.getTokenAddressOrWeth(outputToken)

    const quotePromises: Promise<SwapQuote | null>[] = []

    for (let i = 0; i < components.length; i += 1) {
      const index = i
      const component = components[index]
      const buyAmount = positions[index]
      const sellAmount = positions[index]
      const buyToken = isMinting ? component : outputTokenAddress
      const sellToken = isMinting ? inputTokenAddress : component

      if (buyToken === sellToken) {
        const amount = isMinting ? buyAmount : sellAmount
        const fakeResponse = this.getFakeSwapQuote(amount)
        quotePromises.push(fakeResponse)
      } else {
        const params: SwapQuoteRequest = {
          chainId,
          outputToken: buyToken,
          inputToken: sellToken,
          slippage,
        }
        if (isMinting) {
          params.outputAmount = buyAmount.toString()
        } else {
          params.inputAmount = sellAmount.toString()
        }
        const quotePromise = swapQuoteProvider.getSwapQuote(params)
        quotePromises.push(quotePromise)
      }
    }

    const resultsWithNull = await Promise.all(quotePromises)
    const results: SwapQuote[] = resultsWithNull.filter(
      (e): e is Exclude<typeof e, null> => e !== null
    )
    if (results.length !== resultsWithNull.length) return null
    const componentQuotes = results.map((result) => result.callData)
    const inputOutputTokenAmount = results
      .map((result) =>
        BigNumber.from(isMinting ? result.inputAmount : result.outputAmount)
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
  async getFakeSwapQuote(amount: BigNumber): Promise<SwapQuote> {
    return Promise.resolve({
      chainId: 1,
      inputToken: '',
      outputToken: '',
      inputAmount: amount.toString(),
      outputAmount: amount.toString(),
      // Needs valid formatted hash - as otherwise validation will fail
      callData: '0x0000000000000000000000000000000000000000',
      slippage: 0,
      swapData: {
        exchange: Exchange.UniV3,
        path: ['', ''],
        fees: [300],
        pool: '0x0000000000000000000000000000000000000000',
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
