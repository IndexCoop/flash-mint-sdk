import { BigNumber } from '@ethersproject/bignumber'
import { isAddressEqual } from '@indexcoop/tokenlists'
import type { Address } from 'viem'

import { slippageAdjustedTokenAmount } from 'utils'
import { MorphoQuoteProvider } from './morpho'

import type { SwapQuoteProviderV2 } from 'quote/swap'
import type { QuoteToken } from '../../../interfaces'

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
    readonly swapQuoteProvider: SwapQuoteProviderV2,
  ) {}

  isMorpho(token: string) {
    return isAddressEqual(
      '0x701907283a57FF77E255C3f1aAD790466B8CE4ef',
      token as Address,
    )
  }

  async getComponentQuotes(
    components: string[],
    positions: BigNumber[],
    isMinting: boolean,
    inputToken: QuoteToken,
    outputToken: QuoteToken,
  ): Promise<ComponentQuotesResult | null> {
    if (components.length === 0 || positions.length === 0) return null
    if (components.length !== positions.length) return null

    const { swapQuoteProvider } = this

    const inputTokenAddress = this.getTokenAddressOrWeth(inputToken)
    const outputTokenAddress = this.getTokenAddressOrWeth(outputToken)

    const quotePromises: Promise<bigint | null>[] = []

    for (let i = 0; i < components.length; i += 1) {
      const index = i
      const component = components[index]
      const amount = positions[index].toBigInt()

      if (isAddressEqual(component, this.wethAddress)) {
        if (
          isAddressEqual(inputTokenAddress, this.wethAddress) ||
          isAddressEqual(outputTokenAddress, this.wethAddress)
        ) {
          quotePromises.push(Promise.resolve(amount))
        }
      }

      if (this.isMorpho(component)) {
        const morphoQuoteProvider = new MorphoQuoteProvider(
          this.rpcUrl,
          swapQuoteProvider,
        )
        if (isMinting) {
          const quotePromise = morphoQuoteProvider.getMintQuote(
            component,
            amount,
            inputTokenAddress,
            this.slippage,
          )
          quotePromises.push(quotePromise)
        } else {
          const quotePromise = morphoQuoteProvider.getRedeemQuote(
            component,
            amount,
            outputTokenAddress,
            this.slippage,
          )
          quotePromises.push(quotePromise)
        }
      }
    }
    const resultsWithNull = await Promise.all(quotePromises)
    const results: bigint[] = resultsWithNull.filter(
      (e): e is Exclude<typeof e, null> => e !== null,
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
      isMinting,
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
