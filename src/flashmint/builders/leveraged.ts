import { getFlashMintLeveragedContractForToken } from 'utils/contracts'
import { getRpcProvider } from 'utils/rpc-provider'
import { isEmptyString, isInvalidAmount, isValidSwapData } from './utils'

import type { TransactionRequest } from '@ethersproject/abstract-provider'
import type { BigNumber } from '@ethersproject/bignumber'
import type { SwapData } from 'utils'
import type { TransactionBuilder } from './interface'

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
  constructor(private readonly rpcUrl: string) {}

  async build(
    request: FlashMintLeveragedBuildRequest,
  ): Promise<TransactionRequest | null> {
    const isValidRequest = this.isValidRequest(request)
    if (!isValidRequest) return null
    const provider = getRpcProvider(this.rpcUrl)
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
    const network = await provider.getNetwork()
    const chainId = network.chainId
    const inputOutputTokenIsEth = inputOutputTokenSymbol === 'ETH'
    const contract = getFlashMintLeveragedContractForToken(
      indexTokenSymbol,
      provider,
      chainId,
    )
    if (isMinting) {
      if (inputOutputTokenIsEth) {
        return await contract.populateTransaction.issueExactSetFromETH(
          indexToken,
          indexTokenAmount,
          swapDataDebtCollateral,
          swapDataPaymentToken,
          { value: inputOutputTokenAmount },
        )
      } else {
        return await contract.populateTransaction.issueExactSetFromERC20(
          indexToken,
          indexTokenAmount,
          inputOutputToken,
          inputOutputTokenAmount, // _maxAmountInputToken
          swapDataDebtCollateral,
          swapDataPaymentToken,
        )
      }
    } else {
      if (inputOutputTokenIsEth) {
        return await contract.populateTransaction.redeemExactSetForETH(
          indexToken,
          indexTokenAmount,
          inputOutputTokenAmount, // _minAmountOutputToken
          swapDataDebtCollateral,
          swapDataPaymentToken,
        )
      } else {
        return await contract.populateTransaction.redeemExactSetForERC20(
          indexToken,
          indexTokenAmount,
          inputOutputToken,
          inputOutputTokenAmount, // _minAmountOutputToken
          swapDataDebtCollateral,
          swapDataPaymentToken,
        )
      }
    }
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
    if (!isValidSwapData(swapDataDebtCollateral)) return false
    if (!isValidSwapData(swapDataPaymentToken)) return false
    return true
  }
}
