/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config'
import { JsonRpcProvider } from '@ethersproject/providers'

import { ChainId } from 'constants/chains'
import { ZeroExSwapQuoteProvider } from 'quote'
export { wei } from 'utils/numbers'

export * from './erc20'
export * from './factories'
export * from './factory'
export { QuoteTokens } from './quoteTokens'
export * from './lido'
export * from './providers'
export * from './signers'
export * from './uniswap'
export * from './weth'

// Hardhat
// Try avoiding these single consts in the future and rather use convenience functions below
export const LocalhostProviderUrl = 'http://127.0.0.1:8545/'
export const LocalhostProvider = new JsonRpcProvider(LocalhostProviderUrl)
const LocalhostProviderUrlArbitrum = 'http://127.0.0.1:8548/'
export const LocalhostProviderArbitrum = new JsonRpcProvider(
  LocalhostProviderUrlArbitrum
)

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
    { 'X-INDEXCOOP-API-KEY': process.env.INDEX_0X_API_KEY! },
    get0xSwapPathOverride(chainId)
  )
}
