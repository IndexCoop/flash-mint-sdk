export type Result<T> =
  | { success: true; data: T }
  | {
      success: false
      error: { code: string; message: string; originalError?: unknown }
    }

export interface QuoteProvider<R, Q> {
  getQuote(request: R): Promise<Result<Q>>
}

export interface QuoteToken {
  address: string
  decimals: number
  symbol: string
}
