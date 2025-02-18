export enum ZeroExV2SwapQuoteProviderErrorType {
  insufficientLiquidity = 'insufficientLiquidity',
}

export class ZeroExV2SwapQuoteProviderError extends Error {
  constructor(
    public type: ZeroExV2SwapQuoteProviderErrorType,
    message: string,
  ) {
    super(message)
    this.name = 'ZeroExV2SwapQuoteProviderErrorType'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
