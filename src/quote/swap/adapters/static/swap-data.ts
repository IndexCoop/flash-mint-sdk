import { SwapDataConfig } from './swap-data-config'

import type { StaticSwapQuoteProviderQuoteRequest } from './'

export function getSwapDataDebtForCollateral(
  request: StaticSwapQuoteProviderQuoteRequest,
) {
  const { chainId, inputToken, outputToken, isMinting } = request
  const allTokensForChain = SwapDataConfig[chainId]
  console.log(allTokensForChain, isMinting)
}
