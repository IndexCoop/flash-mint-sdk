import { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { getFlashMintLeveragedContractForToken } from '../../utils/contracts'
import { Exchange, SwapData } from '../../utils/swapData'

import { TransactionBuilder } from './interface'
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
}

export class LeveragedExtendedTransactionBuilder
  implements
    TransactionBuilder<
      FlashMintLeveragedExtendedBuildRequest,
      TransactionRequest
    >
{
  constructor(private readonly provider: JsonRpcProvider) {}

  async build(
    request: FlashMintLeveragedExtendedBuildRequest
  ): Promise<TransactionRequest | null> {
    const isValidRequest = this.isValidRequest(request)
    if (!isValidRequest) return null
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
    } = request
    const network = await this.provider.getNetwork()
    const chainId = network.chainId
    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenSymbol = isMinting ? outputTokenSymbol : inputTokenSymbol
    const contract = getFlashMintLeveragedContractForToken(
      indexTokenSymbol,
      this.provider,
      chainId
    )
    if (isMinting) {
      const isInputTokenEth = inputTokenSymbol === 'ETH'
      // TODO:
      const minIndexTokenAmount = outputTokenAmount
      const priceEstimateInflator = BigNumber.from(0)
      const maxDust = BigNumber.from(0)
      if (isInputTokenEth) {
        return await contract.populateTransaction.issueSetFromExactETH(
          indexToken,
          minIndexTokenAmount,
          swapDataDebtCollateral,
          swapDataInputOutputToken,
          priceEstimateInflator,
          maxDust,
          { value: inputTokenAmount }
        )
      } else {
        // TODO:
        const minIndexTokenAmount = outputTokenAmount
        const swapDataInputTokenForETH = {}
        const priceEstimateInflator = BigNumber.from(0)
        const maxDust = BigNumber.from(0)
        return await contract.populateTransaction.issueSetFromExactERC20(
          indexToken,
          minIndexTokenAmount,
          inputToken,
          inputTokenAmount,
          swapDataDebtCollateral,
          swapDataInputOutputToken,
          swapDataInputTokenForETH,
          priceEstimateInflator,
          maxDust
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
          swapDataInputOutputToken
        )
      } else {
        return await contract.populateTransaction.redeemExactSetForERC20(
          indexToken,
          inputTokenAmount,
          outputToken,
          outputTokenAmount, // _minAmountOutputToken
          swapDataDebtCollateral,
          swapDataInputOutputToken
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
    request: FlashMintLeveragedExtendedBuildRequest
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
