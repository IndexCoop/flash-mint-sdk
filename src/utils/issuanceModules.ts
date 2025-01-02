import { ChainId } from '../constants/chains'
import {
  BasicIssuanceModuleAddress,
  BasicIssuanceModulePolygonAddress,
  Contracts,
  DebtIssuanceModuleAddress,
  DebtIssuanceModuleV2Address,
  IndexDebtIssuanceModuleV2Address,
  IndexDebtIssuanceModuleV2Address_v2,
} from '../constants/contracts'
import {
  BTC2xFlexibleLeverageIndex,
  ETH2xFlexibleLeverageIndex,
  DiversifiedStakedETHIndex,
  InterestCompoundingETHIndex,
  GitcoinStakedETHIndex,
  CoinDeskEthTrendIndex,
  IndexCoopEthereum2xIndex,
  IndexCoopBitcoin2xIndex,
  HighYieldETHIndex,
  RealWorldAssetIndex,
  TheUSDCYieldIndex,
  ic21,
} from '../constants/tokens'

export interface IssuanceModule {
  address: string
  isDebtIssuance: boolean
}

export function getIssuanceModule(
  tokenSymbol: string,
  chainId: number = ChainId.Mainnet
): IssuanceModule {
  if (chainId === ChainId.Arbitrum) {
    return {
      address: Contracts[chainId].DebtIssuanceModuleV3,
      isDebtIssuance: true,
    }
  }
  if (chainId === ChainId.Base) {
    return {
      address: Contracts[chainId].DebtIssuanceModuleV3,
      isDebtIssuance: true,
    }
  }
  if (chainId === ChainId.Polygon)
    return {
      address: BasicIssuanceModulePolygonAddress,
      isDebtIssuance: false,
    }
  // Mainnet
  switch (tokenSymbol) {
    case BTC2xFlexibleLeverageIndex.symbol:
    case ETH2xFlexibleLeverageIndex.symbol:
      return { address: DebtIssuanceModuleAddress, isDebtIssuance: true }
    case CoinDeskEthTrendIndex.symbol:
    case DiversifiedStakedETHIndex.symbol:
    case HighYieldETHIndex.symbol:
    case ic21.symbol:
    case IndexCoopBitcoin2xIndex.symbol:
    case IndexCoopEthereum2xIndex.symbol:
    case RealWorldAssetIndex.symbol:
      return {
        address: IndexDebtIssuanceModuleV2Address_v2,
        isDebtIssuance: true,
      }
    case GitcoinStakedETHIndex.symbol:
    case 'wsETH2':
      return { address: IndexDebtIssuanceModuleV2Address, isDebtIssuance: true }
    case InterestCompoundingETHIndex.symbol:
      return { address: DebtIssuanceModuleV2Address, isDebtIssuance: true }
    case TheUSDCYieldIndex.symbol:
      return {
        address: Contracts[ChainId.Mainnet].DebtIssuanceModuleV3,
        isDebtIssuance: true,
      }
    default:
      return { address: BasicIssuanceModuleAddress, isDebtIssuance: false }
  }
}
