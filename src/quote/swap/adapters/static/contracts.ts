import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'
import { arbitrum, base, mainnet } from 'viem/chains'

import ExchangeIssuanceLeveraged from 'constants/abis/ExchangeIssuanceLeveraged.json'
import FlashMintLeveragedAbi from 'constants/abis/FlashMintLeveraged.json'
import FlashMintLeveragedExtendedAbi from 'constants/abis/FlashMintLeveragedExtended.json'
import FlashMintLeveragedMorphoAaveLMAbi from 'constants/abis/FlashMintLeveragedMorphoAaveLM.json'
import FlashMintLeveragedMorphoV2Abi from 'constants/abis/FlashMintLeveragedMorphoV2.json'

import type { Address } from 'viem'

// base
const BTC2X = getTokenByChainAndSymbol(base.id, 'BTC2X')
const BTC3X = getTokenByChainAndSymbol(base.id, 'BTC3X')
const ETH2X = getTokenByChainAndSymbol(base.id, 'ETH2X')
const ETH3X = getTokenByChainAndSymbol(base.id, 'ETH3X')

// base inverse tokens
const base_iETH1x = getTokenByChainAndSymbol(base.id, 'iETH1x')
const base_iETH2x = getTokenByChainAndSymbol(base.id, 'iETH2x')
const base_iBTC1x = getTokenByChainAndSymbol(base.id, 'iBTC1x')
const base_iBTC2x = getTokenByChainAndSymbol(base.id, 'iBTC2x')

const icETH = getTokenByChainAndSymbol(mainnet.id, 'icETH')

export function getContract(chainId: number, address: Address): Address {
  if (chainId === mainnet.id) {
    if (isAddressEqual(address, icETH.address)) {
      // ExchangeIssuanceLeveraged
      return '0x40e8e58052272496dcf42953CF7e699B522Fe8A3'
    }

    // FlashMintLeveragedAaveFL
    return '0xBc50B57ef01F009A9097df4A921eA1b1AA0f0cFF'
  }

  if (chainId === arbitrum.id) {
    // FlashMintLeveragedAaveFL
    return '0xd5A152a058eDe7331B9ad3521bad03d4CCfD6Bb9'
  }

  // Base
  if (
    isAddressEqual(address, BTC2X.address) ||
    isAddressEqual(address, BTC3X.address)
  ) {
    // FlashMintLeveragedMorphoAaveLM
    return '0xb86E1EEf76Bc835E73B8C80eb786262C33d086D8'
  }

  if (
    isAddressEqual(address, ETH2X.address) ||
    isAddressEqual(address, ETH3X.address) ||
    isAddressEqual(address, base_iETH1x.address) ||
    isAddressEqual(address, base_iETH2x.address) ||
    isAddressEqual(address, base_iBTC1x.address) ||
    isAddressEqual(address, base_iBTC2x.address)
  ) {
    // FlashMintLeveragedExtended
    return '0xE6c18c4C9FC6909EDa546649EBE33A8159256CBE'
  }

  // FlashMintLeveragedMorphoV2
  return '0x8bD6eecCb08bEf1Ad035C078E471A0f5b08eFb42'
}

export const ABI: { [key: string]: any } = {
  '0x45c00508C14601fd1C1e296eB3C0e3eEEdCa45D0': FlashMintLeveragedAbi,
  '0xBc50B57ef01F009A9097df4A921eA1b1AA0f0cFF': FlashMintLeveragedAbi, // Mainnet FlashMintLeveraged (Aave FL)
  '0xb4354dDfc4dda5B1244aa80caf210eEb6D96Db48': FlashMintLeveragedAbi, // New FlashMintLeveraged for ETH3x, GOLD3x
  '0x7663043EBE3f9f5E53cbf56F9F36fA5233ef055D': FlashMintLeveragedAbi, // New FlashMintLeveraged for BTC3x
  '0xd5A152a058eDe7331B9ad3521bad03d4CCfD6Bb9': FlashMintLeveragedAbi, // New FlashMintLeveraged for AAVE2x
  '0xC9E4AEcbD3C7dE90782fa8c9FB3BF993Ee68A3dd': FlashMintLeveragedAbi,
  // ExchangeIssuanceLeveraged (icETH current router)
  '0x40e8e58052272496dcf42953CF7e699B522Fe8A3': ExchangeIssuanceLeveraged,
  '0xc6b3B4624941287bB7BdD8255302c1b337e42194': FlashMintLeveragedExtendedAbi,
  '0xb86E1EEf76Bc835E73B8C80eb786262C33d086D8':
    FlashMintLeveragedMorphoAaveLMAbi,
  '0xE6c18c4C9FC6909EDa546649EBE33A8159256CBE': FlashMintLeveragedExtendedAbi,
  '0x8bD6eecCb08bEf1Ad035C078E471A0f5b08eFb42': FlashMintLeveragedMorphoV2Abi,
  '0x945Db358C69A4Be68aB5b835f2f56af1CcF4E2d1': ExchangeIssuanceLeveraged, // New icETH contract
  '0x981b21A2912A427f491f1e5b9Bf9cCa16FA794e1': ExchangeIssuanceLeveraged, // Old icETH contract
}
