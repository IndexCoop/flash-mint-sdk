import { http, createPublicClient } from 'viem'
import { arbitrum, base, mainnet } from 'viem/chains'

import { ChainId } from 'constants/chains'

import type { PublicClient, Transport } from 'viem'

type Client = PublicClient<
  Transport,
  typeof arbitrum | typeof base | typeof mainnet
>

export function createClientWithUrl(
  chainId: number,
  rpcUrl: string,
): Client | null {
  if (chainId === ChainId.Arbitrum) {
    return createPublicClient({
      chain: arbitrum,
      transport: http(rpcUrl),
    }) as Client
  }
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
