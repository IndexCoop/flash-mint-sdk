import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'

import {
  FlashMintHyEthTransactionBuilder,
  LeveragedAerodromeBuilder,
  LeveragedExtendedTransactionBuilder,
  LeveragedTransactionBuilder,
  LeveragedZeroExBuilder,
  ZeroExTransactionBuilder,
} from 'flashmint'
import { LeveragedAerodromeQuoteProvider } from 'quote/flashmint/leveraged-aerodrome'
import { wei } from 'utils'
import { getRpcProvider } from 'utils/rpc-provider'

import { Contracts } from 'constants/contracts'
import { LeveragedMorphoAaveLmBuilder } from 'flashmint/builders/leveraged-morpho-aave'
import { LeveragedMorphoAaveLmQuoteProvider } from 'quote/flashmint/leveraged-morpho-aave'
import { StaticSwapQuoteProvider } from 'quote/swap/adapters/static'
import { FlashMintHyEthQuoteProvider } from '../flashmint/hyeth'
import { LeveragedQuoteProvider } from '../flashmint/leveraged'
import { LeveragedExtendedQuoteProvider } from '../flashmint/leveraged-extended'
import { ZeroExQuoteProvider } from '../flashmint/zeroEx'
import { buildQuoteResponse, getContractType } from './utils'

import type { TransactionRequest } from '@ethersproject/abstract-provider'
import type {
  FlashMintLeveragedAerodromBuildRequest,
  FlashMintLeveragedBuildRequest,
  FlashMintLeveragedExtendedBuildRequest,
  FlashMintLeveragedZeroExBuilderBuildRequest,
  FlashMintZeroExBuildRequest,
} from 'flashmint'
import {
  type FlashMintLeveragedMorphoBuildRequest,
  LeveragedMorphoBuilder,
} from 'flashmint/builders/leveraged-morpho'
import type { FlashMintLeveragedMorphoAaveLmBuildRequest } from 'flashmint/builders/leveraged-morpho-aave'
import { LeveragedMorphoQuoteProvider } from 'quote/flashmint/leveraged-morpho'
import { LeveragedZeroExQuoteProvider } from 'quote/flashmint/leveraged-zeroex'
import type { QuoteProvider, QuoteToken } from '../interfaces'
import type { SwapQuoteProvider, SwapQuoteProviderV2 } from '../swap'

export enum FlashMintContractType {
  hyeth = 0,
  leveraged = 1,
  leveragedAerodrome = 2,
  leveragedExtended = 3,
  leveragedMorpho = 4,
  leveragedMorphoAaveLM = 5,
  leveragedZeroEx = 6,
  zeroEx = 7,
}

