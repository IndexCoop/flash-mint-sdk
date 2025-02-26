import { ChainId } from 'constants/chains'
import { ZeroExSwapQuoteProvider } from 'quote'

function get0xSwapPathOverride(chainId: number) {
  switch (chainId) {
    case ChainId.Arbitrum:
      return '/arbitrum/swap/v1/quote'
    case ChainId.Base:
      return '/base/swap/v1/quote'
    default:
      return '/mainnet/swap/v1/quote'
  }
}

export function getZeroExSwapQuoteProvider(chainId: number) {
  const index0xApiBaseUrl = process.env.INDEX_0X_API
  return new ZeroExSwapQuoteProvider(
    index0xApiBaseUrl,
    '',
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { 'X-INDEXCOOP-API-KEY': process.env.INDEX_0X_API_KEY! },
    get0xSwapPathOverride(chainId),
  )
}

// export function getZeroExV2SwapQuoteProvider() {
//   return new ZeroExV2SwapQuoteProvider(process.env.ZEROEX_API_KEY!)
// }
