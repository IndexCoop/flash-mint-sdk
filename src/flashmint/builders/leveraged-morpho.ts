import { getIndexFlashMintLeveragedMorphoContract } from 'utils/contracts'
import { getRpcProvider } from 'utils/rpc-provider'
import { isEmptyString, isInvalidAmount, isValidSwapData } from './utils'

import type { TransactionRequest } from '@ethersproject/abstract-provider'
import type { SwapDataV5 } from 'utils'
import type { BuildRequest, TransactionBuilder } from './interface'

export interface FlashMintLeveragedMorphoBuildRequest extends BuildRequest {
  chainId: number
  swapDataDebtCollateral: SwapDataV5
  swapDataInputOutputToken: SwapDataV5
}

export class LeveragedMorphoBuilder
  implements
    TransactionBuilder<FlashMintLeveragedMorphoBuildRequest, TransactionRequest>
{
  constructor(private readonly rpcUrl: string) {}

  async build(
    request: FlashMintLeveragedMorphoBuildRequest,
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
    const contract = getIndexFlashMintLeveragedMorphoContract(provider)
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
    request: FlashMintLeveragedMorphoBuildRequest,
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
