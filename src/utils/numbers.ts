import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'

export const wei = (input: number | string, power = 18): BigNumber => {
  const value = typeof input === 'number' ? input.toString() : input
  return parseUnits(value, power)
}
