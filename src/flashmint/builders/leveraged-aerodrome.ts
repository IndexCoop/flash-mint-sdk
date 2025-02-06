import type { TransactionRequest } from '@ethersproject/abstract-provider'

import type { SwapDataV3 } from 'utils'
import { getIndexFlashMintLeveragedAerodromeContract } from 'utils/contracts'
import { getRpcProvider } from 'utils/rpc-provider'

import type { BuildRequest, TransactionBuilder } from './interface'
import { isEmptyString, isInvalidAmount, isValidSwapData } from './utils'

export interface FlashMintLeveragedAerodromBuildRequest extends BuildRequest {
  chainId: number
  swapDataDebtCollateral: SwapDataV3
  swapDataInputOutputToken: SwapDataV3
}

export class LeveragedAerodromeBuilder
  implements
    TransactionBuilder<
      FlashMintLeveragedAerodromBuildRequest,
      TransactionRequest
    >
{
  constructor(private readonly rpcUrl: string) {}

  async build(
    request: FlashMintLeveragedAerodromBuildRequest,
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
    const contract = getIndexFlashMintLeveragedAerodromeContract(provider)
    if (isMinting) {
      const isInputTokenEth = inputTokenSymbol === 'ETH'
      if (isInputTokenEth) {
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
      const isOutputTokenEth = outputTokenSymbol === 'ETH'
      if (isOutputTokenEth) {
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
    request: FlashMintLeveragedAerodromBuildRequest,
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
