import type { TransactionRequest } from '@ethersproject/abstract-provider'
import type { BigNumber } from '@ethersproject/bignumber'

import { Exchange, type SwapData } from 'utils'
import { getFlashMintLeveragedContractForToken } from 'utils/contracts'
import { getRpcProvider } from 'utils/rpc-provider'

import type { TransactionBuilder } from './interface'
import { isEmptyString, isInvalidAmount } from './utils'

export interface FlashMintLeveragedExtendedBuildRequest {
  isMinting: boolean
  inputToken: string
  inputTokenSymbol: string
  outputToken: string
  outputTokenSymbol: string
  inputTokenAmount: BigNumber
  outputTokenAmount: BigNumber
  swapDataDebtCollateral: SwapData
  swapDataInputOutputToken: SwapData
  swapDataInputTokenForETH: SwapData
  priceEstimateInflator: BigNumber
  maxDust: BigNumber
}

export class LeveragedExtendedTransactionBuilder
  implements
    TransactionBuilder<
      FlashMintLeveragedExtendedBuildRequest,
      TransactionRequest
    >
{
  constructor(private readonly rpcUrl: string) {}

  async build(
    request: FlashMintLeveragedExtendedBuildRequest,
  ): Promise<TransactionRequest | null> {
    const isValidRequest = this.isValidRequest(request)
    if (!isValidRequest) return null
    const provider = getRpcProvider(this.rpcUrl)
    const {
      inputToken,
      inputTokenAmount,
      inputTokenSymbol,
      outputToken,
      outputTokenAmount,
      outputTokenSymbol,
      isMinting,
      swapDataDebtCollateral,
      swapDataInputOutputToken,
      // priceEstimateInflator,
      // maxDust,
    } = request
    const network = await provider.getNetwork()
    const chainId = network.chainId
    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenSymbol = isMinting ? outputTokenSymbol : inputTokenSymbol
    const contract = getFlashMintLeveragedContractForToken(
      indexTokenSymbol,
      provider,
      chainId,
    )
    if (isMinting) {
      const isInputTokenEth = inputTokenSymbol === 'ETH'
      if (isInputTokenEth) {
        return await contract.populateTransaction.issueExactSetFromETH(
          indexToken,
          outputTokenAmount,
          swapDataDebtCollateral,
          swapDataInputOutputToken,
          { value: inputTokenAmount },
        )
      } else {
        return await contract.populateTransaction.issueExactSetFromERC20(
          indexToken,
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
          indexToken,
          inputTokenAmount,
          outputTokenAmount, // _minAmountOutputToken
          swapDataDebtCollateral,
          swapDataInputOutputToken, // _swapDataOutputToken
        )
      } else {
        return await contract.populateTransaction.redeemExactSetForERC20(
          indexToken,
          inputTokenAmount,
          outputToken,
          outputTokenAmount, // _minAmountOutputToken
          swapDataDebtCollateral,
          swapDataInputOutputToken, // _swapDataOutputToken
        )
      }
    }
  }

  private isValidSwapData(swapData: SwapData): boolean {
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
    request: FlashMintLeveragedExtendedBuildRequest,
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
