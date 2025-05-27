import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'

import {
  FlashMintHyEthTransactionBuilder,
  LeveragedZeroExBuilder,
  ZeroExTransactionBuilder,
} from 'flashmint'

import { Contracts } from 'constants/contracts'
import {
  FlashMintHyEthQuoteProvider,
  LeveragedZeroExQuoteProvider,
  ZeroExQuoteProvider,
} from 'quote/flashmint/'
import { StaticQuoteProvider } from 'quote/swap/adapters/'
import { buildQuoteResponse, getContractType } from './utils'

import type { TransactionRequest } from '@ethersproject/abstract-provider'
import type {
  FlashMintLeveragedZeroExBuilderBuildRequest,
  FlashMintZeroExBuildRequest,
} from 'flashmint'
import type { QuoteProvider, QuoteToken } from '../interfaces'
import type { Result } from '../interfaces'
import type { SwapQuoteProviderV2 } from '../swap'

const MAX_ITERATIONS_FIXED_INPUT = 10
// Maximum deviation from target fixed input to allow
const MAX_DEVIATIION_FIXED_INPUT = BigNumber.from(5)

export enum FlashMintQuoteProviderErrorCode {
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  ENCODING_ERROR = 'ENCODING_ERROR',
  INDEX_TOKEN_NOT_SUPPORTED = 'INDEX_TOKEN_NOT_SUPPORTED',
  OPTIMIZATION_FAILED_HIGHER_THAN_INPUT = 'OPTIMIZATION_FAILED_HIGHER_THAN_INPUT',
  OPTIMIZATION_FAILED_MAX_DEVIATION = 'OPTIMIZATION_FAILED_MAX_DEVIATION',
  QUOTE_FAILED = 'QUOTE_FAILED',
}

export enum FlashMintContractType {
  hyeth = 0,
  leveragedZeroEx = 1,
  zeroEx = 2,
  static = 3,
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
  quoteAmount: BigNumber
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

  async getFixedInputQuote(
    request: FlashMintQuoteRequest,
  ): Promise<Result<FlashMintQuote>> {
    if (!request.isMinting) {
      return this.getQuote(request)
    }

    console.log('getFlashMintQuote', request)
    const { chainId, inputToken, isMinting, outputToken, slippage } = request

    if (request.inputTokenAmount == null) {
      throw new Error('Input token amount required for fixed input quote')
    }

    const inputTokenAmount = BigNumber.from(request.inputTokenAmount)
    let indexTokenAmount = BigNumber.from(request.indexTokenAmount)

    const slippageBasisPoints = BigNumber.from(
      Math.max(Math.round(slippage * 100), 1),
    )
    let remainingIterations = MAX_ITERATIONS_FIXED_INPUT
    let factor = BigNumber.from(0)
    let currentInputAmount = inputTokenAmount
    const targetInputAmount = inputTokenAmount
      .mul(BigNumber.from(10000).sub(slippageBasisPoints))
      .div(BigNumber.from(10000))

    let flashmintQuoteResult: Result<FlashMintQuote>
    do {
      flashmintQuoteResult = await this.getQuote({
        isMinting,
        inputToken,
        outputToken,
        indexTokenAmount: indexTokenAmount.toString(),
        inputTokenAmount:
          outputToken.symbol === 'hyETH' ? request.inputTokenAmount : undefined,
        slippage: 0,
        chainId,
      })

      // If there is no FlashMint quote, return immediately
      if (!flashmintQuoteResult.success) return flashmintQuoteResult
      currentInputAmount = flashmintQuoteResult.data.inputOutputAmount
      console.log('currentInputAmount', currentInputAmount.toString())
      console.log('targetInputAmount', targetInputAmount.toString())

      factor = BigNumber.from(10000)
        .mul(targetInputAmount)
        .div(currentInputAmount)

      if (factor.lt(1)) {
        factor = BigNumber.from(1)
      }
      console.log('factor', factor.toString())

      indexTokenAmount = indexTokenAmount.mul(factor).div(BigNumber.from(10000))
      remainingIterations--
    } while (
      remainingIterations > 1 &&
      factor != null &&
      currentInputAmount != null &&
      (MAX_DEVIATIION_FIXED_INPUT.lt(Math.abs(Number(factor) - 10000)) ||
        currentInputAmount > inputTokenAmount)
    )

    if (currentInputAmount.gt(inputTokenAmount)) {
      return {
        success: false,
        error: {
          code: FlashMintQuoteProviderErrorCode.OPTIMIZATION_FAILED_HIGHER_THAN_INPUT,
          message: `Optimization result ${currentInputAmount} is higher than user input ${inputTokenAmount}`,
        },
      }
    }

    if (MAX_DEVIATIION_FIXED_INPUT.lt(Math.abs(Number(factor) - 10000))) {
      return {
        success: false,
        error: {
          code: FlashMintQuoteProviderErrorCode.OPTIMIZATION_FAILED_MAX_DEVIATION,
          message: `Could not determine index amount to get within ${MAX_DEVIATIION_FIXED_INPUT} BP from given target input, final factor ${factor}`,
        },
      }
    }

    return await this.getQuote({
      isMinting,
      inputToken,
      outputToken,
      indexTokenAmount: indexTokenAmount.toString(),
      inputTokenAmount: inputTokenAmount.toString(),
      slippage,
      chainId,
    })
  }

  async getQuote(
    request: FlashMintQuoteRequest,
  ): Promise<Result<FlashMintQuote>> {
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
      return {
        success: false,
        error: {
          code: FlashMintQuoteProviderErrorCode.INDEX_TOKEN_NOT_SUPPORTED,
          message: `Unsupported index token: ${indexToken.symbol}`,
        },
      }
    }

