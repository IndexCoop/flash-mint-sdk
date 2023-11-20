import { getWrapData } from './wrapData'

const erc4626WrapV2AdapterName = 'ERC4626WrapV2Adapter'
const ZERO_BYTES = '0x0000000000000000000000000000000000000000'

describe('getWrapData()', () => {
  test('returns empty array for unsupported index', async () => {
    const wrapData = getWrapData('DPI')
    expect(wrapData.length).toBe(0)
  })
})
