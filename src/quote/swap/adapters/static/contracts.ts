import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'
import { arbitrum, base, mainnet } from 'viem/chains'

import ExchangeIssuanceLeveraged from 'constants/abis/ExchangeIssuanceLeveraged.json'
import FlashMintLeveragedAbi from 'constants/abis/FlashMintLeveraged.json'
import FlashMintLeveragedExtendedAbi from 'constants/abis/FlashMintLeveragedExtended.json'
import FlashMintLeveragedMorphoAaveLMAbi from 'constants/abis/FlashMintLeveragedMorphoAaveLM.json'
import FlashMintLeveragedMorphoV2Abi from 'constants/abis/FlashMintLeveragedMorphoV2.json'

import type { Address } from 'viem'

const BTC2X = getTokenByChainAndSymbol(base.id, 'BTC2X')
const BTC3X = getTokenByChainAndSymbol(base.id, 'BTC3X')
const ETH2X = getTokenByChainAndSymbol(base.id, 'ETH2X')
const ETH3X = getTokenByChainAndSymbol(base.id, 'ETH3X')
const icETH = getTokenByChainAndSymbol(mainnet.id, 'icETH')

export function getContract(chainId: number, address: Address): Address {
  if (chainId === mainnet.id) {
    if (isAddressEqual(address, icETH.address)) {
      // ExchangeIssuanceLeveraged
      return '0x981b21A2912A427f491f1e5b9Bf9cCa16FA794e1'
    }
    // FlashMintLeveraged
    return '0x45c00508C14601fd1C1e296eB3C0e3eEEdCa45D0'
  }

  if (chainId === arbitrum.id)
    // FlashMintLeveragedExtended
    return '0xc6b3B4624941287bB7BdD8255302c1b337e42194'

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
  '0xc6b3B4624941287bB7BdD8255302c1b337e42194': FlashMintLeveragedExtendedAbi,
  '0xb86E1EEf76Bc835E73B8C80eb786262C33d086D8':
    FlashMintLeveragedMorphoAaveLMAbi,
  '0xE6c18c4C9FC6909EDa546649EBE33A8159256CBE': FlashMintLeveragedExtendedAbi,
  '0x8bD6eecCb08bEf1Ad035C078E471A0f5b08eFb42': FlashMintLeveragedMorphoV2Abi,
  '0x981b21A2912A427f491f1e5b9Bf9cCa16FA794e1': ExchangeIssuanceLeveraged,
}
