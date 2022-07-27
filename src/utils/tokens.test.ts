import { ChainId } from '../constants/chains'
import { WETH } from '../constants/tokens'

import { getAddressForToken } from './tokens'

describe('getAddressForToken()', () => {
  test('returns correct addresses or undefined', async () => {
    const mainnetAddress = getAddressForToken(WETH, ChainId.Mainnet)
    const optimismAddress = getAddressForToken(WETH, ChainId.Optimism)
    const polygonAddress = getAddressForToken(WETH, ChainId.Polygon)
    const unsupportedNetworkAddress = getAddressForToken(WETH, 100)
    expect(mainnetAddress).toBeDefined()
    expect(mainnetAddress).toEqual(WETH.address)
    expect(optimismAddress).toBeDefined()
    expect(optimismAddress).toEqual(WETH.addressOptimism)
    expect(polygonAddress).toBeDefined()
    expect(polygonAddress).toEqual(WETH.addressPolygon)
    expect(unsupportedNetworkAddress).not.toBeDefined()
  })
})
