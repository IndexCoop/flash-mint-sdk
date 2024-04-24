import {
  Exchange,
  getSwapDataCollateralDebt,
  getSwapDataDebtCollateral,
  getSwapData,
  SwapData,
} from 'utils/swapData'

// 0x keys https://github.com/0xProject/protocol/blob/4f32f3174f25858644eae4c3de59c3a6717a757c/packages/asset-swapper/src/utils/market_operation_utils/types.ts#L38
function get0xEchangeKey(exchange: Exchange): string {
  switch (exchange) {
    case Exchange.Curve:
      return 'Curve'
    case Exchange.Quickswap:
      return 'QuickSwap'
    case Exchange.Sushiswap:
      return 'SushiSwap'
    case Exchange.UniV3:
      return 'Uniswap_V3'
    default:
      return ''
  }
}

// Returns a comma separated string of sources to be included for 0x API calls
export function getIncludedSources(): string {
  const quickswap = get0xEchangeKey(Exchange.Quickswap)
  const sushi = get0xEchangeKey(Exchange.Sushiswap)
  const uniswap = get0xEchangeKey(Exchange.UniV3)
  return [quickswap, sushi, uniswap].toString()
}