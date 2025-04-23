import { getTokenAddressOrWeth } from 'utils'
import { SwapDataConfig } from './swap-data-config'

import type { StaticQuoteRequest } from './'

export function getSwapData(request: StaticQuoteRequest) {
  const { chainId, inputToken, outputToken, isMinting } = request
  const indexToken = isMinting ? outputToken : inputToken
  const inputOutputToken = isMinting ? inputToken : outputToken
  const allTokensForChain = SwapDataConfig[chainId]
  const tokenData = allTokensForChain[indexToken.symbol]
  const inputTokenAddress = getTokenAddressOrWeth(
    inputOutputToken.address,
    chainId,
  )
  const data = tokenData[inputTokenAddress]
  // TODO: reverse paths + fees for redemptions
  console.log(data)
  return data
}
