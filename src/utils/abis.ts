import { base } from 'viem/chains'

import FLASHMINT_LEVERAGED_ZEROEX_ABI from 'constants/abis/FlashMintLeveragedZeroEx.json'
import { Contracts } from 'constants/contracts'

import type { Address } from 'viem'

export const FlashMintAbis: { [key: Address]: any } = {
  [Contracts[base.id].FlashMintLeveragedZeroEx]: FLASHMINT_LEVERAGED_ZEROEX_ABI,
}
