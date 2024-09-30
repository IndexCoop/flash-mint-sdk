import { getWrapData } from './wrap-data'

describe('getWrapData()', () => {
  test('returns empty array for unsupported index', async () => {
    const wrapData = getWrapData('DPI')
    expect(wrapData.length).toBe(0)
  })

  test.only('returns correct wrap data for icUSD', async () => {
    const wrapData = getWrapData('icUSD')
    expect(wrapData.length).toBe(5)
    expect(wrapData[0].integrationName).toBe('')
    expect(wrapData[1].integrationName).toBe('Aave_V3_Wrap_V2_Adapter')
    expect(wrapData[2].integrationName).toBe('Compound_V3_USDC_Wrap_V2_Adapter')
    expect(wrapData[3].integrationName).toBe('Aave_V2_Wrap_V2_Adapter')
    expect(wrapData[4].integrationName).toBe('ERC4626_Wrap_V2_Adapter')
    wrapData.forEach((data) => {
      expect(data.wrapData).toBe('0x0000000000000000000000000000000000000000')
    })
  })
})
