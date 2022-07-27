import { formatUnits } from '@ethersproject/units'

import { wei } from '../utils/numbers'
import { slippageAdjustedTokenAmount } from './slippage'

describe('slippageAdjustedTokenAmount()', () => {
  test('should return correctly adjusted value for issuing', async () => {
    const isMinting = true
    const slippagePercentage = 0.5
    const adjustedAmount = slippageAdjustedTokenAmount(
      wei(100),
      18,
      slippagePercentage,
      isMinting
    )
    const result = formatUnits(adjustedAmount).toLocaleString().substring(0, 5)
    expect(result).toEqual('100.5')
  })

  test('should return correctly adjusted value for redeeming', async () => {
    const isMinting = false
    const slippagePercentage = 0.5
    const adjustedAmount = slippageAdjustedTokenAmount(
      wei(100),
      18,
      slippagePercentage,
      isMinting
    )
    const result = formatUnits(adjustedAmount).toLocaleString().substring(0, 4)
    expect(result).toEqual('99.5')
  })
})
