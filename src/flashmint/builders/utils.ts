import type { BigNumber } from '@ethersproject/bignumber'

export function isEmptyString(data: string): boolean {
  return typeof data === 'string' && data.trim().length === 0
}

export function isInvalidAmount(amount: BigNumber): boolean {
  return amount.isZero() || amount.isNegative()
}
