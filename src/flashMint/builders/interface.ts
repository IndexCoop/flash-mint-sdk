export interface TransactionBuilder<R, T> {
  build(request: R): Promise<T | null>
}
