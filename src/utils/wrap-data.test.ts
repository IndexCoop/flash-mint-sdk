import { getWrapData } from './wrap-data'

describe('getWrapData()', () => {
  test('returns empty array for unsupported index', async () => {
    const wrapData = getWrapData('DPI')
    expect(wrapData.length).toBe(0)
  })

  test.only('returns correct wrap data for icUSD', async () => {
    const wrapData = getWrapData('icUSD')
    expect(wrapData.length).toBe(5)
    expect(wrapData[0].integrationName).toBe('AaveV3WrapV2Adapter')
    expect(wrapData[1].integrationName).toBe('CompoundV3WrapV2Adapter')
    expect(wrapData[2].integrationName).toBe('ERC4626WrapV2Adapter')
    expect(wrapData[3].integrationName).toBe('ERC4626WrapV2Adapter')
    expect(wrapData[4].integrationName).toBe('ERC4626WrapV2Adapter')
    wrapData.forEach((data) => {
      expect(data.wrapData).toBe('0x0000000000000000000000000000000000000000')
    })
  })
})
