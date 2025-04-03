import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from '../constants/chains'
import {
  BasicIssuanceModuleAddress,
  BasicIssuanceModulePolygonAddress,
  Contracts,
  DebtIssuanceModuleV2Address,
  IndexDebtIssuanceModuleV2Address_v2,
} from '../constants/contracts'
import {
  IndexCoopBitcoin2xIndex,
  IndexCoopEthereum2xIndex,
  InterestCompoundingETHIndex,
} from '../constants/tokens'

export interface IssuanceModule {
  address: string
  isDebtIssuance: boolean
}

export function getIssuanceModule(
  tokenSymbol: string,
  chainId: number = ChainId.Mainnet,
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
    case getTokenByChainAndSymbol(ChainId.Mainnet, 'hyETH').symbol:
    case IndexCoopBitcoin2xIndex.symbol:
    case IndexCoopEthereum2xIndex.symbol:
      return {
        address: IndexDebtIssuanceModuleV2Address_v2,
        isDebtIssuance: true,
      }
    case InterestCompoundingETHIndex.symbol:
      return { address: DebtIssuanceModuleV2Address, isDebtIssuance: true }
    default:
      return { address: BasicIssuanceModuleAddress, isDebtIssuance: false }
  }
}
