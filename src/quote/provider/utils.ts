import { BigNumber } from '@ethersproject/bignumber'
import { TransactionRequest } from '@ethersproject/abstract-provider'

import { ChainId } from 'constants/chains'
import {
  BanklessBEDIndex,
  BTC2xFlexibleLeverageIndex,
  CoinDeskEthTrendIndex,
  DefiPulseIndex,
  DiversifiedStakedETHIndex,
  ETH2xFlexibleLeverageIndex,
  GitcoinStakedETHIndex,
  HighYieldETHIndex,
  IndexCoopBitcoin2xIndex,
  IndexCoopBitcoin3xIndex,
  IndexCoopEthereum2xIndex,
  IndexCoopEthereum3xIndex,
  IndexCoopInverseBitcoinIndex,
  IndexCoopInverseEthereumIndex,
  InterestCompoundingETHIndex,
  MetaverseIndex,
  RealWorldAssetIndex,
  TheUSDCYieldIndex,
} from 'constants/tokens'

import {
  FlashMintContractType,
  FlashMintQuote,
  FlashMintQuoteRequest,
} from './index'

export function buildQuoteResponse(
  request: FlashMintQuoteRequest,
  chainId: number,
  contractType: FlashMintContractType,
  inputOutputTokenAmount: BigNumber, // quote amount
  tx: TransactionRequest
): FlashMintQuote {
  const { isMinting, indexTokenAmount, inputToken, outputToken, slippage } =
    request
  return {
    chainId,
    contractType,
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
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

// Returns contract type for token or null if not supported
export function getContractType(
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
  if (chainId === ChainId.Base) {
    switch (token) {
      case IndexCoopEthereum2xIndex.symbol:
      case IndexCoopEthereum3xIndex.symbol:
        return FlashMintContractType.leveragedExtended
    }
  }
  if (token === HighYieldETHIndex.symbol) {
    return FlashMintContractType.hyeth
  }
  if (token === TheUSDCYieldIndex.symbol) {
    return FlashMintContractType.wrapped
  }
  if (
    token === BanklessBEDIndex.symbol ||
    token === CoinDeskEthTrendIndex.symbol ||
    token === DefiPulseIndex.symbol ||
    token === DiversifiedStakedETHIndex.symbol ||
    token === GitcoinStakedETHIndex.symbol ||
    token === 'ic21' ||
    token === MetaverseIndex.symbol ||
    token === RealWorldAssetIndex.symbol
  )
    return FlashMintContractType.zeroEx
  if (
    token === BTC2xFlexibleLeverageIndex.symbol ||
    token === ETH2xFlexibleLeverageIndex.symbol ||
    token === IndexCoopBitcoin2xIndex.symbol ||
    token === IndexCoopEthereum2xIndex.symbol ||
    token === InterestCompoundingETHIndex.symbol
  )
    return FlashMintContractType.leveraged
  return null
}
