import { ChainId } from '../constants/chains'
import {
  BasicIssuanceModuleAddress,
  BasicIssuanceModulePolygonAddress,
  DebtIssuanceModuleAddress,
  DebtIssuanceModuleV2Address,
  DebtIssuanceModuleV2PolygonAddress,
  IndexDebtIssuanceModuleV2Address,
} from '../constants/contracts'
import {
  BTC2xFlexibleLeverageIndex,
  ETH2xFlexibleLeverageIndex,
  ETH2xFlexibleLeverageIndexPolygon,
  EthereumDiversifiedStakingIndex,
  GMIIndex,
  InverseETHFlexibleLeverageIndex,
  InverseMATICFlexibleLeverageIndex,
  JPGIndex,
  MATIC2xFlexibleLeverageIndex,
  wsETH2,
} from '../constants/tokens'

export interface IssuanceModule {
  address: string
  isDebtIssuance: boolean
}

function getIndexEthIssuanceModule(tokenSymbol: string): IssuanceModule {
  switch (tokenSymbol) {
    default:
      return { address: IndexDebtIssuanceModuleV2Address, isDebtIssuance: true }
  }
}

function getEthIssuanceModuleAddress(tokenSymbol: string): IssuanceModule {
  switch (tokenSymbol) {
    case EthereumDiversifiedStakingIndex.symbol:
    case wsETH2.symbol:
      return getIndexEthIssuanceModule(tokenSymbol)
    case BTC2xFlexibleLeverageIndex.symbol:
    case ETH2xFlexibleLeverageIndex.symbol:
    case GMIIndex.symbol:
      return { address: DebtIssuanceModuleAddress, isDebtIssuance: true }
    case JPGIndex.symbol:
      return { address: DebtIssuanceModuleV2Address, isDebtIssuance: true }
    default:
      return { address: BasicIssuanceModuleAddress, isDebtIssuance: false }
  }
}

function getPolygonIssuanceModuleAddress(tokenSymbol: string): IssuanceModule {
  switch (tokenSymbol) {
    case ETH2xFlexibleLeverageIndexPolygon.symbol:
    case GMIIndex.symbol:
    case InverseETHFlexibleLeverageIndex.symbol:
    case InverseMATICFlexibleLeverageIndex.symbol:
    case MATIC2xFlexibleLeverageIndex.symbol:
      return {
        address: DebtIssuanceModuleV2PolygonAddress,
        isDebtIssuance: true,
      }
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
