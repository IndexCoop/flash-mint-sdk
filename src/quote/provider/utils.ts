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
} from 'constants/tokens'

import { FlashMintContractType } from './index'

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
  if (
    token === BanklessBEDIndex.symbol ||
    token === CoinDeskEthTrendIndex.symbol ||
    token === DefiPulseIndex.symbol ||
    token === DiversifiedStakedETHIndex.symbol ||
    token === GitcoinStakedETHIndex.symbol ||
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
