/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import {
  DAI,
  DefiPulseIndex,
  DiversifiedStakedETHIndex,
  ETH,
  GitcoinStakedETHIndex,
  HighYieldETHIndex,
  IndexCoopBitcoin2xIndex,
  IndexCoopEthereum2xIndex,
  InterestCompoundingETHIndex,
  MetaverseIndex,
  RETH,
  TheUSDCYieldIndex,
  USDC,
  USDT,
  WETH,
  sETH2,
  stETH,
  wsETH2,
} from 'constants/tokens'
import { QuoteToken } from 'quote/interfaces'

const btc2x: QuoteToken = {
  address: IndexCoopBitcoin2xIndex.address!,
  decimals: 18,
  symbol: IndexCoopBitcoin2xIndex.symbol,
}

const dai: QuoteToken = {
  address: DAI.address!,
  decimals: 18,
  symbol: DAI.symbol,
}

const dpi: QuoteToken = {
  address: DefiPulseIndex.address!,
  decimals: 18,
  symbol: DefiPulseIndex.symbol,
}

const dseth: QuoteToken = {
  address: DiversifiedStakedETHIndex.address!,
  decimals: 18,
  symbol: DiversifiedStakedETHIndex.symbol,
}

const eth: QuoteToken = {
  symbol: ETH.symbol,
  decimals: 18,
  address: ETH.address!,
}

const eth2x: QuoteToken = {
  symbol: IndexCoopEthereum2xIndex.symbol!,
  decimals: 18,
  address: IndexCoopEthereum2xIndex.address!,
}

const gtcETH = {
  address: GitcoinStakedETHIndex.address!,
  decimals: 18,
  symbol: GitcoinStakedETHIndex.symbol,
}

const hyeth = {
  address: HighYieldETHIndex.address!,
  decimals: 18,
  symbol: HighYieldETHIndex.symbol,
}

const iceth: QuoteToken = {
  symbol: InterestCompoundingETHIndex.symbol,
  decimals: 18,
  address: InterestCompoundingETHIndex.address!,
}

const icusd: QuoteToken = {
  address: TheUSDCYieldIndex.address!,
  decimals: 18,
  symbol: TheUSDCYieldIndex.symbol,
}

const mvi: QuoteToken = {
  address: MetaverseIndex.address!,
  decimals: 18,
  symbol: MetaverseIndex.symbol,
}

const reth: QuoteToken = {
  address: RETH.address!,
  decimals: 18,
  symbol: RETH.symbol,
}

const seth2: QuoteToken = {
  address: sETH2.address!,
  decimals: 18,
  symbol: sETH2.symbol,
}

const steth: QuoteToken = {
  address: stETH.address!,
  decimals: 18,
  symbol: stETH.symbol,
}

const usdc: QuoteToken = {
  address: USDC.address!,
  decimals: 6,
  symbol: USDC.symbol,
}

const usdt: QuoteToken = {
  address: USDT.address!,
  decimals: 6,
  symbol: USDT.symbol,
}

const weth: QuoteToken = {
  address: WETH.address!,
  decimals: 18,
  symbol: WETH.symbol,
}

const wseth: QuoteToken = {
  address: wsETH2.address!,
  decimals: 18,
  symbol: wsETH2.symbol,
}

export const QuoteTokens = {
  btc2x,
  dai,
  dpi,
  dseth,
  eth,
  eth2x,
  gtcETH,
  hyeth,
  iceth,
  icusd,
  mvi,
  reth,
  seth2,
  steth,
  usdc,
  usdt,
  weth,
  wseth,
}
