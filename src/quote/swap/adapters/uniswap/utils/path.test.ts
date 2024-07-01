import { getPath } from './path'

const steth = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'
const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

describe('getPath', () => {
  test('returns [input, output] if one is WETH', async () => {
    const path = await getPath(usdc, weth)
    expect(path).toEqual([usdc, weth])
    const path2 = await getPath(weth, usdc)
    expect(path2).toEqual([weth, usdc])
  })

  test('returns [input, weth, output] if neither input nor output token is WETH', async () => {
    const path = await getPath(usdc, steth)
    expect(path).toEqual([usdc, weth, steth])
    const path2 = await getPath(steth, usdc)
    expect(path2).toEqual([steth, weth, usdc])
  })
})
