import { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { ChainId } from 'constants/chains'
import {
  BanklessBEDIndex,
  BTC2xFlexibleLeverageIndex,
  CoinDeskEthTrendIndex,
  DefiPulseIndex,
  DiversifiedStakedETHIndex,
  ETH2xFlexibleLeverageIndex,
  GitcoinStakedETHIndex,
  IndexCoopBitcoin2xIndex,
  IndexCoopBitcoin3xIndex,
  IndexCoopEthereum2xIndex,
  IndexCoopEthereum3xIndex,
  IndexCoopInverseBitcoinIndex,
  IndexCoopInverseEthereumIndex,
  InterestCompoundingETHIndex,
  LeveragedrEthStakingYield,
  MetaverseIndex,
} from 'constants/tokens'
import {
  FlashMintLeveragedBuildRequest,
  FlashMintLeveragedExtendedBuildRequest,
  FlashMintZeroExBuildRequest,
  LeveragedExtendedTransactionBuilder,
  LeveragedTransactionBuilder,
  ZeroExTransactionBuilder,
} from 'flashmint'
import { ZeroExApi, wei } from 'utils'

import { LeveragedQuoteProvider } from './leveraged'
import { LeveragedExtendedQuoteProvider } from './leveraged-extended'
import { QuoteProvider } from './quoteProvider'
import { QuoteToken } from './quoteToken'
import { ZeroExQuoteProvider } from './zeroEx'

export enum FlashMintContractType {
  leveraged,
  leveragedExtended,
  erc4626,
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
  indexTokenAmount: BigNumber
  inputOutputAmount: BigNumber
  slippage: number
  tx: TransactionRequest
}

export class FlashMintQuoteProvider
  implements QuoteProvider<FlashMintQuoteRequest, FlashMintQuote>
{
  constructor(
    private readonly provider: JsonRpcProvider,
    private readonly zeroExApiV1?: ZeroExApi
  ) {}

  async getQuote(
    request: FlashMintQuoteRequest
  ): Promise<FlashMintQuote | null> {
    const { provider, zeroExApiV1 } = this
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
    if (requiresZeroExV1(contractType)) {
      if (!zeroExApiV1) {
        throw new Error('Contract type requires ZeroExApiV1 to be defined')
      }
    }
    switch (contractType) {
      case FlashMintContractType.leveraged: {
        if (!zeroExApiV1) {
          throw new Error('Contract type requires ZeroExApiV1 to be defined')
        }
        const leveragedQuoteProvider = new LeveragedQuoteProvider(
          provider,
          zeroExApiV1
        )
        const leveragedQuote = await leveragedQuoteProvider.getQuote(request)
        if (!leveragedQuote) return null
        const builder = new LeveragedTransactionBuilder(provider)
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
        return {
          chainId,
          contractType,
          /* eslint-disable  @typescript-eslint/no-non-null-assertion */
          contract: tx.to!,
          isMinting,
          inputToken,
          outputToken,
          indexTokenAmount,
          inputOutputAmount: leveragedQuote.inputOutputTokenAmount,
          slippage,
          tx,
        }
      }
      case FlashMintContractType.leveragedExtended: {
        if (!zeroExApiV1) {
          throw new Error('Contract type requires ZeroExApiV1 to be defined')
        }
        const leverageExtendedQuoteProvider =
          new LeveragedExtendedQuoteProvider(provider, zeroExApiV1)
        const leveragedExtendedQuote =
          await leverageExtendedQuoteProvider.getQuote(request)
        if (!leveragedExtendedQuote) return null
        const builder = new LeveragedExtendedTransactionBuilder(provider)
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
        return {
          chainId,
          contractType,
          /* eslint-disable  @typescript-eslint/no-non-null-assertion */
          contract: tx.to!,
          isMinting,
          inputToken,
          outputToken,
          indexTokenAmount,
          inputOutputAmount: leveragedExtendedQuote.inputOutputTokenAmount,
          slippage,
          tx,
        }
      }
      case FlashMintContractType.zeroEx: {
        if (!zeroExApiV1) {
          throw new Error('Contract type requires ZeroExApiV1 to be defined')
        }
        const zeroExQuoteProvider = new ZeroExQuoteProvider(
          provider,
          zeroExApiV1
        )
        const zeroExQuote = await zeroExQuoteProvider.getQuote(request)
        if (!zeroExQuote) return null
        const builder = new ZeroExTransactionBuilder(provider)
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
        return {
          chainId,
          contractType,
          /* eslint-disable @typescript-eslint/no-non-null-assertion */
          contract: tx.to!,
          isMinting,
          inputToken,
          outputToken,
          indexTokenAmount,
          inputOutputAmount: zeroExQuote.inputOutputTokenAmount,
          slippage,
          tx,
        }
      }
      default:
        return null
    }
  }
}

// Returns contract type for token or null if not supported
function getContractType(
  token: string,
  chainId: number
): FlashMintContractType | null {
  if (chainId === ChainId.Arbitrum) {
    switch (token) {
      case IndexCoopBitcoin2xIndex.symbol:
      case IndexCoopBitcoin3xIndex.symbol:
      case IndexCoopEthereum2xIndex.symbol:
      case IndexCoopEthereum3xIndex.symbol:
      case IndexCoopInverseBitcoinIndex.symbol:
      case IndexCoopInverseEthereumIndex.symbol:
        return FlashMintContractType.leveragedExtended
    }
  }
  if (
    token === BanklessBEDIndex.symbol ||
    token === CoinDeskEthTrendIndex.symbol ||
    token === DefiPulseIndex.symbol ||
    token === DiversifiedStakedETHIndex.symbol ||
    token === GitcoinStakedETHIndex.symbol ||
    token === MetaverseIndex.symbol
  )
    return FlashMintContractType.zeroEx
  if (
    token === BTC2xFlexibleLeverageIndex.symbol ||
    token === ETH2xFlexibleLeverageIndex.symbol ||
    token === IndexCoopBitcoin2xIndex.symbol ||
    token === IndexCoopEthereum2xIndex.symbol ||
    token === InterestCompoundingETHIndex.symbol ||
    token === LeveragedrEthStakingYield.symbol
  )
    return FlashMintContractType.leveraged
  return null
}

function requiresZeroExV1(contractType: FlashMintContractType): boolean {
  if (contractType === FlashMintContractType.leveraged) return true
  if (contractType === FlashMintContractType.leveragedExtended) return true
  if (contractType === FlashMintContractType.zeroEx) return true
  return false
}
