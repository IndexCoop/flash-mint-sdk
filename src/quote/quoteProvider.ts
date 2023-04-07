export interface QuoteProvider<R, Q> {
  getQuote(request: R): Promise<Q | null>
}
