import { getTokenAddressOrWeth } from 'utils'
import {
  isAaveDeleveredRedeemEntry,
  isDexV5Entry,
  type LeveragedConfigEntry,
  type StaticConfigEntry,
  SwapDataConfig,
} from './swap-data-config'

import type { StaticQuoteRequest } from './'

export function getSwapData(
  request: StaticQuoteRequest,
): StaticConfigEntry | null {
  const { chainId, inputToken, outputToken, isMinting } = request
  const indexToken = isMinting ? outputToken : inputToken
  const inputOutputToken = isMinting ? inputToken : outputToken
  try {
    const allTokensForChain = SwapDataConfig[chainId]
    const tokenData = allTokensForChain[indexToken.symbol]
    const inputTokenAddress = getTokenAddressOrWeth(
      inputOutputToken.address,
      chainId,
    )
    const data = tokenData[inputTokenAddress]

    if (!data) return null

    // dexV5 entries already carry separate Issue and Redeem swap data, so no
    // path-reverse is needed (or possible — componentSwapData is an array per
    // component, not a single round-trip path).
    if (isDexV5Entry(data)) {
      return data
    }

    // AaveV3DeleveredRedeemer entries have no swap data at all — the contract
    // unwraps aTokens via Aave Pool.withdraw, no DEX leg involved. Return verbatim.
    if (isAaveDeleveredRedeemEntry(data)) {
      return data
    }

    const leveraged = data as LeveragedConfigEntry
    if (!isMinting) {
      const cloned = structuredClone(leveraged)
      cloned.swapDataDebtForCollateral.path.reverse()
      cloned.swapDataDebtForCollateral.fees.reverse()
      cloned.swapDataInputToken.path.reverse()
      cloned.swapDataInputToken.fees.reverse()

      if (
        'tickSpacing' in cloned.swapDataDebtForCollateral &&
        'tickSpacing' in cloned.swapDataInputToken
      ) {
        cloned.swapDataDebtForCollateral.tickSpacing.reverse()
        cloned.swapDataInputToken.tickSpacing.reverse()
      }
      return cloned
    }

    return leveraged
  } catch (error) {
    console.error(
      `Error fetching swap data for ${indexToken.symbol} - ${inputOutputToken.symbol} on ${chainId}:`,
      error,
    )
    return null
  }
}
