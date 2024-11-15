/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config'
import { JsonRpcProvider } from '@ethersproject/providers'

import { ChainId } from 'constants/chains'
import { ZeroExSwapQuoteProvider } from 'quote'
export { wei } from 'utils/numbers'

export * from './erc20'
export * from './factories'
export { QuoteTokens } from './quoteTokens'
export * from './lido'
export * from './signers'
export * from './test-factory'
export * from './uniswap'
export * from './weth'

// Alchemy
export const AlchemyProviderUrl = process.env.MAINNET_ALCHEMY_API!
export const AlchemyProviderUrlArbitrum = process.env.ARBITRUM_ALCHEMY_API!
export const AlchemyProvider = new JsonRpcProvider(AlchemyProviderUrl, 1)

// Hardhat
// Try avoiding these single consts in the future and rather use convenience functions below
export const LocalhostProviderUrl = 'http://127.0.0.1:8545/'
export const LocalhostProvider = new JsonRpcProvider(LocalhostProviderUrl)
const LocalhostProviderUrlArbitrum = 'http://127.0.0.1:8548/'
export const LocalhostProviderArbitrum = new JsonRpcProvider(
  LocalhostProviderUrlArbitrum
)

// Try to use these more together with the `getRpcProvider` util function
export function getLocalHostProviderUrl(chainId: number) {
  switch (chainId) {
    case ChainId.Arbitrum:
      return 'http://127.0.0.1:8548/'
    case ChainId.Base:
      return 'http://127.0.0.1:8453/'
    default:
      return 'http://127.0.0.1:8545/'
  }
}

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
