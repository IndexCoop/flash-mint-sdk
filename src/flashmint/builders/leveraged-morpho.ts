import { getIndexFlashMintLeveragedMorphoAaveLMContract } from 'utils/contracts'
import { getRpcProvider } from 'utils/rpc-provider'
import { isEmptyString, isInvalidAmount, isValidSwapData } from './utils'

import type { TransactionRequest } from '@ethersproject/abstract-provider'
import type { SwapDataV4 } from 'utils'
import type { BuildRequest, TransactionBuilder } from './interface'

export interface FlashMintLeveragedMorphoAaveLmBuildRequest
  extends BuildRequest {
  chainId: number
  swapDataDebtCollateral: SwapDataV4
  swapDataInputOutputToken: SwapDataV4
}

export class LeveragedMorphoAaveLmBuilder
  implements
    TransactionBuilder<
      FlashMintLeveragedMorphoAaveLmBuildRequest,
      TransactionRequest
    >
{
  constructor(private readonly rpcUrl: string) {}

  async build(
    request: FlashMintLeveragedMorphoAaveLmBuildRequest,
  ): Promise<TransactionRequest | null> {
    const isValidRequest = this.isValidRequest(request)
    if (!isValidRequest) return null
    const provider = getRpcProvider(this.rpcUrl)
    const {
      isMinting,
      inputToken,
      inputTokenAmount,
      inputTokenSymbol,
      outputToken,
      outputTokenAmount,
      outputTokenSymbol,
      swapDataDebtCollateral,
      swapDataInputOutputToken,
    } = request
    const contract = getIndexFlashMintLeveragedMorphoAaveLMContract(provider)
    if (isMinting) {
      if (inputTokenSymbol === 'ETH') {
        return await contract.populateTransaction.issueExactSetFromETH(
          outputToken,
          outputTokenAmount,
          swapDataDebtCollateral,
          swapDataInputOutputToken,
          { value: inputTokenAmount },
        )
      } else {
        return await contract.populateTransaction.issueExactSetFromERC20(
          outputToken,
          outputTokenAmount,
          inputToken,
          inputTokenAmount, // _maxAmountInputToken
          swapDataDebtCollateral,
          swapDataInputOutputToken,
        )
      }
    } else {
      if (outputTokenSymbol === 'ETH') {
        return await contract.populateTransaction.redeemExactSetForETH(
          inputToken,
          inputTokenAmount,
          outputTokenAmount, // _minAmountOutputToken
          swapDataDebtCollateral,
          swapDataInputOutputToken,
        )
      } else {
        return await contract.populateTransaction.redeemExactSetForERC20(
          inputToken,
          inputTokenAmount,
          outputToken,
          outputTokenAmount, // _minAmountOutputToken
          swapDataDebtCollateral,
          swapDataInputOutputToken,
        )
      }
    }
  }

  private isValidRequest(
    request: FlashMintLeveragedMorphoAaveLmBuildRequest,
  ): boolean {
    if (isEmptyString(request.inputToken)) return false
    if (isEmptyString(request.inputTokenSymbol)) return false
    if (isEmptyString(request.outputToken)) return false
    if (isEmptyString(request.outputTokenSymbol)) return false
    if (isInvalidAmount(request.inputTokenAmount)) return false
    if (isInvalidAmount(request.outputTokenAmount)) return false
    if (!isValidSwapData(request.swapDataDebtCollateral)) return false
    if (!isValidSwapData(request.swapDataInputOutputToken)) return false
    return true
  }
}
