/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ChainId } from 'constants/chains'
import { getRpcProvider } from 'utils/rpc-provider'

export function getAlchemyProviderUrl(chainId: number) {
  switch (chainId) {
    case ChainId.Arbitrum:
      return process.env.ARBITRUM_ALCHEMY_API!
    case ChainId.Base:
      return process.env.BASE_ALCHEMY_API!
    default:
      return process.env.MAINNET_ALCHEMY_API!
  }
}

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

export function getTestRpcProvider(chainId: number) {
  const rpcUrl = getLocalHostProviderUrl(chainId)
  return getRpcProvider(rpcUrl)
}
