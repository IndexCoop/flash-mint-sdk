import { DAI, MoneyMarketIndex, USDC, USDT, WETH } from 'constants/tokens'
import { QuoteToken } from 'quote/quoteToken'

const dai: QuoteToken = {
  address: DAI.address!,
  decimals: 18,
  symbol: DAI.symbol,
}

const mmi: QuoteToken = {
  address: MoneyMarketIndex.address!,
  decimals: 18,
  symbol: MoneyMarketIndex.symbol,
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
  dai,
  mmi,
  usdc,
  usdt,
  weth,
}