    switch (contractType) {
      case FlashMintContractType.hyeth: {
        if (!swapQuoteOutputProviderV2 || inputTokenAmount === undefined) {
          return {
            success: false,
            error: {
              code: FlashMintQuoteProviderErrorCode.CONFIGURATION_ERROR,
              message: 'Swap quote output provider is not configured correctly',
            },
          }
        }

        const hyethQuoteProvider = new FlashMintHyEthQuoteProvider(
          rpcUrl,
          swapQuoteProviderV2,
          swapQuoteOutputProviderV2,
        )
        const hyethQuoteResult = await hyethQuoteProvider.getQuote({
          isMinting,
          inputToken,
          outputToken,
          indexTokenAmount: indexTokenAmount.toBigInt(),
          inputAmount: BigInt(inputTokenAmount),
          slippage,
        })

        if (!hyethQuoteResult.success)
          return {
            success: false,
            error: {
              code: FlashMintQuoteProviderErrorCode.QUOTE_FAILED,
              message: 'Error fetching hyETH quote.',
              originalError: hyethQuoteResult.error,
            },
          }

        const hyethQuote = hyethQuoteResult.data

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
            ? BigNumber.from(inputTokenAmount)
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

        if (!tx) {
          return {
            success: false,
            error: {
              code: FlashMintQuoteProviderErrorCode.ENCODING_ERROR,
              message: 'Error encoding hyETH transaction.',
            },
          }
        }

        return {
          success: true,
          data: buildQuoteResponse(
            request,
            chainId,
            contractType,
            inputOutputTokenAmount,
            BigNumber.from(hyethQuote.quoteAmount.toString()),
            tx,
          ),
        }
      }
      case FlashMintContractType.leveragedZeroEx: {
        if (!swapQuoteOutputProviderV2 || inputTokenAmount === undefined) {
          return {
            success: false,
            error: {
              code: FlashMintQuoteProviderErrorCode.CONFIGURATION_ERROR,
              message: 'Swap quote output provider is not configured correctly',
            },
          }
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

        const leveragedQuoteResult =
          await leveragedZeroExQuoteProvider.getQuote({
            ...request,
            chainId,
            inputAmount: inputTokenAmount,
            outputAmount: request.indexTokenAmount,
            taker: flashmintContract,
          })

        if (!leveragedQuoteResult.success) {
          return {
            success: false,
            error: {
              code: FlashMintQuoteProviderErrorCode.QUOTE_FAILED,
              message: 'Error fetching leveragedZeroEx quote.',
              originalError: leveragedQuoteResult.error,
            },
          }
        }

        const leveragedQuote = leveragedQuoteResult.data

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
        if (!tx) {
          return {
            success: false,
            error: {
              code: FlashMintQuoteProviderErrorCode.ENCODING_ERROR,
              message: 'Error encoding leveragedZeroEx transaction.',
            },
          }
        }

        return {
          success: true,
          data: buildQuoteResponse(
            request,
            chainId,
            contractType,
            BigNumber.from(
              isMinting
                ? leveragedQuote.inputAmount
                : leveragedQuote.outputAmount,
            ),
            BigNumber.from(leveragedQuote.quoteAmount),
            tx,
          ),
        }
      }
      case FlashMintContractType.zeroEx: {
        const zeroExQuoteProvider = new ZeroExQuoteProvider(
          rpcUrl,
          swapQuoteProviderV2,
        )

        const zeroExQuoteResult = await zeroExQuoteProvider.getQuote({
          ...request,
          indexTokenAmount,
        })

        if (!zeroExQuoteResult.success) {
          return {
            success: false,
            error: {
              code: FlashMintQuoteProviderErrorCode.QUOTE_FAILED,
              message: 'Error fetching zeroex quote.',
              originalError: zeroExQuoteResult.error,
            },
          }
        }

        const zeroExQuote = zeroExQuoteResult.data

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

        if (!tx) {
          return {
            success: false,
            error: {
              code: FlashMintQuoteProviderErrorCode.ENCODING_ERROR,
              message: 'Error encoding zeroex transaction.',
            },
          }
        }

        return {
          success: true,
          data: buildQuoteResponse(
            request,
            chainId,
            contractType,
            zeroExQuote.inputOutputTokenAmount,
            zeroExQuote.quoteAmmount,
            tx,
          ),
        }
      }
      case FlashMintContractType.static: {
        const staticQuoteProvider = new StaticQuoteProvider(rpcUrl)
        const staticQuoteResult = await staticQuoteProvider.getQuote({
          chainId,
          isMinting,
          inputToken,
          outputToken,
          inputAmount: BigInt(inputTokenAmount ?? 0),
          outputAmount: BigInt(request.indexTokenAmount),
          slippage,
        })

        if (!staticQuoteResult) {
          return {
            success: false,
            error: {
              code: FlashMintQuoteProviderErrorCode.QUOTE_FAILED,
              message: 'Error fetching static quote.',
            },
          }
        }

        let txRequest: TransactionRequest = {
          to: staticQuoteResult.tx.to ?? undefined,
          data: staticQuoteResult.tx.data,
        }

        if (staticQuoteResult.tx.value) {
          txRequest = {
            ...txRequest,
            value: BigNumber.from(staticQuoteResult.tx.value.toString()),
          }
        }

        return {
          success: true,
          data: buildQuoteResponse(
            request,
            chainId,
            contractType,
            BigNumber.from(
              isMinting
                ? staticQuoteResult.inputAmount
                : staticQuoteResult.outputAmount,
            ),
            BigNumber.from(staticQuoteResult.quoteAmount.toString()),
            txRequest,
          ),
        }
      }
    }
  }
}
