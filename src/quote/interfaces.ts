export interface QuoteProvider<R, Q> {
  getQuote(request: R): Promise<Q | null>
}

export interface QuoteToken {
  address: string
  decimals: number
  symbol: string
}
