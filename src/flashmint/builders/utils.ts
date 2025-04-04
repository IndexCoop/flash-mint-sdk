import { Exchange } from 'utils'

import type { BigNumber } from '@ethersproject/bignumber'
import type { SwapData, SwapDataV2, SwapDataV5 } from 'utils'
import { isAddress } from 'viem'

export function isEmptyString(data: string): boolean {
  return typeof data === 'string' && data.trim().length === 0
}

export function isInvalidAmount(amount: BigNumber): boolean {
  return amount.isZero() || amount.isNegative()
}

export function isValidSwapData(
  swapData: SwapData | SwapDataV5 | null,
): boolean {
  if (!swapData) return false
  if (swapData.exchange === Exchange.None) {
    if (swapData.pool.length !== 42) return false
    return true
  }
  if (
    swapData.exchange === Exchange.UniV3 &&
    swapData.fees.length !== swapData.path.length - 1
  )
    return false
  if (swapData.path.length === 0) return false
  if (swapData.pool.length !== 42) return false
  return true
}

export function isValidSwapDataV2(swapData: SwapDataV2 | null): boolean {
  if (!swapData) return false
  if (!isAddress(swapData.swapTarget)) return false
  if (isEmptyString(swapData.callData)) return false
  return true
}
