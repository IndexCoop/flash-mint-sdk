import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { WETH } from 'constants/tokens'
import {
  getFlashMintZeroExContractForToken,
  getIssuanceModule,
  slippageAdjustedTokenAmount,
} from 'utils'
import { getRpcProvider } from 'utils/rpc-provider'
import { ComponentsQuoteProvider } from './componentsQuoteProvider'

import type { BigNumber } from '@ethersproject/bignumber'
import type { JsonRpcProvider } from '@ethersproject/providers'
import type { QuoteProvider, QuoteToken } from '../../interfaces'
import type { SwapQuoteProviderV2 } from '../../swap'

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
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProviderV2,
  ) {}

  async getQuote(
    request: FlashMintZeroExQuoteRequest,
  ): Promise<FlashMintZeroExQuote | null> {
    const { rpcUrl, swapQuoteProvider } = this
    const provider = getRpcProvider(rpcUrl)
    const { inputToken, indexTokenAmount, isMinting, outputToken, slippage } =
      request

    if (isMinting) {
      throw new Error('Minting not supported.')
    }

    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenSymbol = indexToken.symbol
    const network = await provider.getNetwork()
    const chainId = network.chainId

    const wethAddress = getTokenByChainAndSymbol(chainId, WETH.symbol)?.address
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
      chainId,
    )
    const quoteProvider = new ComponentsQuoteProvider(
      chainId,
      slippage,
      wethAddress,
      swapQuoteProvider,
    )
    const quoteResult = await quoteProvider.getComponentQuotes(
      components,
      positions,
      isMinting,
      inputToken,
      outputToken,
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
      isMinting,
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
  chainId: number,
) {
  const contract = getFlashMintZeroExContractForToken(
    indexTokenSymbol,
    provider,
  )
  const issuanceModule = getIssuanceModule(indexTokenSymbol, chainId)
  const { components, positions } = isMinting
    ? await contract.getRequiredIssuanceComponents(
        issuanceModule.address,
        issuanceModule.isDebtIssuance,
        indexToken,
        indexTokenAmount,
      )
    : await contract.getRequiredRedemptionComponents(
        issuanceModule.address,
        issuanceModule.isDebtIssuance,
        indexToken,
        indexTokenAmount,
      )
  return { components, positions }
}
