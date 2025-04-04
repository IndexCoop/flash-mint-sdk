export interface Token {
  symbol: string
  address?: string
  addressArbitrum?: string
  addressBase?: string
  addressOptimism?: string
  addressPolygon?: string
  decimals?: number
}

// Indices by the Index Coop
export const DefiPulseIndex: Token = {
  address: '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b',
  addressPolygon: '0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369',
  symbol: 'DPI',
}

export const IndexCoopBitcoin2xIndex: Token = {
  address: '0xD2AC55cA3Bbd2Dd1e9936eC640dCb4b745fDe759',
  addressArbitrum: '0xeb5bE62e6770137beaA0cC712741165C594F59D7',
  symbol: 'BTC2X',
}

export const IndexCoopBitcoin3xIndex: Token = {
  addressArbitrum: '0x3bDd0d5c0C795b2Bf076F5C8F177c58e42beC0E6',
  symbol: 'BTC3X',
}

export const IndexCoopEthereum2xIndex: Token = {
  address: '0x65c4C0517025Ec0843C9146aF266A2C5a2D148A2',
  addressArbitrum: '0x26d7D3728C6bb762a5043a1d0CeF660988Bca43C',
  addressBase: '0xC884646E6C88d9b172a23051b38B0732Cc3E35a6',
  symbol: 'ETH2X',
}

export const IndexCoopEthereum3xIndex: Token = {
  addressArbitrum: '0xA0A17b2a015c14BE846C5d309D076379cCDfa543',
  addressBase: '0x329f6656792c7d34D0fBB9762FA9A8F852272acb',
  symbol: 'ETH3X',
}

export const InterestCompoundingETHIndex: Token = {
  symbol: 'icETH',
  address: '0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84',
}

export const MetaverseIndex: Token = {
  address: '0x72e364F2ABdC788b7E918bc238B21f109Cd634D7',
  addressPolygon: '0xfe712251173A2cd5F5bE2B46Bb528328EA3565E1',
  symbol: 'MVI',
}

// Other

export const ETH = {
  symbol: 'ETH',
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  decimals: 18,
}

export const stETH: Token = {
  symbol: 'stETH',
  address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
}

export const USDC: Token = {
  symbol: 'USDC',
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  addressArbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  addressBase: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
}

export const WETH: Token = {
  symbol: 'WETH',
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  addressArbitrum: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  addressBase: '0x4200000000000000000000000000000000000006',
  addressOptimism: '0x4200000000000000000000000000000000000006',
  addressPolygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
}
