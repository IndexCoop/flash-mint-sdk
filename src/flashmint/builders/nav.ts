import { getRpcProvider } from 'utils/rpc-provider'
import { getFlashMintNavContract } from '../../utils/contracts'
import { isEmptyString, isInvalidAmount, isValidSwapData } from './utils'

import type { TransactionRequest } from '@ethersproject/abstract-provider'
import type { BigNumber } from '@ethersproject/bignumber'
import type { SwapDataV3 } from 'utils/swap-data'
import type { TransactionBuilder } from './interface'

export interface FlashMintNavBuildRequest {
  isMinting: boolean
  inputToken: string
  inputTokenSymbol: string
  outputToken: string
  outputTokenSymbol: string
  inputTokenAmount: BigNumber
  outputTokenAmount: BigNumber
  reserveAssetSwapData: SwapDataV3
}

export class FlashMintNavTransactionBuilder
  implements TransactionBuilder<FlashMintNavBuildRequest, TransactionRequest>
{
  constructor(private readonly rpcUrl: string) {}

  async build(
    request: FlashMintNavBuildRequest,
  ): Promise<TransactionRequest | null> {
    if (!this.isValidRequest(request)) return null
    const provider = getRpcProvider(this.rpcUrl)
    const {
      inputToken,
      inputTokenAmount,
      inputTokenSymbol,
      outputToken,
      outputTokenAmount,
      outputTokenSymbol,
      isMinting,
      reserveAssetSwapData,
    } = request
    const contract = getFlashMintNavContract(provider)
    const indexTokenAmount = isMinting ? outputTokenAmount : inputTokenAmount
    if (isMinting) {
      const inputTokenIsEth = inputTokenSymbol === 'ETH'
      if (inputTokenIsEth) {
        return await contract.populateTransaction.issueSetFromExactETH(
          outputToken,
          indexTokenAmount, // _minSetTokenAmount
          reserveAssetSwapData,
          { value: inputTokenAmount },
        )
      } else {
        return await contract.populateTransaction.issueSetFromExactERC20(
          outputToken,
          indexTokenAmount, // _minSetTokenAmount
          inputToken,
          inputTokenAmount, // _maxAmountInputToken
          reserveAssetSwapData,
        )
      }
    } else {
      const outputTokenIsEth = outputTokenSymbol === 'ETH'
      if (outputTokenIsEth) {
        return await contract.populateTransaction.redeemExactSetForETH(
          inputToken,
          indexTokenAmount,
          outputTokenAmount, // _minEthAmount
          reserveAssetSwapData,
        )
      } else {
        return await contract.populateTransaction.redeemExactSetForERC20(
          inputToken,
          indexTokenAmount,
          outputToken,
          outputTokenAmount, // _minOutputTokenAmount
          reserveAssetSwapData,
        )
      }
    }
  }

  private isValidRequest(request: FlashMintNavBuildRequest): boolean {
    const {
      inputToken,
      inputTokenSymbol,
      outputToken,
      outputTokenSymbol,
      inputTokenAmount,
      outputTokenAmount,
      reserveAssetSwapData,
    } = request
    if (isEmptyString(inputToken)) return false
    if (isEmptyString(outputToken)) return false
    if (isEmptyString(inputTokenSymbol)) return false
    if (isEmptyString(outputTokenSymbol)) return false
    if (isInvalidAmount(inputTokenAmount)) return false
    if (isInvalidAmount(outputTokenAmount)) return false
    if (!isValidSwapData(reserveAssetSwapData)) return false
    return true
  }
}
