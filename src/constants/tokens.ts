export interface Token {
  symbol: string
  address?: string
  addressOptimism?: string
  addressPolygon?: string
}

// Indices by the Index Coop

export const BanklessBEDIndex: Token = {
  address: '0x2aF1dF3AB0ab157e1E2Ad8F88A7D04fbea0c7dc6',
  symbol: 'BED',
}

export const BTC2xFlexibleLeverageIndex: Token = {
  address: '0x0B498ff89709d3838a063f1dFA463091F9801c2b',
  symbol: 'BTC2x-FLI',
}

export const DefiPulseIndex: Token = {
  address: '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b',
  addressPolygon: '0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369',
  symbol: 'DPI',
}

export const DiversifiedStakedETHIndex: Token = {
  address: '0xa81Ac6782f344AaC63E69996c5aFc96F0b9e1947',
  symbol: 'dsETH',
}

export const ETH2xFlexibleLeverageIndex: Token = {
  address: '0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD',
  symbol: 'ETH2x-FLI',
}

export const InterestCompoundingETHIndex: Token = {
  symbol: 'icETH',
  address: '0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84',
}

export const JPGIndex: Token = {
  address: '0x02e7ac540409d32c90bfb51114003a9e1ff0249c',
  symbol: 'JPG',
}

export const MetaverseIndex: Token = {
  address: '0x72e364F2ABdC788b7E918bc238B21f109Cd634D7',
  addressPolygon: '0xfe712251173A2cd5F5bE2B46Bb528328EA3565E1',
  symbol: 'MVI',
}

// Other

export const ETH: Token = {
  symbol: 'ETH',
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
}

export const MATIC: Token = {
  symbol: 'MATIC',
  addressPolygon: '0x0000000000000000000000000000000000001010',
}

export const sETH2: Token = {
  symbol: 'sETH2',
  address: '0xFe2e637202056d30016725477c5da089Ab0A043A',
}

export const stETH: Token = {
  symbol: 'stETH',
  address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
}

export const USDC: Token = {
  symbol: 'USDC',
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
}

export const WETH: Token = {
  symbol: 'WETH',
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  addressOptimism: '0x4200000000000000000000000000000000000006',
  addressPolygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
}

export const wsETH2: Token = {
  symbol: 'wsETH2',
  address: '0x5dA21D9e63F1EA13D34e48B7223bcc97e3ecD687',
}

export const wstETH: Token = {
  symbol: 'wstETH',
  address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
}

// Deprecated Indices
// These indices are officially not supported any longer by the Index Coop.

export const BTC2xFlexibleLeverageIndexPolygon: Token = {
  symbol: 'BTC2x-FLI-P',
}

export const ETH2xFlexibleLeverageIndexPolygon: Token = {
  symbol: 'ETH2X-FLI-P',
}

export const GMIIndex: Token = {
  symbol: 'GMI',
  address: '0x47110d43175f7f2C2425E7d15792acC5817EB44f',
  addressPolygon: '0x7fb27ee135db455de5ab1ccec66a24cbc82e712d',
}

export const InverseBTCFlexibleLeverageIndex: Token = {
  symbol: 'iBTC-FLI-P',
}

export const InverseETHFlexibleLeverageIndex: Token = {
  symbol: 'iETH-FLI-P',
}

export const InverseMATICFlexibleLeverageIndex: Token = {
  symbol: 'iMATIC-FLI-P',
}

export const MATIC2xFlexibleLeverageIndex: Token = {
  symbol: 'MATIC2x-FLI-P',
}

export const Web3DataEconomyIndex: Token = {
  symbol: 'DATA',
}
