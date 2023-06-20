import { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { PopulatedTransaction } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'

import {
  ComponentSwapData,
  erc4626SwapData,
} from '../../utils/componentSwapData'
import {
  getFlashMint4626Contract,
  getFlashMintWrappedContract,
} from '../../utils/contracts'
import { ComponentWrapData } from '../../utils/wrapData'
import { TransactionBuilder } from './interface'
import { isEmptyString, isInvalidAmount } from './utils'

export interface FlashMintWrappedBuildRequest {
  isMinting: boolean
  indexToken: string
  inputOutputToken: string
  inputOutputTokenSymbol: string
  indexTokenAmount: BigNumber
  inputOutputTokenAmount: BigNumber
  componentSwapData: ComponentSwapData[]
  componentWrapData: ComponentWrapData[]
}

export interface FlashMintERC4626BuildRequest {
  isMinting: boolean
  indexToken: string
  inputOutputToken: string
  inputOutputTokenSymbol: string
  indexTokenAmount: BigNumber
  inputOutputTokenAmount: BigNumber
  componentSwapData: erc4626SwapData[]
}

export class WrappedTransactionBuilder
  implements
    TransactionBuilder<FlashMintWrappedBuildRequest, TransactionRequest>
{
  constructor(private readonly provider: JsonRpcProvider) {}

  async build(
    request: FlashMintWrappedBuildRequest
  ): Promise<TransactionRequest | null> {
    const isValidRequest = this.isValidRequest(request)
    if (!isValidRequest) return null
    const {
      componentSwapData,
      componentWrapData,
      indexToken,
      indexTokenAmount,
      inputOutputToken,
      inputOutputTokenSymbol,
      inputOutputTokenAmount,
      isMinting,
    } = request
    const inputOutputTokenIsEth = inputOutputTokenSymbol === 'ETH'
    const contract = getFlashMintWrappedContract(this.provider)
    let tx: PopulatedTransaction | null = null
    if (isMinting) {
      if (inputOutputTokenIsEth) {
        tx = await contract.populateTransaction.issueExactSetFromETH(
          indexToken,
          indexTokenAmount,
          componentSwapData,
          componentWrapData,
          { value: inputOutputTokenAmount }
        )
      } else {
        tx = await contract.populateTransaction.issueExactSetFromERC20(
          indexToken,
          inputOutputToken,
          indexTokenAmount,
          inputOutputTokenAmount, // _maxAmountInputToken
          componentSwapData,
          componentWrapData
        )
      }
    } else {
      if (inputOutputTokenIsEth) {
        tx = await contract.populateTransaction.redeemExactSetForETH(
          indexToken,
          indexTokenAmount,
          inputOutputTokenAmount, // _minOutputReceive
          componentSwapData,
          componentWrapData
        )
      } else {
        tx = await contract.populateTransaction.redeemExactSetForERC20(
          indexToken,
          inputOutputToken,
          indexTokenAmount,
          inputOutputTokenAmount, // _minOutputReceive
          componentSwapData,
          componentWrapData
        )
      }
    }
    return tx
  }

  private isValidRequest(request: FlashMintWrappedBuildRequest): boolean {
    const {
      componentSwapData,
      componentWrapData,
      indexToken,
      indexTokenAmount,
      inputOutputToken,
      inputOutputTokenAmount,
    } = request
    if (isEmptyString(indexToken)) return false
    if (isEmptyString(inputOutputToken)) return false
    if (isInvalidAmount(indexTokenAmount)) return false
    if (isInvalidAmount(inputOutputTokenAmount)) return false
    if (componentSwapData.length === 0) return false
    if (componentWrapData.length === 0) return false
    if (componentSwapData.length !== componentWrapData.length) return false
    return true
  }
}

export class ERC4626TransactionBuilder
  implements
    TransactionBuilder<FlashMintERC4626BuildRequest, TransactionRequest>
{
  constructor(private readonly provider: JsonRpcProvider) {}

  async build(
    request: FlashMintERC4626BuildRequest
  ): Promise<TransactionRequest | null> {
    const isValidRequest = this.isValidRequest(request)
    if (!isValidRequest) return null
    const {
      componentSwapData,
      indexToken,
      indexTokenAmount,
      inputOutputToken,
      inputOutputTokenSymbol,
      inputOutputTokenAmount,
      isMinting,
    } = request
    const inputOutputTokenIsEth = inputOutputTokenSymbol === 'ETH'
    const contract = getFlashMint4626Contract(this.provider)
    let tx: PopulatedTransaction | null = null
    if (isMinting) {
      if (inputOutputTokenIsEth) {
        tx = await contract.populateTransaction.issueExactSetFromETH(
          indexToken,
          indexTokenAmount,
          componentSwapData,
          { value: inputOutputTokenAmount }
        )
      } else {
        tx = await contract.populateTransaction.issueExactSetFromERC20(
          indexToken,
          inputOutputToken,
          indexTokenAmount,
          inputOutputTokenAmount, // _maxAmountInputToken
          componentSwapData
        )
      }
    } else {
      if (inputOutputTokenIsEth) {
        tx = await contract.populateTransaction.redeemExactSetForETH(
          indexToken,
          indexTokenAmount,
          inputOutputTokenAmount, // _minOutputReceive
          componentSwapData
        )
      } else {
        tx = await contract.populateTransaction.redeemExactSetForERC20(
          indexToken,
          inputOutputToken,
          indexTokenAmount,
          inputOutputTokenAmount, // _minOutputReceive
          componentSwapData
        )
      }
    }
    return tx
  }
  private isValidRequest(request: FlashMintERC4626BuildRequest): boolean {
    const {
      componentSwapData,
      indexToken,
      indexTokenAmount,
      inputOutputToken,
      inputOutputTokenAmount,
    } = request
    if (isEmptyString(indexToken)) return false
    if (isEmptyString(inputOutputToken)) return false
    if (isInvalidAmount(indexTokenAmount)) return false
    if (isInvalidAmount(inputOutputTokenAmount)) return false
    if (componentSwapData.length === 0) return false
    return true
  }
}
