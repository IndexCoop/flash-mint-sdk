import { AddressZero } from 'constants/addresses'
import { Exchange, SwapData } from 'utils'

export function getSwapData(lifiResult: any): SwapData | null {
  const steps = lifiResult.includedSteps
  const step = steps[0]
  if (!step) return null
  const isUniswap = lifiResult.toolDetails.name
    .toLowerCase()
    .includes('uniswap')
  const exchange = isUniswap ? Exchange.UniV3 : Exchange.Sushiswap
  const fees = lifiResult.estimate.feeCosts[0].percentage * 100000
  return {
    exchange,
    path: [
      lifiResult.action.fromToken.address,
      lifiResult.action.toToken.address,
    ],
    fees: [fees],
    pool: AddressZero,
  }
}
