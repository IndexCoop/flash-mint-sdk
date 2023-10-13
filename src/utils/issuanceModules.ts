import { ChainId } from '../constants/chains'
import {
  BasicIssuanceModuleAddress,
  BasicIssuanceModulePolygonAddress,
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
  MoneyMarketIndexToken,
  wsETH2,
  GitcoinStakedETHIndex,
  LeveragedrEthStakingYield,
  CoinDeskEthTrendIndex,
} from '../constants/tokens'

export interface IssuanceModule {
  address: string
  isDebtIssuance: boolean
}

function getIndexEthIssuanceModule(tokenSymbol: string): IssuanceModule {
  switch (tokenSymbol) {
    case CoinDeskEthTrendIndex.symbol:
    case LeveragedrEthStakingYield.symbol:
      return {
        address: IndexDebtIssuanceModuleV2Address_v2,
        isDebtIssuance: true,
      }
    default:
      return { address: IndexDebtIssuanceModuleV2Address, isDebtIssuance: true }
  }
}

function getEthIssuanceModuleAddress(tokenSymbol: string): IssuanceModule {
  switch (tokenSymbol) {
    case CoinDeskEthTrendIndex.symbol:
    case DiversifiedStakedETHIndex.symbol:
    case GitcoinStakedETHIndex.symbol:
    case LeveragedrEthStakingYield.symbol:
    case MoneyMarketIndexToken.symbol:
    case wsETH2.symbol:
      return getIndexEthIssuanceModule(tokenSymbol)
    case BTC2xFlexibleLeverageIndex.symbol:
    case ETH2xFlexibleLeverageIndex.symbol:
      return { address: DebtIssuanceModuleAddress, isDebtIssuance: true }
    case InterestCompoundingETHIndex.symbol:
      return { address: DebtIssuanceModuleV2Address, isDebtIssuance: true }
    default:
      return { address: BasicIssuanceModuleAddress, isDebtIssuance: false }
  }
}

function getPolygonIssuanceModuleAddress(tokenSymbol: string): IssuanceModule {
  switch (tokenSymbol) {
    default:
      return {
        address: BasicIssuanceModulePolygonAddress,
        isDebtIssuance: false,
      }
  }
}

export function getIssuanceModule(
  tokenSymbol: string,
  chainId: number = ChainId.Mainnet
): IssuanceModule {
  return chainId === ChainId.Polygon
    ? getPolygonIssuanceModuleAddress(tokenSymbol)
    : getEthIssuanceModuleAddress(tokenSymbol)
}
