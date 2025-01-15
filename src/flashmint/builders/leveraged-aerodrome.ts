import { Exchange } from 'utils'
import { getIndexFlashMintLeveragedAerodromeContract } from 'utils/contracts'
import { getRpcProvider } from 'utils/rpc-provider'
import { isEmptyString, isInvalidAmount } from './utils'

import type { TransactionRequest } from '@ethersproject/abstract-provider'
import type { BigNumber } from '@ethersproject/bignumber'
import type { SwapDataV3 } from 'utils'
import type { TransactionBuilder } from './interface'

export interface FlashMintLeveragedAerodromBuildRequest {
  chainId: number
  isMinting: boolean
  inputToken: string
  outputToken: string
  inputTokenSymbol: string
  outputTokenSymbol: string
  inputTokenAmount: BigNumber
  outputTokenAmount: BigNumber
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

  private isValidRequest(
    request: FlashMintLeveragedAerodromBuildRequest,
  ): boolean {
    const {
      inputToken,
      inputTokenAmount,
      inputTokenSymbol,
      outputToken,
      outputTokenAmount,
      outputTokenSymbol,
      swapDataDebtCollateral,
      swapDataInputOutputToken,
    } = request
    if (isEmptyString(inputToken)) return false
    if (isEmptyString(inputTokenSymbol)) return false
    if (isEmptyString(outputToken)) return false
    if (isEmptyString(outputTokenSymbol)) return false
    if (isInvalidAmount(inputTokenAmount)) return false
    if (isInvalidAmount(outputTokenAmount)) return false
    if (!this.isValidSwapData(swapDataDebtCollateral)) return false
    if (!this.isValidSwapData(swapDataInputOutputToken)) return false
    return true
  }
}
