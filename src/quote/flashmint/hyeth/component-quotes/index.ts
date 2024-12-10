import { BigNumber } from '@ethersproject/bignumber'

import { SwapQuoteProvider } from 'quote/swap'
import { slippageAdjustedTokenAmount } from 'utils'

import { QuoteToken } from '../../../interfaces'

import { MorphoQuoteProvider } from './morpho'

interface ComponentQuotesResult {
  componentQuotes: string[]
  inputOutputTokenAmount: bigint
}

export class ComponentQuotesProvider {
  constructor(
    readonly chainId: number,
    readonly slippage: number,
    readonly wethAddress: string,
    readonly rpcUrl: string,
    readonly swapQuoteProvider: SwapQuoteProvider
  ) {}

  async getComponentQuotes(
    components: string[],
    positions: BigNumber[],
    isMinting: boolean,
    inputToken: QuoteToken,
    outputToken: QuoteToken
  ): Promise<ComponentQuotesResult | null> {
    if (components.length === 0 || positions.length === 0) return null
    if (components.length !== positions.length) return null

    const inputTokenAddress = this.getTokenAddressOrWeth(inputToken)
    const outputTokenAddress = this.getTokenAddressOrWeth(outputToken)

    const quotePromises: Promise<bigint | null>[] = []

    for (let i = 0; i < components.length; i += 1) {
      const index = i
      const component = components[index]
      const amount = positions[index].toBigInt()
      const morphoQuoteProvider = new MorphoQuoteProvider(
        this.rpcUrl,
        this.swapQuoteProvider
      )
      if (isMinting) {
        const quotePromise = morphoQuoteProvider.getMintQuote(
          component,
          amount,
          inputTokenAddress
        )
        quotePromises.push(quotePromise)
      } else {
        const quotePromise = morphoQuoteProvider.getRedeemQuote(
          component,
          amount,
          outputTokenAddress
        )
        quotePromises.push(quotePromise)
      }
    }
    const resultsWithNull = await Promise.all(quotePromises)
    const results: bigint[] = resultsWithNull.filter(
      (e): e is Exclude<typeof e, null> => e !== null
    )
    if (results.length !== resultsWithNull.length) return null
    // const componentQuotes = results.map((result) => result.callData)
    const inputOutputTokenAmount = results
      .map((result) => result)
      .reduce((prevValue, currValue) => {
        return currValue + prevValue
      })
    const adjustedAmount = slippageAdjustedTokenAmount(
      BigNumber.from(inputOutputTokenAmount.toString()),
      isMinting ? inputToken.decimals : outputToken.decimals,
      this.slippage,
      isMinting
    )
    return {
      componentQuotes: [],
      inputOutputTokenAmount: adjustedAmount.toBigInt(),
    }
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
