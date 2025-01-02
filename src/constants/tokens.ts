import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'

export interface Token {
  symbol: string
  address?: string
  addressArbitrum?: string
  addressBase?: string
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

export const HighYieldETHIndex: Token = {
  address: '0xc4506022Fb8090774E8A628d5084EED61D9B99Ee',
  symbol: 'hyETH',
}

export const ic21: Token = {
  ...getTokenByChainAndSymbol(1, 'ic21'),
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

export const IndexCoopInverseBitcoinIndex: Token = {
  addressArbitrum: '0x80e58AEA88BCCaAE19bCa7f0e420C1387Cc087fC',
  symbol: 'iBTC1X',
}

export const IndexCoopInverseEthereumIndex: Token = {
  addressArbitrum: '0x749654601a286833aD30357246400D2933b1C89b',
  symbol: 'iETH1X',
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

export const RealWorldAssetIndex: Token = {
  address: '0x7f5f1A44dd6f88cCb54Fe879e144dF644A4aDa24',
  symbol: 'RWA',
}

export const TheUSDCYieldIndex: Token = {
  ...getTokenByChainAndSymbol(ChainId.Mainnet, 'icUSD'),
  addressBase: getTokenByChainAndSymbol(ChainId.Base, 'icUSD').address,
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
  addressArbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  addressBase: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
}

export const USDT: Token = {
  symbol: 'USDT',
  address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
}

export const WETH: Token = {
  symbol: 'WETH',
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  addressArbitrum: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  addressBase: '0x4200000000000000000000000000000000000006',
  addressOptimism: '0x4200000000000000000000000000000000000006',
  addressPolygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
}

export const wsETH2: Token = {
  symbol: 'wsETH2',
  address: '0x5dA21D9e63F1EA13D34e48B7223bcc97e3ecD687',
}
