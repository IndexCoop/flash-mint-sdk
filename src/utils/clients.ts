import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

import { ChainId } from 'constants/chains'

export function createClient(chainId: number) {
  if (chainId !== ChainId.Mainnet) return null
  return createPublicClient({
    chain: mainnet,
    transport: http(process.env.MAINNET_ALCHEMY_API),
  })
}
