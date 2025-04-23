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
  let data = tokenData[inputTokenAddress]

  if (!isMinting) {
    data = {
      ...data,
      swapDataDebtForCollateral: {
        ...data.swapDataDebtForCollateral,
        path: data.swapDataDebtForCollateral.path.reverse(),
        fees: data.swapDataDebtForCollateral.fees.reverse(),
      },
      swapDataInputToken: {
        ...data.swapDataInputToken,
        path: data.swapDataInputToken.path.reverse(),
        fees: data.swapDataInputToken.fees.reverse(),
      },
    }

    if (
      'tickSpacing' in data.swapDataDebtForCollateral &&
      'tickSpacing' in data.swapDataInputToken
    ) {
      data.swapDataInputToken.tickSpacing =
        data.swapDataInputToken.tickSpacing.reverse()
      data.swapDataInputToken.tickSpacing =
        data.swapDataInputToken.tickSpacing.reverse()
    }
  }

  return data
}
