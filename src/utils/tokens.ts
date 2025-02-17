import { ChainId } from '../constants/chains'
import type { Token } from '../constants/tokens'

export function getAddressForToken(
  token: Token,
  chainId: number | undefined,
): string | undefined {
  switch (chainId) {
    case ChainId.Arbitrum:
      return token.addressArbitrum
    case ChainId.Mainnet:
      return token.address
    case ChainId.Optimism:
      return token.addressOptimism
    case ChainId.Polygon:
      return token.addressPolygon
    default:
      return undefined
  }
}
