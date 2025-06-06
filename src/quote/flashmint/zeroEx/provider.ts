import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import {
  getFlashMintZeroExContractForToken,
  getIssuanceModule,
  slippageAdjustedTokenAmount,
} from 'utils'
import { getRpcProvider } from 'utils/rpc-provider'
import { ComponentsQuoteProvider } from './componentsQuoteProvider'

import type { BigNumber } from '@ethersproject/bignumber'
import type { JsonRpcProvider } from '@ethersproject/providers'
import type { QuoteProvider, QuoteToken, Result } from '../../interfaces'
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
  quoteAmmount: BigNumber
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
  ): Promise<Result<FlashMintZeroExQuote>> {
    const { rpcUrl, swapQuoteProvider } = this
    const provider = getRpcProvider(rpcUrl)
    const { inputToken, indexTokenAmount, isMinting, outputToken, slippage } =
      request

    if (isMinting) {
      return {
        success: false,
        error: {
          code: 'MintingNotSupported',
          message: 'Minting is not supported for this provider.',
        },
      }
    }

    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenSymbol = indexToken.symbol
    const network = await provider.getNetwork()
    const chainId = network.chainId

    const wethAddress = getTokenByChainAndSymbol(chainId, 'WETH')?.address
    if (wethAddress === undefined) {
      return {
        success: false,
        error: {
          code: 'WETHAddressNotDefined',
          message: 'WETH address not defined for this chain.',
        },
      }
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

    if (!quoteResult) {
      return {
        success: false,
        error: {
          code: 'QuoteResultNull',
          message: 'Quote result is null.',
        },
      }
    }

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
      success: true,
      data: {
        componentQuotes,
        indexTokenAmount,
        inputOutputTokenAmount,
        quoteAmmount: estimatedInputOutputAmount,
      },
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
