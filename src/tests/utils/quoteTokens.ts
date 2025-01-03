/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import {
  ETH,
  IndexCoopBitcoin2xIndex,
  USDC,
  WETH,
  stETH,
} from 'constants/tokens'
import type { QuoteToken } from 'quote/interfaces'

const btc2x: QuoteToken = {
  address: IndexCoopBitcoin2xIndex.address!,
  decimals: 18,
  symbol: IndexCoopBitcoin2xIndex.symbol,
}

const eth: QuoteToken = {
  symbol: ETH.symbol,
  decimals: 18,
  address: ETH.address!,
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
  eth,
  steth,
  usdc,
  weth,
}
