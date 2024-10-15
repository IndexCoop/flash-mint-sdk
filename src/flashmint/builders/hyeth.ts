import { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'

import { getFlashMintHyEthContract } from 'utils/contracts'
import { getRpcProvider } from 'utils/rpc-provider'
import { Exchange, SwapData } from 'utils/swap-data'

import { TransactionBuilder } from './interface'
import { isEmptyString, isInvalidAmount } from './utils'

export interface FlashMintHyEthBuildRequest {
  isMinting: boolean
  inputToken: string
  inputTokenSymbol: string
  outputToken: string
  outputTokenSymbol: string
  inputTokenAmount: BigNumber
  outputTokenAmount: BigNumber
  componentsSwapData: SwapData[]
  swapDataInputTokenToEth: SwapData | null
  swapDataEthToInputOutputToken: SwapData | null
}

export class FlashMintHyEthTransactionBuilder
  implements TransactionBuilder<FlashMintHyEthBuildRequest, TransactionRequest>
{
  constructor(private readonly rpcUrl: string) {}

  async build(
    request: FlashMintHyEthBuildRequest
  ): Promise<TransactionRequest | null> {
    if (!this.isValidRequest(request)) return null
    const provider = getRpcProvider(this.rpcUrl)
    const {
      componentsSwapData: swapData,
      inputToken,
      inputTokenSymbol,
      inputTokenAmount,
      outputToken,
      outputTokenSymbol,
      outputTokenAmount,
      isMinting,
      swapDataInputTokenToEth,
      swapDataEthToInputOutputToken,
    } = request
    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenAmount = isMinting ? outputTokenAmount : inputTokenAmount
    const contract = getFlashMintHyEthContract(provider)
    let componentsSwapData = swapData.map((componentSwapData) => {
      return {
        ...componentSwapData,
        poolIds: [],
      }
    })
    if (isMinting) {
      if (inputTokenSymbol === 'ETH') {
        return await contract.populateTransaction.issueExactSetFromETH(
          indexToken,
          indexTokenAmount,
          componentsSwapData,
          { value: inputTokenAmount }
        )
      } else {
        return await contract.populateTransaction.issueExactSetFromERC20(
          indexToken,
          indexTokenAmount,
          inputToken,
          inputTokenAmount, // _maxInputTokenAmount
          swapDataInputTokenToEth,
          swapDataEthToInputOutputToken,
          componentsSwapData
        )
      }
    } else {
      if (outputTokenSymbol === 'ETH') {
        return await contract.populateTransaction.redeemExactSetForETH(
          indexToken,
          indexTokenAmount,
          outputTokenAmount, // _minETHOut
          componentsSwapData
        )
      } else {
        return await contract.populateTransaction.redeemExactSetForERC20(
          indexToken,
          indexTokenAmount,
          outputToken,
          outputTokenAmount, // _minOutputTokenAmount
          swapDataEthToInputOutputToken,
          componentsSwapData
        )
      }
    }
  }

  private isValidSwapData(swapData: SwapData | null): boolean {
    if (!swapData) return false
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

  private isValidRequest(request: FlashMintHyEthBuildRequest): boolean {
    const {
      componentsSwapData,
      inputToken,
      inputTokenAmount,
      inputTokenSymbol,
      isMinting,
      outputToken,
      outputTokenAmount,
      outputTokenSymbol,
      swapDataEthToInputOutputToken,
      swapDataInputTokenToEth,
    } = request
    if (isEmptyString(inputToken)) return false
    if (isEmptyString(inputTokenSymbol)) return false
    if (isEmptyString(outputToken)) return false
    if (isEmptyString(outputTokenSymbol)) return false
    if (isInvalidAmount(inputTokenAmount)) return false
    if (isInvalidAmount(outputTokenAmount)) return false
    if (componentsSwapData.length === 0) return false
    if (
      isMinting &&
      inputTokenSymbol !== 'ETH' &&
      !this.isValidSwapData(swapDataInputTokenToEth)
    )
      return false
    if (
      ((isMinting && inputTokenSymbol !== 'ETH') ||
        (!isMinting && outputTokenSymbol !== 'ETH')) &&
      !this.isValidSwapData(swapDataEthToInputOutputToken)
    )
      return false
    return true
  }
}
