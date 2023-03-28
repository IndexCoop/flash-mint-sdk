import { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'

import { ComponentSwapData } from '../../utils/componentSwapData'
import { ComponentWrapData } from '../../utils/wrapData'
import { TransactionBuilder } from './interface'

export interface FlashMintWrappedBuildRequest {
  componentSwapData: ComponentSwapData[]
  componentWrapData: ComponentWrapData[]
  indexTokenAmount: BigNumber
  inputOutputTokenAmount: BigNumber
}

export class WrappedTransactionBuilder
  implements
    TransactionBuilder<FlashMintWrappedBuildRequest, TransactionRequest>
{
  async build(
    request: FlashMintWrappedBuildRequest
  ): Promise<TransactionRequest | null> {
    return null
  }
}
