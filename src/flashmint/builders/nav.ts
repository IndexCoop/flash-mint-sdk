import { getRpcProvider } from 'utils/rpc-provider'
import { getFlashMintNavContract } from '../../utils/contracts'
import { isEmptyString, isInvalidAmount, isValidSwapData } from './utils'

import type { TransactionRequest } from '@ethersproject/abstract-provider'
import type { SwapDataV3 } from 'utils/swap-data'
import type { BuildRequest, TransactionBuilder } from './interface'

export interface FlashMintNavBuildRequest extends BuildRequest {
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
    if (isEmptyString(request.inputToken)) return false
    if (isEmptyString(request.outputToken)) return false
    if (isEmptyString(request.inputTokenSymbol)) return false
    if (isEmptyString(request.outputTokenSymbol)) return false
    if (isInvalidAmount(request.inputTokenAmount)) return false
    if (isInvalidAmount(request.outputTokenAmount)) return false
    if (!isValidSwapData(request.reserveAssetSwapData)) return false
    return true
  }
}
