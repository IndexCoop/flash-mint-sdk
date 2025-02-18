import type { BigNumber } from '@ethersproject/bignumber'

export interface BuildRequest {
  // chainId: number
  isMinting: boolean
  inputToken: string
  outputToken: string
  inputTokenSymbol: string
  outputTokenSymbol: string
  inputTokenAmount: BigNumber
  outputTokenAmount: BigNumber
}

export interface TransactionBuilder<R, T> {
  build(request: R): Promise<T | null>
}
