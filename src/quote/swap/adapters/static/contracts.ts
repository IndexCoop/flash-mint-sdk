import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'
import { arbitrum, base, mainnet } from 'viem/chains'

import ExchangeIssuanceLeveraged from 'constants/abis/ExchangeIssuanceLeveraged.json'
import FlashMintAaveDeleveredAbi from 'constants/abis/FlashMintAaveDelevered.json'
import FlashMintDexV5Abi from 'constants/abis/FlashMintDexV5.json'
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

// base — post-disengage Morpho leverage tokens. Routed through FlashMintDexV5
// (DEXAdapterV5 with Aerodrome SlipStream support); the leveraged flashmints
// reject these with "TOO MANY COMPONENTS" once the borrow is closed.
const base_uSOL2x = getTokenByChainAndSymbol(base.id, 'uSOL2x')
const base_uSOL3x = getTokenByChainAndSymbol(base.id, 'uSOL3x')
const base_uSUI2x = getTokenByChainAndSymbol(base.id, 'uSUI2x')
const base_uSUI3x = getTokenByChainAndSymbol(base.id, 'uSUI3x')
const base_uXRP2x = getTokenByChainAndSymbol(base.id, 'uXRP2x')
const base_uXRP3x = getTokenByChainAndSymbol(base.id, 'uXRP3x')

// FlashMintDexV5 — non-leveraged FlashMint on Base
const FLASH_MINT_DEX_V5_BASE = '0xdeB2BB9f5F848eCDd4983f908748793dAeC32c7d'

// arbitrum — post-disengage Aave-collateralized leverage tokens. Routed through
// FlashMintAaveDelevered (unwraps aToken components via Aave Pool.withdraw, then
// swaps each underlying to the requested output via DEXAdapterV3). The leveraged
// FlashMintLeveragedAaveFL rejects these once the borrow is closed.
const arb_AAVE2x = getTokenByChainAndSymbol(arbitrum.id, 'AAVE2x')
const arb_LINK2x = getTokenByChainAndSymbol(arbitrum.id, 'LINK2x')
const FLASH_MINT_AAVE_DELEVERED_ARB =
  '0x85eC64C97b6E17e7092cE584a2643C6C824E51FC'

// mainnet exceptions
const icETH = getTokenByChainAndSymbol(mainnet.id, 'icETH')

export function getContract(chainId: number, address: Address): Address {
  if (chainId === mainnet.id) {
    if (isAddressEqual(address, icETH.address)) {
      // ExchangeIssuanceLeveraged
      return '0x40e8e58052272496dcf42953CF7e699B522Fe8A3'
    }

    // FlashMintLeveragedAaveFL
    return '0xb2eb42e5a360834676df36fb3a00aa398dc9d721'
  }

  if (chainId === arbitrum.id) {
    if (
      isAddressEqual(address, arb_AAVE2x.address) ||
      isAddressEqual(address, arb_LINK2x.address)
    ) {
      return FLASH_MINT_AAVE_DELEVERED_ARB
    }
    // FlashMintLeveragedAaveFL
    return '0xd5A152a058eDe7331B9ad3521bad03d4CCfD6Bb9'
  }

  // Base
  if (
    isAddressEqual(address, BTC2X.address) ||
    isAddressEqual(address, BTC3X.address) ||
    isAddressEqual(address, ETH2X.address) ||
    isAddressEqual(address, ETH3X.address) ||
    isAddressEqual(address, base_iETH1x.address) ||
    isAddressEqual(address, base_iETH2x.address) ||
    isAddressEqual(address, base_iBTC1x.address) ||
    isAddressEqual(address, base_iBTC2x.address)
  ) {
    // FlashMintLeveragedMorphoAaveLM
    return '0xb86E1EEf76Bc835E73B8C80eb786262C33d086D8'
  }

  // Post-disengage Morpho leverage products → FlashMintDexV5
  if (
    isAddressEqual(address, base_uSOL2x.address) ||
    isAddressEqual(address, base_uSOL3x.address) ||
    isAddressEqual(address, base_uSUI2x.address) ||
    isAddressEqual(address, base_uSUI3x.address) ||
    isAddressEqual(address, base_uXRP2x.address) ||
    isAddressEqual(address, base_uXRP3x.address)
  ) {
    return FLASH_MINT_DEX_V5_BASE
  }

  // FlashMintLeveragedMorphoV2
  return '0x8bD6eecCb08bEf1Ad035C078E471A0f5b08eFb42'
}

export const ABI: { [key: string]: any } = {
  '0x45c00508C14601fd1C1e296eB3C0e3eEEdCa45D0': FlashMintLeveragedAbi,
  '0xb2eb42e5a360834676df36fb3a00aa398dc9d721': FlashMintLeveragedAbi, // Mainnet FlashMintLeveraged (Aave FL)
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
  '0xdeB2BB9f5F848eCDd4983f908748793dAeC32c7d': FlashMintDexV5Abi, // Base FlashMintDexV5
  [FLASH_MINT_AAVE_DELEVERED_ARB]: FlashMintAaveDeleveredAbi, // Arbitrum FlashMintAaveDelevered
  '0x945Db358C69A4Be68aB5b835f2f56af1CcF4E2d1': ExchangeIssuanceLeveraged, // New icETH contract
  '0x981b21A2912A427f491f1e5b9Bf9cCa16FA794e1': ExchangeIssuanceLeveraged, // Old icETH contract
}
