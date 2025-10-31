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

// mainnet exceptions
const icETH = getTokenByChainAndSymbol(mainnet.id, 'icETH')
const eth_BTC3X = getTokenByChainAndSymbol(mainnet.id, 'BTC3x')
const eth_ETH3X = getTokenByChainAndSymbol(mainnet.id, 'ETH3x')
const eth_GOLD3X = getTokenByChainAndSymbol(mainnet.id, 'GOLD3x')

const arb_AAVE2X = getTokenByChainAndSymbol(arbitrum.id, 'AAVE2x')

export function getContract(chainId: number, address: Address): Address {
  if (chainId === mainnet.id) {
    if (isAddressEqual(address, icETH.address)) {
      // ExchangeIssuanceLeveraged
      return '0x945Db358C69A4Be68aB5b835f2f56af1CcF4E2d1'
    }

    if (
      // FlashMintLeveraged for these
      isAddressEqual(address, eth_GOLD3X.address) ||
      isAddressEqual(address, eth_ETH3X.address)
    ) {
      return '0xb4354dDfc4dda5B1244aa80caf210eEb6D96Db48'
    }

    if (isAddressEqual(address, eth_BTC3X.address)) {
      return '0x7663043EBE3f9f5E53cbf56F9F36fA5233ef055D'
    }

    // FlashMintLeveraged
    return '0x45c00508C14601fd1C1e296eB3C0e3eEEdCa45D0'
  }

  if (chainId === arbitrum.id) {
    if (isAddressEqual(address, arb_AAVE2X.address)) {
      return '0xd5A152a058eDe7331B9ad3521bad03d4CCfD6Bb9'
    }
    // FlashMintLeveragedExtended
    return '0xc6b3B4624941287bB7BdD8255302c1b337e42194'
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
    isAddressEqual(address, ETH3X.address)
  ) {
    // FlashMintLeveragedExtended
    return '0xE6c18c4C9FC6909EDa546649EBE33A8159256CBE'
  }

  // FlashMintLeveragedMorphoV2
  return '0x8bD6eecCb08bEf1Ad035C078E471A0f5b08eFb42'
}

export const ABI: { [key: string]: any } = {
  '0x45c00508C14601fd1C1e296eB3C0e3eEEdCa45D0': FlashMintLeveragedAbi,
  '0xb4354dDfc4dda5B1244aa80caf210eEb6D96Db48': FlashMintLeveragedAbi, // New FlashMintLeveraged for ETH3x, GOLD3x
  '0x7663043EBE3f9f5E53cbf56F9F36fA5233ef055D': FlashMintLeveragedAbi, // New FlashMintLeveraged for BTC3x
  '0xd5A152a058eDe7331B9ad3521bad03d4CCfD6Bb9': FlashMintLeveragedAbi, // New FlashMintLeveraged for AAVE2x
  '0xC9E4AEcbD3C7dE90782fa8c9FB3BF993Ee68A3dd': FlashMintLeveragedAbi,
  '0xc6b3B4624941287bB7BdD8255302c1b337e42194': FlashMintLeveragedExtendedAbi,
  '0xb86E1EEf76Bc835E73B8C80eb786262C33d086D8':
    FlashMintLeveragedMorphoAaveLMAbi,
  '0xE6c18c4C9FC6909EDa546649EBE33A8159256CBE': FlashMintLeveragedExtendedAbi,
  '0x8bD6eecCb08bEf1Ad035C078E471A0f5b08eFb42': FlashMintLeveragedMorphoV2Abi,
  '0x945Db358C69A4Be68aB5b835f2f56af1CcF4E2d1': ExchangeIssuanceLeveraged, // New icETH contract
  '0x981b21A2912A427f491f1e5b9Bf9cCa16FA794e1': ExchangeIssuanceLeveraged, // Old icETH contract
}
