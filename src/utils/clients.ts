import { createPublicClient, http } from 'viem'
import { base, mainnet } from 'viem/chains'

import { ChainId } from 'constants/chains'

export function createClient(chainId: number) {
  if (chainId === ChainId.Base) {
    return createPublicClient({
      chain: base,
      transport: http(process.env.BASE_ALCHEMY_API),
    })
  }
  if (chainId !== ChainId.Mainnet) return null
  return createPublicClient({
    chain: mainnet,
    transport: http(process.env.MAINNET_ALCHEMY_API),
  })
}
