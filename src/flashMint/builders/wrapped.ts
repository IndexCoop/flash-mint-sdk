import { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { PopulatedTransaction } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'

import { ComponentSwapData } from '../../utils/componentSwapData'
import { getFlashMintWrappedContract } from '../../utils/contracts'
import { ComponentWrapData } from '../../utils/wrapData'
import { TransactionBuilder } from './interface'

export interface FlashMintWrappedBuildRequest {
  isMinting: boolean
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
  constructor(private readonly provider: JsonRpcProvider) {}

  async build(
    request: FlashMintWrappedBuildRequest
  ): Promise<TransactionRequest | null> {
    const isValidRequest = this.isValidRequest(request)
    if (!isValidRequest) return null
    const {
      componentSwapData,
      componentWrapData,
      indexToken,
      indexTokenAmount,
      inputOutputToken,
      inputOutputTokenAmount,
      isMinting,
    } = request
    const contract = getFlashMintWrappedContract(this.provider)
    let tx: PopulatedTransaction | null = null
    if (isMinting) {
      tx = await contract.populateTransaction.issueExactSetFromERC20(
        indexToken,
        inputOutputToken,
        indexTokenAmount,
        inputOutputTokenAmount, // _maxAmountInputToken
        componentSwapData,
        componentWrapData
      )
    } else {
      tx = await contract.populateTransaction.redeemExactSetForERC20(
        indexToken,
        inputOutputToken,
        indexTokenAmount,
        inputOutputTokenAmount, // _minOutputReceive
        componentSwapData,
        componentWrapData
      )
    }
    return tx
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
    if (componentSwapData.length !== componentWrapData.length) return false
    return true
  }
}
