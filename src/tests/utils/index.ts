import { JsonRpcProvider } from '@ethersproject/providers'

export * from './erc20'
export * from './factories'
export * from './factory'
export { QuoteTokens } from './quoteTokens'
export * from './lido'
export * from './providers'
export * from './signers'
export * from './uniswap'
export * from './weth'
export * from './zeroex'

// Hardhat
// Try avoiding these single consts in the future and rather use convenience functions below
const LocalhostProviderUrlArbitrum = 'http://127.0.0.1:8548/'
export const LocalhostProviderArbitrum = new JsonRpcProvider(
  LocalhostProviderUrlArbitrum
)
