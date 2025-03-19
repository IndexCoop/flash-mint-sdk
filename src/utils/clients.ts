import { http, createPublicClient } from 'viem'
import { base, mainnet } from 'viem/chains'

import { ChainId } from 'constants/chains'

import type { PublicClient, Transport } from 'viem'

type Client = PublicClient<Transport, typeof base | typeof mainnet>

export function createClient(chainId: number): Client | null {
  if (chainId === ChainId.Base) {
    return createPublicClient({
      chain: base,
      transport: http(process.env.BASE_ALCHEMY_API),
    }) as Client
  }
  if (chainId !== ChainId.Mainnet) return null
  return createPublicClient({
    chain: mainnet,
    transport: http(process.env.MAINNET_ALCHEMY_API),
  }) as Client
}

export function createClientWithUrl(
  chainId: number,
  rpcUrl: string,
): Client | null {
  if (chainId === ChainId.Base) {
    return createPublicClient({
      chain: base,
      transport: http(rpcUrl),
    }) as Client
  }
  if (chainId !== ChainId.Mainnet) return null
  return createPublicClient({
    chain: mainnet,
    transport: http(rpcUrl),
  }) as Client
}
