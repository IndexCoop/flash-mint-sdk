import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { SwapDataConfig } from './swap-data-config'

import type { StaticProviderQuoteRequest } from './'

export function getSwapData(request: StaticProviderQuoteRequest) {
  const { chainId, inputToken, outputToken, isMinting } = request
  const allTokensForChain = SwapDataConfig[chainId]
  // console.log(allTokensForChain, isMinting)
  const indexToken = isMinting ? outputToken : inputToken
  const tokenData = allTokensForChain[indexToken.symbol]
  // FIXME: check tokens for ETH and use WETH instead if necessary
  const WETH = getTokenByChainAndSymbol(chainId, 'WETH')
  const data = tokenData[WETH!.address]
  console.log(data)
  return data
}
