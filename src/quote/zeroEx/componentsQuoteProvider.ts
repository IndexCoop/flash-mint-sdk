import { BigNumber } from '@ethersproject/bignumber'

import { ZeroExApi } from '../../utils/0x'
import { QuoteToken } from '../quoteToken'

export type ComponentQuotesResult = {
  componentQuotes: string[]
  inputOutputTokenAmount: BigNumber
}
export class ComponentsQuoteProvider {
  constructor(
    readonly chainId: number,
    readonly slippage: number,
    readonly wethAddress: string,
    readonly zeroExApi: ZeroExApi
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

    const { chainId, slippage, zeroExApi } = this

    const inputTokenAddress = this.getTokenAddressOrWeth(inputToken)
    const outputTokenAddress = this.getTokenAddressOrWeth(outputToken)

    // 0xAPI expects percentage as value between 0-1 e.g. 5% -> 0.05
    const slippagePercentage = slippage / 100

    const quotePromises: Promise<any>[] = []

    components.forEach((component, index) => {
      const buyAmount = positions[index]
      const sellAmount = positions[index]
      const buyToken = isMinting ? component : outputTokenAddress
      const sellToken = isMinting ? inputTokenAddress : component

      if (buyToken === sellToken) {
        const amount = isMinting ? buyAmount : sellAmount
        const fakeResponse = this.getFakeZeroExResponse(amount)
        quotePromises.push(fakeResponse)
      } else {
        const params = isMinting
          ? {
              buyToken,
              sellToken,
              buyAmount: buyAmount.toString(),
              slippagePercentage,
            }
          : {
              buyToken,
              sellToken,
              sellAmount: sellAmount.toString(),
              slippagePercentage,
            }
        const quotePromise = zeroExApi.getSwapQuote(params, chainId ?? 1)
        quotePromises.push(quotePromise)
      }
    })

    const results = await Promise.all(quotePromises)
    const componentQuotes = results.map((result) => result.data)

    const inputOutputTokenAmount = results
      .map((result) =>
        BigNumber.from(isMinting ? result.sellAmount : result.buyAmount)
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
   * This is just a helper function to return a fake ZeroEx response when the
   * component and input/output token are the same.
   */
  async getFakeZeroExResponse(amount: BigNumber): Promise<any> {
    return Promise.resolve({
      buyAmount: amount,
      // Needs valid formatted hash - as otherwise validation will fail
      data: '0x0000000000000000000000000000000000000000',
      sellAmount: amount,
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
