import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from '../constants/chains'
import {
  BasicIssuanceModuleAddress,
  Contracts,
  DebtIssuanceModuleV2Address,
  IndexDebtIssuanceModuleV2Address_v2,
} from '../constants/contracts'

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
  // Mainnet
  switch (tokenSymbol) {
    case getTokenByChainAndSymbol(ChainId.Mainnet, 'hyETH').symbol:
    case getTokenByChainAndSymbol(ChainId.Mainnet, 'BTC2X').symbol:
    case getTokenByChainAndSymbol(ChainId.Mainnet, 'BTC3x').symbol:
    case getTokenByChainAndSymbol(ChainId.Mainnet, 'ETH2X').symbol:
    case getTokenByChainAndSymbol(ChainId.Mainnet, 'ETH3x').symbol:
    case getTokenByChainAndSymbol(ChainId.Mainnet, 'GOLD3x').symbol:
      return {
        address: IndexDebtIssuanceModuleV2Address_v2,
        isDebtIssuance: true,
      }
    case 'icETH':
      return { address: DebtIssuanceModuleV2Address, isDebtIssuance: true }
    default:
      return { address: BasicIssuanceModuleAddress, isDebtIssuance: false }
  }
}
