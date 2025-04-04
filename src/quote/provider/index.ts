import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'

import {
  FlashMintHyEthTransactionBuilder,
  LeveragedZeroExBuilder,
  ZeroExTransactionBuilder,
} from 'flashmint'

import { Contracts } from 'constants/contracts'
import { FlashMintHyEthQuoteProvider } from '../flashmint/hyeth'
import { ZeroExQuoteProvider } from '../flashmint/zeroEx'
import { buildQuoteResponse, getContractType } from './utils'

import type { TransactionRequest } from '@ethersproject/abstract-provider'
import type {
  FlashMintLeveragedZeroExBuilderBuildRequest,
  FlashMintZeroExBuildRequest,
} from 'flashmint'
import { LeveragedZeroExQuoteProvider } from 'quote/flashmint/leveraged-zeroex'
import type { QuoteProvider, QuoteToken } from '../interfaces'
import type { SwapQuoteProviderV2 } from '../swap'

export enum FlashMintContractType {
  hyeth = 0,
  leveragedZeroEx = 1,
  zeroEx = 2,
}

export interface FlashMintQuoteRequest {
  chainId: number
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: string
  inputTokenAmount?: string
  slippage: number
}

export interface FlashMintQuote {
  chainId: number
  contractType: FlashMintContractType
  contract: string
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  inputAmount: BigNumber
  outputAmount: BigNumber
  indexTokenAmount: BigNumber
  inputOutputAmount: BigNumber
  slippage: number
  tx: TransactionRequest
}

export class FlashMintQuoteProvider
  implements QuoteProvider<FlashMintQuoteRequest, FlashMintQuote>
{
  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProviderV2: SwapQuoteProviderV2,
    private readonly swapQuoteOutputProviderV2?: SwapQuoteProviderV2,
  ) {}

  async getQuote(
    request: FlashMintQuoteRequest,
  ): Promise<FlashMintQuote | null> {
    const { rpcUrl, swapQuoteProviderV2, swapQuoteOutputProviderV2 } = this
    const {
      chainId,
      inputToken,
      inputTokenAmount,
      isMinting,
      outputToken,
      slippage,
    } = request

    const indexTokenAmount = BigNumber.from(request.indexTokenAmount)
    const indexToken = isMinting ? outputToken : inputToken
    const inputOutputToken = isMinting ? inputToken : outputToken

    const contractType = getContractType(indexToken.symbol, chainId)
    if (contractType === null) {
      throw new Error('Index token not supported')
    }

    switch (contractType) {
      case FlashMintContractType.hyeth: {
        if (!swapQuoteOutputProviderV2 || inputTokenAmount === undefined) {
          throw new Error('400')
        }
        const hyethQuoteProvider = new FlashMintHyEthQuoteProvider(
          rpcUrl,
          swapQuoteProviderV2,
          swapQuoteOutputProviderV2,
        )
        const hyethQuote = await hyethQuoteProvider.getQuote({
          isMinting,
          inputToken,
          outputToken,
          indexTokenAmount: indexTokenAmount.toBigInt(),
          inputAmount: BigInt(inputTokenAmount),
          slippage,
        })
        if (!hyethQuote) return null
        const inputOutputTokenAmount = BigNumber.from(
          hyethQuote.inputOutputTokenAmount.toString(),
        )
        const builder = new FlashMintHyEthTransactionBuilder(rpcUrl)
        const txRequest = {
          isMinting,
          inputToken: inputToken.address,
          inputTokenSymbol: inputToken.symbol,
          outputToken: outputToken.address,
          outputTokenSymbol: outputToken.symbol,
          inputTokenAmount: isMinting
            ? inputOutputTokenAmount
            : indexTokenAmount,
          outputTokenAmount: isMinting
            ? indexTokenAmount
            : inputOutputTokenAmount,
          componentsSwapData: hyethQuote.componentsSwapData,
          swapDataInputTokenToEth: hyethQuote.swapDataInputTokenToEth,
          swapDataEthToInputOutputToken:
            hyethQuote.swapDataEthToInputOutputToken,
        }
        const tx = await builder.build(txRequest)
        if (!tx) return null
        return buildQuoteResponse(
          request,
          chainId,
          contractType,
          inputOutputTokenAmount,
          tx,
        )
      }
      case FlashMintContractType.leveragedZeroEx: {
        if (!swapQuoteOutputProviderV2 || inputTokenAmount === undefined) {
          throw new Error('400')
        }
        const leveragedZeroExQuoteProvider = new LeveragedZeroExQuoteProvider(
          rpcUrl,
          swapQuoteProviderV2,
          swapQuoteOutputProviderV2,
        )
        const isIcEth = isAddressEqual(
          indexToken.address,
          getTokenByChainAndSymbol(1, 'icETH').address,
        )
        const flashmintContract = isIcEth
          ? Contracts[1].FlashMintLeveragedZeroEx_AaveV2
          : Contracts[chainId].FlashMintLeveragedZeroEx
        const leveragedQuote = await leveragedZeroExQuoteProvider.getQuote({
          ...request,
          chainId,
          inputAmount: inputTokenAmount,
          outputAmount: request.indexTokenAmount,
          taker: flashmintContract,
        })
        if (!leveragedQuote) return null
        const builder = new LeveragedZeroExBuilder(rpcUrl)
        const txRequest: FlashMintLeveragedZeroExBuilderBuildRequest = {
          chainId,
          isMinting,
          inputToken: inputToken.address,
          inputTokenSymbol: inputToken.symbol,
          inputTokenAmount: BigNumber.from(leveragedQuote.inputAmount),
          outputToken: outputToken.address,
          outputTokenSymbol: outputToken.symbol,
          outputTokenAmount: BigNumber.from(leveragedQuote.outputAmount),
          swapDataDebtCollateral: leveragedQuote.swapDataDebtCollateral,
          swapDataInputOutputToken: leveragedQuote.swapDataInputOutputToken,
          isAave: leveragedQuote.isAave,
        }
        const tx = await builder.build(txRequest)
        if (!tx) return null
        return buildQuoteResponse(
          request,
          chainId,
          contractType,
          BigNumber.from(
            isMinting
              ? leveragedQuote.inputAmount
              : leveragedQuote.outputAmount,
          ),
          tx,
        )
      }
      case FlashMintContractType.zeroEx: {
        const zeroExQuoteProvider = new ZeroExQuoteProvider(
          rpcUrl,
          swapQuoteProviderV2,
        )
        const zeroExQuote = await zeroExQuoteProvider.getQuote({
          ...request,
          indexTokenAmount,
        })
        if (!zeroExQuote) return null
        const builder = new ZeroExTransactionBuilder(rpcUrl)
        const txRequest: FlashMintZeroExBuildRequest = {
          isMinting,
          indexToken: indexToken.address,
          indexTokenSymbol: indexToken.symbol,
          indexTokenAmount,
          inputOutputToken: inputOutputToken.address,
          inputOutputTokenSymbol: inputOutputToken.symbol,
          inputOutputTokenAmount: zeroExQuote.inputOutputTokenAmount,
          componentQuotes: zeroExQuote.componentQuotes,
        }
        const tx = await builder.build(txRequest)
        if (!tx) return null
        return buildQuoteResponse(
          request,
          chainId,
          contractType,
          zeroExQuote.inputOutputTokenAmount,
          tx,
        )
      }
      default:
        return null
    }
  }
}
