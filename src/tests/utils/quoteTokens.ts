/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import {
  BTC2xFlexibleLeverageIndex,
  DAI,
  DiversifiedStakedETHIndex,
  ETH,
  ETH2xFlexibleLeverageIndex,
  InterestCompoundingETHIndex,
  MetaverseIndex,
  MoneyMarketIndexToken,
  USDC,
  USDT,
  WETH,
} from 'constants/tokens'
import { QuoteToken } from 'quote/quoteToken'

const btc2xfli: QuoteToken = {
  address: BTC2xFlexibleLeverageIndex.address!,
  decimals: 18,
  symbol: BTC2xFlexibleLeverageIndex.symbol,
}

const dai: QuoteToken = {
  address: DAI.address!,
  decimals: 18,
  symbol: DAI.symbol,
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

const iceth: QuoteToken = {
  symbol: InterestCompoundingETHIndex.symbol,
  decimals: 18,
  address: InterestCompoundingETHIndex.address!,
}

const mmi: QuoteToken = {
  address: MoneyMarketIndexToken.address!,
  decimals: 18,
  symbol: MoneyMarketIndexToken.symbol,
}

const mvi: QuoteToken = {
  address: MetaverseIndex.address!,
  decimals: 18,
  symbol: MetaverseIndex.symbol,
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

export const QuoteTokens = {
  btc2xfli,
  dai,
  dseth,
  eth,
  eth2xfli,
  iceth,
  mmi,
  mvi,
  usdc,
  usdt,
  weth,
}
