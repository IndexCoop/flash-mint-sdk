import { convertToLiFiSlippage } from './utils'

describe('convertTo0xSlippage()', () => {
  it('should convert slippage to lifi slippage format', () => {
    const slippage = 0.5
    const result = convertToLiFiSlippage(slippage)
    expect(result).toBe(0.005)
  })

  it('should convert slippage to lifi slippage format', () => {
    const slippage = 1
    const result = convertToLiFiSlippage(slippage)
    expect(result).toBe(0.01)
  })

  it('should convert slippage to lifi slippage format', () => {
    const slippage = 0.1
    const result = convertToLiFiSlippage(slippage)
    expect(result).toBe(0.001)
  })

  it('should convert slippage to lifi slippage format', () => {
    const slippage = 0
    const result = convertToLiFiSlippage(slippage)
    expect(result).toBe(0)
  })

  it('should convert slippage to lifi slippage format', () => {
    const slippage = -1
    const result = convertToLiFiSlippage(slippage)
    expect(result).toBe(0)
  })

  it('should convert slippage to lifi slippage format', () => {
    const slippage = 101
    const result = convertToLiFiSlippage(slippage)
    expect(result).toBe(1)
  })
})
