import { ChainId } from 'constants/chains'
import type { Address } from 'viem'

export const Contracts: { [key: number]: { [key: string]: Address } } = {
  [ChainId.Mainnet]: {
    DebtIssuanceModuleV3: '0x86B7C605C03B9bbb0F6A25FBBb63baF15d875193',
    ExchangeIssuanceZeroEx: '0x8760FCD90c82e1e95e55047b6b6A0F22dc07d7d1', // redeployed version (March 2025)
    FlashMintHyEthV3: '0xCb1eEA349f25288627f008C5e2a69b684bddDf49',
    FlashMintLeveragedZeroEx: '0x58093c03B4e7804D0127A6D0A5D86dcbd5652113',
    FlashMintLeveragedZeroEx_AaveV2:
      '0x8B46956eA9a87c0AD3cb71911dDdEd23bE10e04d',
  },
  [ChainId.Arbitrum]: {
    DebtIssuanceModuleV3: '0x4ac26c26116fa976352b70700af58bc2442489d8',
    FlashMintLeveragedZeroEx: '0xdb4b7d3f812D0A8D98A1E17F9750c4E7a6477291',
  },
  [ChainId.Base]: {
    DebtIssuanceModuleV3: '0xa30E87311407dDcF1741901A8F359b6005252F22',
    FlashMintLeveragedZeroEx: '0xBbE31D5946Dd3dabf797744732A7E18cbb4DE2a9',
  },
}

// Index Protocol (hyETH)
export const IndexDebtIssuanceModuleV2Address_v2 =
  '0x04b59F9F09750C044D7CfbC177561E409085f0f3'

// Set Protocol
export const BasicIssuanceModuleAddress =
  '0xd8EF3cACe8b4907117a45B0b125c68560532F94D'

export const DebtIssuanceModuleV2Address =
  '0x69a592D2129415a4A1d1b1E309C17051B7F28d57'
