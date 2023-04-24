import { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { getFlashMintLeveragedContractForToken } from '../../utils/contracts'
import { Exchange, SwapData } from '../../utils/swapData'
import { TransactionBuilder } from './interface'
import { isEmptyString, isInvalidAmount } from './utils'

export interface FlashMintLeveragedBuildRequest {
  isMinting: boolean
  indexToken: string
  indexTokenSymbol: string
  inputOutputToken: string
  inputOutputTokenSymbol: string
  indexTokenAmount: BigNumber
  inputOutputTokenAmount: BigNumber
  swapDataDebtCollateral: SwapData
  swapDataPaymentToken: SwapData
}

export class LeveragedTransactionBuilder
  implements
    TransactionBuilder<FlashMintLeveragedBuildRequest, TransactionRequest>
{
  constructor(private readonly provider: JsonRpcProvider) {}

  async build(
    request: FlashMintLeveragedBuildRequest
  ): Promise<TransactionRequest | null> {
    const isValidRequest = this.isValidRequest(request)
    if (!isValidRequest) return null
    const {
      indexToken,
      indexTokenSymbol,
      indexTokenAmount,
      inputOutputToken,
      inputOutputTokenSymbol,
      inputOutputTokenAmount,
      isMinting,
      swapDataDebtCollateral,
      swapDataPaymentToken,
    } = request
    const network = await this.provider.getNetwork()
    const chainId = network.chainId
    const inputOutputTokenIsEth = inputOutputTokenSymbol === 'ETH'
    const contract = getFlashMintLeveragedContractForToken(
      indexTokenSymbol,
      this.provider,
      chainId
    )
    if (isMinting) {
      if (inputOutputTokenIsEth) {
        return await contract.populateTransaction.issueExactSetFromETH(
          indexToken,
          indexTokenAmount,
          swapDataDebtCollateral,
          swapDataPaymentToken,
          { value: inputOutputTokenAmount }
        )
      } else {
        return await contract.populateTransaction.issueExactSetFromERC20(
          indexToken,
          indexTokenAmount,
          inputOutputToken,
          inputOutputTokenAmount, // _maxAmountInputToken
          swapDataDebtCollateral,
          swapDataPaymentToken
        )
      }
    } else {
      if (inputOutputTokenIsEth) {
        return await contract.populateTransaction.redeemExactSetForETH(
          indexToken,
          indexTokenAmount,
          inputOutputTokenAmount, // _minAmountOutputToken
          swapDataDebtCollateral,
          swapDataPaymentToken
        )
      } else {
        return await contract.populateTransaction.redeemExactSetForERC20(
          indexToken,
          indexTokenAmount,
          inputOutputToken,
          inputOutputTokenAmount, // _minAmountOutputToken
          swapDataDebtCollateral,
          swapDataPaymentToken
        )
      }
    }
  }

  private isValidSwapData(swapData: SwapData): boolean {
    if (
      swapData.exchange === Exchange.UniV3 &&
      swapData.fees.length !== swapData.path.length - 1
    )
      return false
    if (swapData.path.length === 0) return false
    if (swapData.pool.length !== 42) return false
    return true
  }

  private isValidRequest(request: FlashMintLeveragedBuildRequest): boolean {
    const {
      indexToken,
      indexTokenAmount,
      inputOutputToken,
      inputOutputTokenAmount,
      swapDataDebtCollateral,
      swapDataPaymentToken,
    } = request
    if (isEmptyString(indexToken)) return false
    if (isEmptyString(inputOutputToken)) return false
    if (isInvalidAmount(indexTokenAmount)) return false
    if (isInvalidAmount(inputOutputTokenAmount)) return false
    if (!this.isValidSwapData(swapDataDebtCollateral)) return false
    if (!this.isValidSwapData(swapDataPaymentToken)) return false
    return true
  }
}
