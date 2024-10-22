import { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'

import { getRpcProvider } from 'utils/rpc-provider'
import { Exchange, SwapDataV3 } from 'utils/swap-data'

import { getFlashMintNavContract } from '../../utils/contracts'
import { TransactionBuilder } from './interface'
import { isEmptyString, isInvalidAmount } from './utils'

export interface FlashMintNavBuildRequest {
  isMinting: boolean
  inputToken: string
  inputTokenSymbol: string
  outputToken: string
  outputTokenSymbol: string
  indexTokenAmount: BigNumber
  inputOutputTokenAmount: BigNumber
  reserveAssetSwapData: SwapDataV3
}

export class FlashMintNavTransactionBuilder
  implements TransactionBuilder<FlashMintNavBuildRequest, TransactionRequest>
{
  constructor(private readonly rpcUrl: string) {}

  async build(
    request: FlashMintNavBuildRequest
  ): Promise<TransactionRequest | null> {
    if (!this.isValidRequest(request)) return null
    const provider = getRpcProvider(this.rpcUrl)
    const {
      inputToken,
      inputTokenSymbol,
      indexTokenAmount,
      inputOutputTokenAmount,
      outputToken,
      outputTokenSymbol,
      isMinting,
      reserveAssetSwapData,
    } = request
    const contract = getFlashMintNavContract(provider)
    if (isMinting) {
      const inputTokenIsEth = inputTokenSymbol === 'ETH'
      if (inputTokenIsEth) {
        return await contract.populateTransaction.issueSetFromExactETH(
          outputToken,
          indexTokenAmount, // _minSetTokenAmount
          reserveAssetSwapData,
          { value: inputOutputTokenAmount }
        )
      } else {
        return await contract.populateTransaction.issueSetFromExactERC20(
          outputToken,
          indexTokenAmount, // _minSetTokenAmount
          inputToken,
          inputOutputTokenAmount, // _maxAmountInputToken
          reserveAssetSwapData
        )
      }
    } else {
      const outputTokenIsEth = outputTokenSymbol === 'ETH'
      if (outputTokenIsEth) {
        return await contract.populateTransaction.redeemExactSetForETH(
          inputToken,
          indexTokenAmount,
          inputOutputTokenAmount, // _minEthAmount
          reserveAssetSwapData
        )
      } else {
        return await contract.populateTransaction.redeemExactSetForERC20(
          inputToken,
          indexTokenAmount,
          outputToken,
          inputOutputTokenAmount, // _minOutputTokenAmount
          reserveAssetSwapData
        )
      }
    }
  }

  private isValidSwapData(swapData: SwapDataV3): boolean {
    if (swapData.exchange === Exchange.None) {
      if (swapData.pool.length !== 42) return false
      return true
    }
    if (
      swapData.exchange === Exchange.UniV3 &&
      swapData.fees.length !== swapData.path.length - 1
    )
      return false
    if (swapData.path.length === 0) return false
    if (swapData.pool.length !== 42) return false
    return true
  }

  private isValidRequest(request: FlashMintNavBuildRequest): boolean {
    const {
      inputToken,
      inputTokenSymbol,
      outputToken,
      outputTokenSymbol,
      indexTokenAmount,
      inputOutputTokenAmount,
      reserveAssetSwapData,
    } = request
    if (isEmptyString(inputToken)) return false
    if (isEmptyString(outputToken)) return false
    if (isEmptyString(inputTokenSymbol)) return false
    if (isEmptyString(outputTokenSymbol)) return false
    if (isInvalidAmount(indexTokenAmount)) return false
    if (isInvalidAmount(inputOutputTokenAmount)) return false
    if (!this.isValidSwapData(reserveAssetSwapData)) return false
    return true
  }
}