export interface FlashMintQuoteRequest {
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
    private readonly swapQuoteProvider: SwapQuoteProvider,
    private readonly swapQuoteProviderV2?: SwapQuoteProviderV2,
    private readonly swapQuoteOutputProviderV2?: SwapQuoteProviderV2,
  ) {}

  async getQuote(
    request: FlashMintQuoteRequest,
  ): Promise<FlashMintQuote | null> {
    const {
      rpcUrl,
      swapQuoteProvider,
      swapQuoteProviderV2,
      swapQuoteOutputProviderV2,
    } = this
    const provider = getRpcProvider(rpcUrl)
    const { inputToken, inputTokenAmount, isMinting, outputToken, slippage } =
      request
    const indexTokenAmount = BigNumber.from(request.indexTokenAmount)
    const indexToken = isMinting ? outputToken : inputToken
    const inputOutputToken = isMinting ? inputToken : outputToken
    const network = await provider.getNetwork()
    const chainId = network.chainId
    const contractType = getContractType(indexToken.symbol, chainId)
    if (contractType === null) {
      throw new Error('Index token not supported')
    }
    switch (contractType) {
      case FlashMintContractType.hyeth: {
        if (!swapQuoteProviderV2) {
          throw new Error('400')
        }
        const hyethQuoteProvider = new FlashMintHyEthQuoteProvider(
          rpcUrl,
          swapQuoteProviderV2,
        )
        const hyethQuote = await hyethQuoteProvider.getQuote({
          isMinting,
          inputToken,
          outputToken,
          indexTokenAmount: indexTokenAmount.toBigInt(),
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
      case FlashMintContractType.leveraged: {
        const leveragedQuoteProvider = new LeveragedQuoteProvider(
          rpcUrl,
          swapQuoteProvider,
        )
        const leveragedQuote = await leveragedQuoteProvider.getQuote({
          ...request,
          indexTokenAmount,
        })
        if (!leveragedQuote) return null
        const builder = new LeveragedTransactionBuilder(rpcUrl)
        const txRequest: FlashMintLeveragedBuildRequest = {
          isMinting,
          indexToken: indexToken.address,
          indexTokenSymbol: indexToken.symbol,
          indexTokenAmount,
          inputOutputToken: inputOutputToken.address,
          inputOutputTokenSymbol: inputOutputToken.symbol,
          inputOutputTokenAmount: leveragedQuote.inputOutputTokenAmount,
          swapDataDebtCollateral: leveragedQuote.swapDataDebtCollateral,
          swapDataPaymentToken: leveragedQuote.swapDataPaymentToken,
        }
        const tx = await builder.build(txRequest)
        if (!tx) return null
        return buildQuoteResponse(
          request,
          chainId,
          contractType,
          leveragedQuote.inputOutputTokenAmount,
          tx,
        )
      }
      case FlashMintContractType.leveragedAerodrome: {
        if (!inputTokenAmount) {
          throw new Error(
            'Must set `inputTokenAmount` for quote request with contract type leveragedAerodrome ',
          )
        }
        const { isMinting } = request
        const leverageAerodromeQuoteProvider =
          new LeveragedAerodromeQuoteProvider(rpcUrl, swapQuoteProvider)
        const leveragedAerodromeQuote =
          await leverageAerodromeQuoteProvider.getQuote({
            ...request,
            chainId,
            inputAmount: isMinting
              ? request.inputTokenAmount!
              : request.indexTokenAmount,
            outputAmount: isMinting
              ? request.indexTokenAmount
              : request.inputTokenAmount!,
          })
        if (!leveragedAerodromeQuote) return null
        const builder = new LeveragedAerodromeBuilder(rpcUrl)
        const txRequest: FlashMintLeveragedAerodromBuildRequest = {
          chainId,
          isMinting,
          inputToken: inputToken.address,
          inputTokenSymbol: inputToken.symbol,
          outputToken: outputToken.address,
          outputTokenSymbol: outputToken.symbol,
          inputTokenAmount: leveragedAerodromeQuote.inputAmount,
          outputTokenAmount: leveragedAerodromeQuote.ouputAmount,
          swapDataDebtCollateral:
            leveragedAerodromeQuote.swapDataDebtCollateral,
          swapDataInputOutputToken:
            leveragedAerodromeQuote.swapDataInputOutputToken,
        }
        const tx = await builder.build(txRequest)
        if (!tx) return null
        return buildQuoteResponse(
          request,
          chainId,
          contractType,
          isMinting
            ? leveragedAerodromeQuote.inputAmount
            : leveragedAerodromeQuote.ouputAmount,
          tx,
        )
      }
      case FlashMintContractType.leveragedExtended: {
        const leverageExtendedQuoteProvider =
          new LeveragedExtendedQuoteProvider(rpcUrl, swapQuoteProvider)
        const leveragedExtendedQuote =
          await leverageExtendedQuoteProvider.getQuote({
            ...request,
            indexTokenAmount,
          })
        if (!leveragedExtendedQuote) return null
        const builder = new LeveragedExtendedTransactionBuilder(rpcUrl)
        const txRequest: FlashMintLeveragedExtendedBuildRequest = {
          isMinting,
          inputToken: inputToken.address,
          inputTokenSymbol: inputToken.symbol,
          outputToken: outputToken.address,
          outputTokenSymbol: outputToken.symbol,
          inputTokenAmount: leveragedExtendedQuote.inputTokenAmount,
          outputTokenAmount: leveragedExtendedQuote.outputTokenAmount,
          swapDataDebtCollateral: leveragedExtendedQuote.swapDataDebtCollateral,
          swapDataInputOutputToken: leveragedExtendedQuote.swapDataPaymentToken,
          swapDataInputTokenForETH:
            leveragedExtendedQuote.swapDataDebtCollateral,
          // Below not used for now
          priceEstimateInflator: wei(0.9), // For the price estimate inflator, increasing it towards 1.0 (but always slightly less) should reduce gas costs but can also lead to revertions.
          maxDust: wei(0.00001), // maxDust = 0.01 % * inputTokenAmount
        }
        const tx = await builder.build(txRequest)
        if (!tx) return null
        return buildQuoteResponse(
          request,
          chainId,
          contractType,
          leveragedExtendedQuote.inputOutputTokenAmount,
          tx,
        )
      }
      case FlashMintContractType.leveragedMorpho: {
        if (!inputTokenAmount) {
          throw new Error(
            'Must set `inputTokenAmount` for quote request with contract type leveragedMorpho ',
          )
        }
        const { isMinting } = request
        const swapQuoteProvider = new StaticSwapQuoteProvider()
        const leverageMorphoQuoteProvider = new LeveragedMorphoQuoteProvider(
          rpcUrl,
          swapQuoteProvider,
        )
        const leveragedMorphoQuote = await leverageMorphoQuoteProvider.getQuote(
          {
            ...request,
            chainId,
            inputAmount: isMinting
              ? request.inputTokenAmount!
              : request.indexTokenAmount,
            outputAmount: isMinting
              ? request.indexTokenAmount
              : request.inputTokenAmount!,
            taker: '0x0',
          },
        )
        if (!leveragedMorphoQuote) return null
        const builder = new LeveragedMorphoBuilder(rpcUrl)
        const txRequest: FlashMintLeveragedMorphoBuildRequest = {
          chainId,
          isMinting,
          inputToken: inputToken.address,
          inputTokenSymbol: inputToken.symbol,
          outputToken: outputToken.address,
          outputTokenSymbol: outputToken.symbol,
          inputTokenAmount: leveragedMorphoQuote.inputAmount,
          outputTokenAmount: leveragedMorphoQuote.outputAmount,
          swapDataDebtCollateral: leveragedMorphoQuote.swapDataDebtCollateral,
          swapDataInputOutputToken:
            leveragedMorphoQuote.swapDataInputOutputToken,
        }
        const tx = await builder.build(txRequest)
        if (!tx) return null
        return buildQuoteResponse(
          request,
          chainId,
          contractType,
          isMinting
            ? leveragedMorphoQuote.inputAmount
            : leveragedMorphoQuote.outputAmount,
          tx,
        )
      }
      case FlashMintContractType.leveragedMorphoAaveLM: {
        if (!inputTokenAmount) {
          throw new Error(
            'Must set `inputTokenAmount` for quote request with contract type leveragedMorphoAaveLM ',
          )
        }
        const { isMinting } = request
        const swapQuoteProvider = new StaticSwapQuoteProvider()
        const leverageAerodromeQuoteProvider =
          new LeveragedMorphoAaveLmQuoteProvider(rpcUrl, swapQuoteProvider)
        const leveragedAerodromeQuote =
          await leverageAerodromeQuoteProvider.getQuote({
            ...request,
            chainId,
            inputAmount: isMinting
              ? request.inputTokenAmount!
              : request.indexTokenAmount,
            outputAmount: isMinting
              ? request.indexTokenAmount
              : request.inputTokenAmount!,
            taker: '0x0',
          })
        if (!leveragedAerodromeQuote) return null
        const builder = new LeveragedMorphoAaveLmBuilder(rpcUrl)
        const txRequest: FlashMintLeveragedMorphoAaveLmBuildRequest = {
          chainId,
          isMinting,
          inputToken: inputToken.address,
          inputTokenSymbol: inputToken.symbol,
          outputToken: outputToken.address,
          outputTokenSymbol: outputToken.symbol,
          inputTokenAmount: leveragedAerodromeQuote.inputAmount,
          outputTokenAmount: leveragedAerodromeQuote.outputAmount,
          swapDataDebtCollateral:
            leveragedAerodromeQuote.swapDataDebtCollateral,
          swapDataInputOutputToken:
            leveragedAerodromeQuote.swapDataInputOutputToken,
        }
        const tx = await builder.build(txRequest)
        if (!tx) return null
        return buildQuoteResponse(
          request,
          chainId,
          contractType,
          isMinting
            ? leveragedAerodromeQuote.inputAmount
            : leveragedAerodromeQuote.outputAmount,
          tx,
        )
      }
      case FlashMintContractType.leveragedZeroEx: {
        const { inputTokenAmount } = request
        if (
          !swapQuoteProviderV2 ||
          !swapQuoteOutputProviderV2 ||
          inputTokenAmount === undefined
        ) {
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
          inputAmount: inputTokenAmount!,
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
        if (!swapQuoteProviderV2) {
          throw new Error('400')
        }
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
