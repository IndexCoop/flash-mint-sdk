import { convertTo0xSlippage } from './utils'

describe('convertTo0xSlippage()', () => {
  it('should convert slippage to 0x slippage format (bps)', () => {
    const slippage = 5
    const result = convertTo0xSlippage(slippage)
    expect(result).toBe(500)
  })

  it('should convert slippage to 0x slippage format (bps)', () => {
    const slippage = 1
    const result = convertTo0xSlippage(slippage)
    expect(result).toBe(100)
  })

  it('should convert slippage to 0x slippage format (bps)', () => {
    const slippage = 0.1
    const result = convertTo0xSlippage(slippage)
    expect(result).toBe(10)
  })

  it('should convert slippage to 0x slippage format (bps)', () => {
    const slippage = 0
    const result = convertTo0xSlippage(slippage)
    expect(result).toBe(0)
  })

  it('should convert slippage to 0x slippage format (bps)', () => {
    const slippage = -1
    const result = convertTo0xSlippage(slippage)
    expect(result).toBe(0)
  })

  it('should convert slippage to 0x slippage format (bps)', () => {
    const slippage = 101
    const result = convertTo0xSlippage(slippage)
    expect(result).toBe(100)
  })
})
