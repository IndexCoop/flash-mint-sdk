import { LiFiSwapQuoteProvider, ZeroExV2SwapQuoteProvider } from 'quote'

export function getLifiSwapQuoteProvider() {
  return new LiFiSwapQuoteProvider(process.env.LIFI_API_KEY!, 'indexcoop')
}

export function getZeroExV2SwapQuoteProvider() {
  return new ZeroExV2SwapQuoteProvider(process.env.ZEROEX_API_KEY!)
}
