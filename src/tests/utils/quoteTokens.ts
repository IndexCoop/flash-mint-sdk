/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import {
  BTC2xFlexibleLeverageIndex,
  CoinDeskEthTrendIndex,
  DAI,
  DefiPulseIndex,
  DiversifiedStakedETHIndex,
  ETH,
  ETH2xFlexibleLeverageIndex,
  GitcoinStakedETHIndex,
  InterestCompoundingETHIndex,
  LeveragedrEthStakingYield,
  MetaverseIndex,
  RETH,
  USDC,
  USDT,
  WETH,
  sETH2,
  stETH,
  wsETH2,
} from 'constants/tokens'
import { QuoteToken } from 'quote/quoteToken'

const btc2xfli: QuoteToken = {
  address: BTC2xFlexibleLeverageIndex.address!,
  decimals: 18,
  symbol: BTC2xFlexibleLeverageIndex.symbol,
}

const cdeti: QuoteToken = {
  address: CoinDeskEthTrendIndex.address!,
  decimals: 18,
  symbol: CoinDeskEthTrendIndex.symbol,
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

const eth2xfli: QuoteToken = {
  symbol: ETH2xFlexibleLeverageIndex.symbol,
  decimals: 18,
  address: ETH2xFlexibleLeverageIndex.address!,
}

const gtcETH = {
  address: GitcoinStakedETHIndex.address!,
  decimals: 18,
  symbol: GitcoinStakedETHIndex.symbol,
}

const iceth: QuoteToken = {
  symbol: InterestCompoundingETHIndex.symbol,
  decimals: 18,
  address: InterestCompoundingETHIndex.address!,
}

const icreth: QuoteToken = {
  symbol: LeveragedrEthStakingYield.symbol,
  decimals: 18,
  address: LeveragedrEthStakingYield.address!,
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
  btc2xfli,
  cdeti,
  dai,
  dpi,
  dseth,
  eth,
  eth2xfli,
  gtcETH,
  iceth,
  icreth,
  mvi,
  reth,
  seth2,
  steth,
  usdc,
  usdt,
  weth,
  wseth,
}
