import { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'

import {
  FlashMintLeveragedBuildRequest,
  FlashMintLeveragedExtendedBuildRequest,
  FlashMintZeroExBuildRequest,
  LeveragedExtendedTransactionBuilder,
  LeveragedTransactionBuilder,
  ZeroExTransactionBuilder,
} from 'flashmint'
import { wei } from 'utils'

import { LeveragedQuoteProvider } from '../flashmint/leveraged'
import { LeveragedExtendedQuoteProvider } from '../flashmint/leveraged-extended'
import { ZeroExQuoteProvider } from '../flashmint/zeroEx'
import { QuoteProvider, QuoteToken } from '../interfaces'
import { SwapQuoteProvider } from '../swap'

import { getContractType } from './utils'
import { getRpcProvider } from 'utils/rpc-provider'
import { FlashMintHyEthQuoteProvider } from 'quote/flashmint/hyeth'
import { FlashMintHyEthTransactionBuilder } from 'flashmint/builders/hyeth'

export enum FlashMintContractType {
  hyeth,
  leveraged,
  leveragedExtended,
  zeroEx,
}

export interface FlashMintQuoteRequest {
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: BigNumber
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
    private readonly swapQuoteProvider: SwapQuoteProvider
  ) {}

  async getQuote(
    request: FlashMintQuoteRequest
  ): Promise<FlashMintQuote | null> {
    const { rpcUrl, swapQuoteProvider } = this
    const provider = getRpcProvider(rpcUrl)
    const { indexTokenAmount, inputToken, isMinting, outputToken, slippage } =
      request
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
        const hyethQuoteProvider = new FlashMintHyEthQuoteProvider(
          rpcUrl,
          swapQuoteProvider
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
          hyethQuote.inputOutputTokenAmount.toString()
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
        return {
          chainId,
          contractType,
          /* eslint-disable @typescript-eslint/no-non-null-assertion */
          contract: tx.to!,
          isMinting,
          inputToken,
          outputToken,
          inputAmount: isMinting ? inputOutputTokenAmount : indexTokenAmount,
          outputAmount: isMinting ? indexTokenAmount : inputOutputTokenAmount,
          indexTokenAmount,
          inputOutputAmount: inputOutputTokenAmount,
          slippage,
          tx,
        }
      }
      case FlashMintContractType.leveraged: {
        const leveragedQuoteProvider = new LeveragedQuoteProvider(
          rpcUrl,
          swapQuoteProvider
        )
        const leveragedQuote = await leveragedQuoteProvider.getQuote(request)
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
        const { inputOutputTokenAmount } = leveragedQuote
        return {
          chainId,
          contractType,
          /* eslint-disable @typescript-eslint/no-non-null-assertion */
          contract: tx.to!,
          isMinting,
          inputToken,
          outputToken,
          inputAmount: isMinting ? inputOutputTokenAmount : indexTokenAmount,
          outputAmount: isMinting ? indexTokenAmount : inputOutputTokenAmount,
          indexTokenAmount,
          inputOutputAmount: inputOutputTokenAmount,
          slippage,
          tx,
        }
      }
      case FlashMintContractType.leveragedExtended: {
        const leverageExtendedQuoteProvider =
          new LeveragedExtendedQuoteProvider(rpcUrl, swapQuoteProvider)
        const leveragedExtendedQuote =
          await leverageExtendedQuoteProvider.getQuote(request)
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
            leveragedExtendedQuote.swapDataDebtCollateral, // TODO: check
          priceEstimateInflator: wei(0.9), // TODO: For the price estimate inflator, increasing it towards 1.0 (but always slightly less) should reduce gas costs but can also lead to revertions.
          maxDust: wei(0.00001), // TODO: maxDust = 0.01 % * inputTokenAmount
        }
        const tx = await builder.build(txRequest)
        if (!tx) return null
        const { inputOutputTokenAmount } = leveragedExtendedQuote
        return {
          chainId,
          contractType,
          /* eslint-disable @typescript-eslint/no-non-null-assertion */
          contract: tx.to!,
          isMinting,
          inputToken,
          outputToken,
          inputAmount: isMinting ? inputOutputTokenAmount : indexTokenAmount,
          outputAmount: isMinting ? indexTokenAmount : inputOutputTokenAmount,
          indexTokenAmount,
          inputOutputAmount: inputOutputTokenAmount,
          slippage,
          tx,
        }
      }
      case FlashMintContractType.zeroEx: {
        const zeroExQuoteProvider = new ZeroExQuoteProvider(
          rpcUrl,
          swapQuoteProvider
        )
        const zeroExQuote = await zeroExQuoteProvider.getQuote(request)
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
        const { inputOutputTokenAmount } = zeroExQuote
        return {
          chainId,
          contractType,
          /* eslint-disable @typescript-eslint/no-non-null-assertion */
          contract: tx.to!,
          isMinting,
          inputToken,
          outputToken,
          inputAmount: isMinting ? inputOutputTokenAmount : indexTokenAmount,
          outputAmount: isMinting ? indexTokenAmount : inputOutputTokenAmount,
          indexTokenAmount,
          inputOutputAmount: inputOutputTokenAmount,
          slippage,
          tx,
        }
      }
      default:
        return null
    }
  }
}
