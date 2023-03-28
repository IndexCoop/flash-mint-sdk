import { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'

import { ComponentSwapData } from '../../utils/componentSwapData'
import { getFlashMintWrappedContract } from '../../utils/contracts'
import { ComponentWrapData } from '../../utils/wrapData'
import { TransactionBuilder } from './interface'

export interface FlashMintWrappedBuildRequest {
  indexToken: string
  inputOutputToken: string
  indexTokenAmount: BigNumber
  inputOutputTokenAmount: BigNumber
  componentSwapData: ComponentSwapData[]
  componentWrapData: ComponentWrapData[]
}

export class WrappedTransactionBuilder
  implements
    TransactionBuilder<FlashMintWrappedBuildRequest, TransactionRequest>
{
  async build(
    request: FlashMintWrappedBuildRequest
  ): Promise<TransactionRequest | null> {
    const isValidRequest = this.isValidRequest(request)
    if (!isValidRequest) return null
    const contract = getFlashMintWrappedContract(undefined)
    // TODO: add all four issue/redeem functions
    // TODO: generate tx
    return {}
  }

  private isEmptyString(data: string): boolean {
    return typeof data === 'string' && data.trim().length == 0
  }

  private isInvalidAmount(amount: BigNumber): boolean {
    return amount.isZero() || amount.isNegative()
  }

  private isValidRequest(request: FlashMintWrappedBuildRequest): boolean {
    const {
      componentSwapData,
      componentWrapData,
      indexToken,
      indexTokenAmount,
      inputOutputToken,
      inputOutputTokenAmount,
    } = request
    if (this.isEmptyString(indexToken)) return false
    if (this.isEmptyString(inputOutputToken)) return false
    if (this.isInvalidAmount(indexTokenAmount)) return false
    if (this.isInvalidAmount(inputOutputTokenAmount)) return false
    if (componentSwapData.length === 0) return false
    if (componentWrapData.length === 0) return false
    return true
  }
}
