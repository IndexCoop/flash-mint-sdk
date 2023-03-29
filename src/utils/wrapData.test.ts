import { MoneyMarketIndex } from 'constants/tokens'
import { getIndexTokenMix, getWrapData, IndexTokenMix } from './wrapData'

const compoundWrapAdapterIntegrationName = 'CompoundWrapV2Adapter'
const ZERO_BYTES = '0x0000000000000000000000000000000000000000'

describe('getIndexTokenMix()', () => {
  test('throws error when given undefined token', () => {
    expect(() => getIndexTokenMix('')).toThrowError('Token not defined')
  })

  test('returns correct mix for MMI', async () => {
    const indexTokenMix = getIndexTokenMix(MoneyMarketIndex.symbol)
    expect(indexTokenMix).toBe(IndexTokenMix.UNWRAPPED_ONLY)
  })
})

describe('getWrapData()', () => {
  test('UNWRAPPED_ONLY', async () => {
    const wrapData = getWrapData(IndexTokenMix.UNWRAPPED_ONLY)
    expect(wrapData.length).toBe(6)
    wrapData.forEach((data) => {
      expect(data.integrationName).toBe('')
      expect(data.wrapData).toBe(ZERO_BYTES)
    })
  })

  test('WRAPPED_ONLY', async () => {
    const wrapData = getWrapData(IndexTokenMix.WRAPPED_ONLY)
    expect(wrapData.length).toBe(6)
    wrapData.forEach((data) => {
      expect(data.integrationName).toBe(compoundWrapAdapterIntegrationName)
      expect(data.wrapData).toBe(ZERO_BYTES)
    })
  })

  test('WRAPPED_UNWRAPPED_MIXED', async () => {
    const wrapData = getWrapData(IndexTokenMix.WRAPPED_UNWRAPPED_MIXED)
    expect(wrapData.length).toBe(6)
  })
})
