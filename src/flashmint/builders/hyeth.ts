import type { TransactionRequest } from '@ethersproject/abstract-provider'

import { getFlashMintHyEthContract } from 'utils/contracts'
import { getRpcProvider } from 'utils/rpc-provider'
import { isEmptyString, isInvalidAmount, isValidSwapData } from './utils'

import type { SwapData } from 'utils/swap-data'
import type { BuildRequest, TransactionBuilder } from './interface'

export interface FlashMintHyEthBuildRequest extends BuildRequest {
  componentsSwapData: SwapData[]
  swapDataInputTokenToEth: SwapData | null
  swapDataEthToInputOutputToken: SwapData | null
}

export class FlashMintHyEthTransactionBuilder
  implements TransactionBuilder<FlashMintHyEthBuildRequest, TransactionRequest>
{
  constructor(private readonly rpcUrl: string) {}

  async build(
    request: FlashMintHyEthBuildRequest,
  ): Promise<TransactionRequest | null> {
    if (!this.isValidRequest(request)) return null
    const provider = getRpcProvider(this.rpcUrl)
    const {
      componentsSwapData: componentSwapDataRequest,
      inputToken,
      inputTokenSymbol,
      inputTokenAmount,
      outputToken,
      outputTokenSymbol,
      outputTokenAmount,
      isMinting,
      swapDataInputTokenToEth: swapDataInputTokenToEthRequest,
      swapDataEthToInputOutputToken: swapDataEthToInputOutputTokenRequest,
    } = request
    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenAmount = isMinting ? outputTokenAmount : inputTokenAmount
    const contract = getFlashMintHyEthContract(provider)
    const componentsSwapData = componentSwapDataRequest.map(
      (componentSwapData) => {
        return {
          ...componentSwapData,
          poolIds: [],
        }
      },
    )
    if (isMinting) {
      if (inputTokenSymbol === 'ETH') {
        return await contract.populateTransaction.issueExactSetFromETH(
          indexToken,
          indexTokenAmount,
          componentsSwapData,
          { value: inputTokenAmount },
        )
      } else {
        const swapDataInputTokenToEth = {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ...swapDataInputTokenToEthRequest!,
          poolIds: [],
        }
        const swapDataEthToInputOutputToken = {
          ...swapDataEthToInputOutputTokenRequest,
          poolIds: [],
        }
        return await contract.populateTransaction.issueExactSetFromERC20(
          indexToken,
          indexTokenAmount,
          inputToken,
          inputTokenAmount, // _maxInputTokenAmount
          swapDataInputTokenToEth,
          swapDataEthToInputOutputToken,
          componentsSwapData,
        )
      }
    } else {
      if (outputTokenSymbol === 'ETH') {
        return await contract.populateTransaction.redeemExactSetForETH(
          indexToken,
          indexTokenAmount,
          outputTokenAmount, // _minETHOut
          componentsSwapData,
        )
      } else {
        const swapDataEthToInputOutputToken = {
          ...swapDataEthToInputOutputTokenRequest,
          poolIds: [],
        }
        return await contract.populateTransaction.redeemExactSetForERC20(
          indexToken,
          indexTokenAmount,
          outputToken,
          outputTokenAmount, // _minOutputTokenAmount
          swapDataEthToInputOutputToken,
          componentsSwapData,
        )
      }
    }
  }

  private isValidRequest(request: FlashMintHyEthBuildRequest): boolean {
    const {
      inputTokenSymbol,
      isMinting,
      outputTokenSymbol,
      swapDataEthToInputOutputToken,
      swapDataInputTokenToEth,
    } = request
    if (isEmptyString(request.inputToken)) return false
    if (isEmptyString(request.inputTokenSymbol)) return false
    if (isEmptyString(request.outputToken)) return false
    if (isEmptyString(outputTokenSymbol)) return false
    if (isInvalidAmount(request.inputTokenAmount)) return false
    if (isInvalidAmount(request.outputTokenAmount)) return false
    if (request.componentsSwapData.length === 0) return false
    if (
      isMinting &&
      inputTokenSymbol !== 'ETH' &&
      !isValidSwapData(swapDataInputTokenToEth)
    )
      return false
    if (
      ((isMinting && inputTokenSymbol !== 'ETH') ||
        (!isMinting && outputTokenSymbol !== 'ETH')) &&
      !isValidSwapData(swapDataEthToInputOutputToken)
    )
      return false
    return true
  }
}
