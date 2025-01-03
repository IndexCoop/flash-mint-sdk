/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import {
  DefiPulseIndex,
  DiversifiedStakedETHIndex,
  ETH,
  HighYieldETHIndex,
  IndexCoopBitcoin2xIndex,
  IndexCoopEthereum2xIndex,
  InterestCompoundingETHIndex,
  MetaverseIndex,
  USDC,
  WETH,
  stETH,
} from 'constants/tokens'
import { QuoteToken } from 'quote/interfaces'

const btc2x: QuoteToken = {
  address: IndexCoopBitcoin2xIndex.address!,
  decimals: 18,
  symbol: IndexCoopBitcoin2xIndex.symbol,
}

const dpi: QuoteToken = {
  address: DefiPulseIndex.address!,
  decimals: 18,
  symbol: DefiPulseIndex.symbol,
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

const mvi: QuoteToken = {
  address: MetaverseIndex.address!,
  decimals: 18,
  symbol: MetaverseIndex.symbol,
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

const weth: QuoteToken = {
  address: WETH.address!,
  decimals: 18,
  symbol: WETH.symbol,
}

export const QuoteTokens = {
  btc2x,
  dpi,
  eth,
  eth2x,
  hyeth,
  iceth,
  mvi,
  steth,
  usdc,
  weth,
}
