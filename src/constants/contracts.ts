import { ChainId } from 'constants/chains'
import type { Address } from 'viem'

export const Contracts: { [key: number]: { [key: string]: Address } } = {
  [ChainId.Mainnet]: {
    CustomOracleNavIssuanceModule: '0x2344674B23aD076908FD2396373CfE9cd48A1ba3',
    DebtIssuanceModuleV3: '0x86B7C605C03B9bbb0F6A25FBBb63baF15d875193',
    FlashMintHyEthV3: '0xCb1eEA349f25288627f008C5e2a69b684bddDf49',
    FlashMintLeveragedZeroEx: '0x58093c03B4e7804D0127A6D0A5D86dcbd5652113',
    FlashMintLeveragedZeroEx_AaveV2:
      '0xDb97C04B1F09F86d45f9975B88F8Ab4B7e9CE809',
    FlashMintNav: '0x62F160391d2f1e3a176f32F51ADE6Ed8BB2ea1cf',
    FlashMintWrapped: '0x7ddE626dE8CE73229838B5c2F9A71bc7ac207801',
  },
  [ChainId.Arbitrum]: {
    DebtIssuanceModuleV3: '0x4ac26c26116fa976352b70700af58bc2442489d8',
    FlashMintLeveragedExtended: '0xc6b3B4624941287bB7BdD8255302c1b337e42194',
    FlashMintLeveragedZeroEx: '0xdb4b7d3f812D0A8D98A1E17F9750c4E7a6477291',
  },
  [ChainId.Base]: {
    DebtIssuanceModuleV3: '0xa30E87311407dDcF1741901A8F359b6005252F22',
    FlashMintLeveragedAerodrome: '0x0b2aEa82E65Dad8b2718c8a29cdfaD1B8EC77974',
    FlashMintLeveragedMorpho: '0x8bD6eecCb08bEf1Ad035C078E471A0f5b08eFb42',
    FlashMintLeveragedMorphoAaveLM:
      '0xb86E1EEf76Bc835E73B8C80eb786262C33d086D8',
    FlashMintLeveragedExtended: '0xE6c18c4C9FC6909EDa546649EBE33A8159256CBE',
    FlashMintLeveragedZeroEx: '0xBbE31D5946Dd3dabf797744732A7E18cbb4DE2a9',
    FlashMintWrapped: '0xb929Ca7279B193d2B5428eED0AB685ECA9Ed567A',
  },
}

// Index Protocol
export const FlashMintLeveragedAddress =
  '0x45c00508C14601fd1C1e296eB3C0e3eEEdCa45D0'

export const FlashMintLeveragedForCompoundAddress =
  '0xeA716Ed94964Ed0126Fb2fA3b546eD7F209cC2b8'

export const FlashMintZeroExMainnetAddress =
  '0x9d648E5564B794B918d99C84B0fbf4b0bf36ce45'

export const IndexDebtIssuanceModuleV2Address =
  '0xa0a98EB7Af028BE00d04e46e1316808A62a8fd59'

export const IndexDebtIssuanceModuleV2Address_v2 =
  '0x04b59F9F09750C044D7CfbC177561E409085f0f3'

// Set Protocol
export const BasicIssuanceModuleAddress =
  '0xd8EF3cACe8b4907117a45B0b125c68560532F94D'

export const BasicIssuanceModulePolygonAddress =
  '0x38E5462BBE6A72F79606c1A0007468aA4334A92b'

export const DebtIssuanceModuleV2Address =
  '0x69a592D2129415a4A1d1b1E309C17051B7F28d57'

export const ExchangeIssuanceLeveragedMainnetAddress =
  '0x981b21A2912A427f491f1e5b9Bf9cCa16FA794e1'

export const ExchangeIssuanceLeveragedPolygonAddress =
  '0xE86636f23B502B8746A72A1Ed87d65F096E419Db'

export const ExchangeIssuanceZeroExMainnetAddress =
  '0xf42eCDC112365fF79a745B4cf7D4C266bd6E4b25'

export const ExchangeIssuanceZeroExPolygonAddress =
  '0x0F5C21d4929f6F17119f43b0c51E665f12367A19'
