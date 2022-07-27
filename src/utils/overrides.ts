import { BigNumber } from '@ethersproject/bignumber'

// For more on overrides, check:
// https://docs.ethers.io/v5/api/contract/contract/#contract-functionsSend
export interface TransactionOverrides {
  gasLimit?: BigNumber
  gasPrice?: BigNumber
  maxFeePerGas?: BigNumber
  maxPriorityFeePerGas?: BigNumber
  nonce?: number
  value?: BigNumber
}
