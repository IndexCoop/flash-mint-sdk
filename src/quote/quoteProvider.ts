export interface QuoteProvider {
  getQuote<R, Q>(request: R): Promise<Q | null>
}
