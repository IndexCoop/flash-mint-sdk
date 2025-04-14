export interface Token {
  symbol: string
  address: string
  addressArbitrum?: string
  addressBase?: string
  addressOptimism?: string
  addressPolygon?: string
  decimals?: number
}

export const ETH = {
  symbol: 'ETH',
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  decimals: 18,
}

export const WETH: Token = {
  symbol: 'WETH',
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  addressArbitrum: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  addressBase: '0x4200000000000000000000000000000000000006',
  addressOptimism: '0x4200000000000000000000000000000000000006',
  addressPolygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
}
