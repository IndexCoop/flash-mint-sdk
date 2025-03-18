import { Contracts } from 'constants/contracts'
import { getFlashMintContract } from 'utils'
import { FlashMintAbis } from 'utils/abis'
import { getRpcProvider } from 'utils/rpc-provider'
import { isEmptyString, isInvalidAmount, isValidSwapDataV2 } from './utils'

import type { TransactionRequest } from '@ethersproject/abstract-provider'
import type { SwapDataV2 } from 'utils'
import type { BuildRequest, TransactionBuilder } from './interface'

export interface FlashMintLeveragedZeroExBuilderBuildRequest
  extends BuildRequest {
  chainId: number
  swapDataDebtCollateral: SwapDataV2
  swapDataInputOutputToken: SwapDataV2
  isAave: boolean
}

export class LeveragedZeroExBuilder
  implements
    TransactionBuilder<
      FlashMintLeveragedZeroExBuilderBuildRequest,
      TransactionRequest
    >
{
  constructor(private readonly rpcUrl: string) {}

  async build(
    request: FlashMintLeveragedZeroExBuilderBuildRequest,
  ): Promise<TransactionRequest | null> {
    const isValidRequest = this.isValidRequest(request)
    if (!isValidRequest) return null
    const provider = getRpcProvider(this.rpcUrl)
    const {
      chainId,
      isMinting,
      inputToken,
      inputTokenAmount,
      inputTokenSymbol,
      outputToken,
      outputTokenAmount,
      outputTokenSymbol,
      swapDataDebtCollateral,
      swapDataInputOutputToken,
      isAave,
    } = request
    const contractAddress = Contracts[chainId].FlashMintLeveragedZeroEx
    const abi = FlashMintAbis[contractAddress]
    const contract = getFlashMintContract(contractAddress, provider)
    console.log(contractAddress)
    console.log(isMinting, inputTokenSymbol === 'ETH')
    if (isMinting) {
      if (inputTokenSymbol === 'ETH') {
        console.log(
          outputToken,
          outputTokenAmount.toString(),
          swapDataDebtCollateral,
          swapDataInputOutputToken,
        )
        console.log(inputTokenAmount.toString())
        return await contract.populateTransaction.issueExactSetFromETH(
          outputToken,
          outputTokenAmount,
          swapDataDebtCollateral,
          swapDataInputOutputToken,
          isAave,
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
          isAave,
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
          isAave,
        )
      } else {
        return await contract.populateTransaction.redeemExactSetForERC20(
          inputToken,
          inputTokenAmount,
          outputToken,
          outputTokenAmount, // _minAmountOutputToken
          swapDataDebtCollateral,
          swapDataInputOutputToken,
          isAave,
        )
      }
    }
  }

  private isValidRequest(
    request: FlashMintLeveragedZeroExBuilderBuildRequest,
  ): boolean {
    if (isEmptyString(request.inputToken)) return false
    if (isEmptyString(request.inputTokenSymbol)) return false
    if (isEmptyString(request.outputToken)) return false
    if (isEmptyString(request.outputTokenSymbol)) return false
    if (isInvalidAmount(request.inputTokenAmount)) return false
    if (isInvalidAmount(request.outputTokenAmount)) return false
    if (!isValidSwapDataV2(request.swapDataDebtCollateral)) return false
    if (!isValidSwapDataV2(request.swapDataInputOutputToken)) return false
    return true
  }
}
