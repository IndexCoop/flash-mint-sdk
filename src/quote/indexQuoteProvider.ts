import { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import {
  FlashMint4626Address,
  FlashMintWrappedAddress,
} from 'constants/contracts'
import {
  BanklessBEDIndex,
  BTC2xFlexibleLeverageIndex,
  DefiPulseIndex,
  DiversifiedStakedETHIndex,
  ETH2xFlexibleLeverageIndex,
  GitcoinStakedETHIndex,
  InterestCompoundingETHIndex,
  MetaverseIndex,
  MoneyMarketIndexToken,
} from 'constants/tokens'
import {
  FlashMintLeveragedBuildRequest,
  FlashMintZeroExBuildRequest,
  LeveragedTransactionBuilder,
  ZeroExTransactionBuilder,
} from 'flashmint'
import {
  FlashMintWrappedBuildRequest,
  FlashMintERC4626BuildRequest,
  WrappedTransactionBuilder,
  ERC4626TransactionBuilder,
} from 'flashmint/builders/wrapped'
import { ZeroExApi } from 'utils'

import { LeveragedQuoteProvider } from './leveraged'
import { QuoteProvider } from './quoteProvider'
import { QuoteToken } from './quoteToken'
import { ERC4626QuoteProvider, WrappedQuoteProvider } from './wrapped'
import { ZeroExQuoteProvider } from './zeroEx'

export enum FlashMintContractType {
  leveraged,
  wrapped,
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
    const contractType = getContractType(indexToken.symbol)
    if (contractType === null) {
      throw new Error('Index token not supported')
    }
    if (requiresZeroExV1(contractType)) {
      if (!zeroExApiV1) {
        throw new Error('Contract type requires ZeroExApiV1 to be defined')
      }
    }
    const contractAddress = getContractAddress(contractType)
    const network = await provider.getNetwork()
    const chainId = network.chainId
    switch (contractType) {
      case FlashMintContractType.wrapped: {
        const wrappedQuoteProvider = new WrappedQuoteProvider(provider)
        const wrappedQuote = await wrappedQuoteProvider.getQuote(request)
        if (!wrappedQuote) return null
        const builder = new WrappedTransactionBuilder(provider)
        const txRequest: FlashMintWrappedBuildRequest = {
          isMinting,
          indexToken: indexToken.address,
          inputOutputToken: inputOutputToken.address,
          inputOutputTokenSymbol: inputOutputToken.symbol,
          indexTokenAmount,
          inputOutputTokenAmount: wrappedQuote.inputOutputTokenAmount,
          componentSwapData: wrappedQuote.componentSwapData,
          componentWrapData: wrappedQuote.componentWrapData,
        }
        const tx = await builder.build(txRequest)
        if (!tx) return null
        return {
          chainId,
          contractType,
          contract: contractAddress,
          isMinting,
          inputToken,
          outputToken,
          indexTokenAmount,
          inputOutputAmount: wrappedQuote.inputOutputTokenAmount,
          slippage,
          tx,
        }
      }
      case FlashMintContractType.erc4626: {
        const wrappedQuoteProvider = new ERC4626QuoteProvider(provider)
        const wrappedQuote = await wrappedQuoteProvider.getQuote(request)
        if (!wrappedQuote) return null
        const builder = new ERC4626TransactionBuilder(provider)
        const txRequest: FlashMintERC4626BuildRequest = {
          isMinting,
          indexToken: indexToken.address,
          inputOutputToken: inputOutputToken.address,
          inputOutputTokenSymbol: inputOutputToken.symbol,
          indexTokenAmount,
          inputOutputTokenAmount: wrappedQuote.inputOutputTokenAmount,
          componentSwapData: wrappedQuote.componentSwapData,
        }
        const tx = await builder.build(txRequest)
        if (!tx) return null
        return {
          chainId,
          contractType,
          contract: contractAddress,
          isMinting,
          inputToken,
          outputToken,
          indexTokenAmount,
          inputOutputAmount: wrappedQuote.inputOutputTokenAmount,
          slippage,
          tx,
        }
      }
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
          /* eslint-disable  @typescript-eslint/no-non-null-assertion */
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

function getContractAddress(contractType: FlashMintContractType): string {
  switch (contractType) {
    case FlashMintContractType.erc4626:
      return FlashMint4626Address
    case FlashMintContractType.wrapped:
      return FlashMintWrappedAddress
    default:
      return ''
  }
}

// Returns contract type for token or null if not supported
function getContractType(token: string): FlashMintContractType | null {
  if (
    token === BanklessBEDIndex.symbol ||
    token === DefiPulseIndex.symbol ||
    token === DiversifiedStakedETHIndex.symbol ||
    token === GitcoinStakedETHIndex.symbol ||
    token === MetaverseIndex.symbol
  )
    return FlashMintContractType.zeroEx
  if (
    token === BTC2xFlexibleLeverageIndex.symbol ||
    token === ETH2xFlexibleLeverageIndex.symbol ||
    token === InterestCompoundingETHIndex.symbol
  )
    return FlashMintContractType.leveraged
  if (token === MoneyMarketIndexToken.symbol)
    return FlashMintContractType.erc4626
  return null
}

function requiresZeroExV1(contractType: FlashMintContractType): boolean {
  if (contractType === FlashMintContractType.leveraged) return true
  if (contractType === FlashMintContractType.zeroEx) return true
  return false
}
