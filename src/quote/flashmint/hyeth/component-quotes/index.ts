import { BigNumber } from '@ethersproject/bignumber'
import { isAddressEqual } from '@indexcoop/tokenlists'
import type { Address } from 'viem'

import type { SwapQuoteProvider } from 'quote/swap'
import { slippageAdjustedTokenAmount } from 'utils'

import type { QuoteToken } from '../../../interfaces'

import { AcrossQuoteProvider } from './across'
import { InstadappQuoteProvider } from './instadapp'
import { MorphoQuoteProvider } from './morpho'
import { PendleQuoteProvider } from './pendle'

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
    readonly swapQuoteProvider: SwapQuoteProvider,
  ) {}

  isAcross(token: string) {
    return isAddressEqual(
      token as Address,
      '0x28F77208728B0A45cAb24c4868334581Fe86F95B',
    )
  }

  isInstdapp(token: string) {
    return isAddressEqual(
      token as Address,
      '0xA0D3707c569ff8C87FA923d3823eC5D81c98Be78',
    )
  }

  isMorpho(token: string) {
    const morphoTokens: Address[] = [
      '0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d0',
      // new morpho vault, soon to be the only component
      '0xc554929a61d862F2741077F8aafa147479c0b308',
    ]
    return morphoTokens.some((morphoVault) =>
      isAddressEqual(morphoVault, token as Address),
    )
  }

  isPendle(token: string) {
    const pendleTokens: Address[] = [
      '0x1c085195437738d73d75DC64bC5A3E098b7f93b1',
      '0x6ee2b5E19ECBa773a352E5B21415Dc419A700d1d',
      '0xf7906F274c174A52d444175729E3fa98f9bde285',
      '0x7aa68E84bCD8d1B4C9e10B1e565DB993f68a3E09',
    ]
    return pendleTokens.some((pendleToken) =>
      isAddressEqual(pendleToken, token as Address),
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

      if (this.isAcross(component)) {
        const acrossQuoteProvider = new AcrossQuoteProvider(
          this.rpcUrl,
          swapQuoteProvider,
        )
        if (isMinting) {
          const quotePromise = acrossQuoteProvider.getDepositQuote(
            amount,
            inputTokenAddress,
          )
          quotePromises.push(quotePromise)
        } else {
          const quotePromise = acrossQuoteProvider.getWithdrawQuote(
            amount,
            outputTokenAddress,
          )
          quotePromises.push(quotePromise)
        }
      }

      if (this.isInstdapp(component)) {
        const instadappProvider = new InstadappQuoteProvider(
          this.rpcUrl,
          swapQuoteProvider,
        )
        if (isMinting) {
          const quotePromise = instadappProvider.getMintQuote(
            component,
            amount,
            inputTokenAddress,
          )
          quotePromises.push(quotePromise)
        } else {
          const quotePromise = instadappProvider.getRedeemQuote(
            component,
            amount,
            outputTokenAddress,
          )
          quotePromises.push(quotePromise)
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
          )
          quotePromises.push(quotePromise)
        } else {
          const quotePromise = morphoQuoteProvider.getRedeemQuote(
            component,
            amount,
            outputTokenAddress,
          )
          quotePromises.push(quotePromise)
        }
      }

      if (this.isPendle(component)) {
        const pendleQuoteProvider = new PendleQuoteProvider(
          this.rpcUrl,
          swapQuoteProvider,
        )
        if (isMinting) {
          const quotePromise = pendleQuoteProvider.getDepositQuote(
            component,
            amount,
            inputTokenAddress,
          )
          quotePromises.push(quotePromise)
        } else {
          const quotePromise = pendleQuoteProvider.getWithdrawQuote(
            component,
            amount,
            outputTokenAddress,
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
