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

export const CoinDeskEthTrendIndex: Token = {
  address: '0x55b2CFcfe99110C773f00b023560DD9ef6C8A13B',
  symbol: 'cdETI',
}

export const DefiPulseIndex: Token = {
  address: '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b',
  addressPolygon: '0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369',
  symbol: 'DPI',
}

export const DiversifiedStakedETHIndex: Token = {
  address: '0x341c05c0E9b33C0E38d64de76516b2Ce970bB3BE',
  symbol: 'dsETH',
}

export const ETH2xFlexibleLeverageIndex: Token = {
  address: '0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD',
  symbol: 'ETH2x-FLI',
}

export const GitcoinStakedETHIndex: Token = {
  address: '0x36c833Eed0D376f75D1ff9dFDeE260191336065e',
  symbol: 'gtcETH',
}

export const IndexCoopEthereum2xIndex: Token = {
  address: '0x31F13653433B6c48fD5B19945cD9ab20621F8d4B',
  symbol: 'ETH2X',
}

export const InterestCompoundingETHIndex: Token = {
  symbol: 'icETH',
  address: '0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84',
}

export const LeveragedrEthStakingYield: Token = {
  symbol: 'icRETH',
  address: '0xcCdAE12162566E3f29fEfA7Bf7F5b24C644493b5',
}

export const MetaverseIndex: Token = {
  address: '0x72e364F2ABdC788b7E918bc238B21f109Cd634D7',
  addressPolygon: '0xfe712251173A2cd5F5bE2B46Bb528328EA3565E1',
  symbol: 'MVI',
}

// Other

export const DAI: Token = {
  symbol: 'DAI',
  address: '0x6b175474e89094c44da98b954eedeac495271d0f',
}

export const ETH: Token = {
  symbol: 'ETH',
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
}

export const MATIC: Token = {
  symbol: 'MATIC',
  addressPolygon: '0x0000000000000000000000000000000000001010',
}

export const RETH: Token = {
  symbol: 'rETH',
  address: '0xae78736Cd615f374D3085123A210448E74Fc6393',
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

export const USDT: Token = {
  symbol: 'USDT',
  address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
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
