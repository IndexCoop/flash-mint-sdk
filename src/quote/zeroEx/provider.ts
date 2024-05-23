import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { WETH } from 'constants/tokens'
import {
  getAddressForToken,
  getFlashMintZeroExContractForToken,
  getIssuanceModule,
  slippageAdjustedTokenAmount,
} from 'utils'
import { QuoteProvider } from '../quoteProvider'
import { QuoteToken } from '../quoteToken'
import { ComponentsQuoteProvider } from './componentsQuoteProvider'
import { SwapQuoteProvider } from 'quote/swap'

export interface FlashMintZeroExQuoteRequest {
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: BigNumber
  slippage: number
}

export interface FlashMintZeroExQuote {
  componentQuotes: string[]
  indexTokenAmount: BigNumber
  inputOutputTokenAmount: BigNumber
}

export class ZeroExQuoteProvider
  implements QuoteProvider<FlashMintZeroExQuoteRequest, FlashMintZeroExQuote>
{
  constructor(
    private readonly provider: JsonRpcProvider,
    private readonly swapQuoteProvider: SwapQuoteProvider
  ) {}

  async getQuote(
    request: FlashMintZeroExQuoteRequest
  ): Promise<FlashMintZeroExQuote | null> {
    const { provider, swapQuoteProvider } = this
    const { inputToken, indexTokenAmount, isMinting, outputToken, slippage } =
      request
    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenSymbol = indexToken.symbol
    const network = await provider.getNetwork()
    const chainId = network.chainId
    const wethAddress = getAddressForToken(WETH, chainId)
    if (wethAddress === undefined) {
      console.error('Error - WETH address not defined')
      return null
    }
    const { components, positions } = await getRequiredComponents(
      isMinting,
      indexToken.address,
      indexTokenSymbol,
      indexTokenAmount,
      provider,
      chainId
    )
    const quoteProvider = new ComponentsQuoteProvider(
      chainId,
      slippage,
      wethAddress,
      swapQuoteProvider
    )
    const quoteResult = await quoteProvider.getComponentQuotes(
      components,
      positions,
      isMinting,
      inputToken,
      outputToken
    )
    if (!quoteResult) return null
    const {
      componentQuotes,
      inputOutputTokenAmount: estimatedInputOutputAmount,
    } = quoteResult
    const inputOuputTokenDecimals = isMinting
      ? inputToken.decimals
      : outputToken.decimals
    const inputOutputTokenAmount = slippageAdjustedTokenAmount(
      estimatedInputOutputAmount,
      inputOuputTokenDecimals,
      slippage,
      isMinting
    )
    return {
      componentQuotes,
      indexTokenAmount,
      inputOutputTokenAmount,
    }
  }
}

/**
 * Returns the required component and position quotes depending on minting/redeeming.
 * @param isMinting         Whether minting or redeeming
 * @param indexToken        Address of the Index token
 * @param indexTokenSymbol  Symbol of the Index token
 * @param indexTokenAmount  Amount of the Index token
 * @param provider          An instance of JsonRpcProvider
 * @param chainId           ID of the network
 */
export async function getRequiredComponents(
  isMinting: boolean,
  indexToken: string,
  indexTokenSymbol: string,
  indexTokenAmount: BigNumber,
  provider: JsonRpcProvider,
  chainId: number
) {
  const contract = getFlashMintZeroExContractForToken(
    indexTokenSymbol,
    provider,
    chainId
  )
  const issuanceModule = getIssuanceModule(indexTokenSymbol, chainId)
  const { components, positions } = isMinting
    ? await contract.getRequiredIssuanceComponents(
        issuanceModule.address,
        issuanceModule.isDebtIssuance,
        indexToken,
        indexTokenAmount
      )
    : await contract.getRequiredRedemptionComponents(
        issuanceModule.address,
        issuanceModule.isDebtIssuance,
        indexToken,
        indexTokenAmount
      )
  return { components, positions }
}
