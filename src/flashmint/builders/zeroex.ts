import type { TransactionRequest } from '@ethersproject/abstract-provider'
import type { BigNumber } from '@ethersproject/bignumber'

import { getRpcProvider } from 'utils/rpc-provider'

import { getFlashMintZeroExContractForToken } from '../../utils/contracts'
import { getIssuanceModule } from '../../utils/issuance-modules'
import type { TransactionBuilder } from './interface'
import { isEmptyString, isInvalidAmount } from './utils'

export interface FlashMintZeroExBuildRequest {
  isMinting: boolean
  indexToken: string
  indexTokenSymbol: string
  inputOutputToken: string
  inputOutputTokenSymbol: string
  indexTokenAmount: BigNumber
  inputOutputTokenAmount: BigNumber
  componentQuotes: string[]
}

export class ZeroExTransactionBuilder
  implements TransactionBuilder<FlashMintZeroExBuildRequest, TransactionRequest>
{
  constructor(private readonly rpcUrl: string) {}

  async build(
    request: FlashMintZeroExBuildRequest,
  ): Promise<TransactionRequest | null> {
    const isValidRequest = this.isValidRequest(request)
    if (!isValidRequest) return null
    const provider = getRpcProvider(this.rpcUrl)
    const {
      componentQuotes,
      indexToken,
      indexTokenSymbol,
      indexTokenAmount,
      inputOutputToken,
      inputOutputTokenSymbol,
      inputOutputTokenAmount,
      isMinting,
    } = request
    const network = await provider.getNetwork()
    const chainId = network.chainId
    const inputOutputTokenIsEth = inputOutputTokenSymbol === 'ETH'
    const issuanceModule = getIssuanceModule(indexTokenSymbol, chainId)
    const contract = getFlashMintZeroExContractForToken(
      indexTokenSymbol,
      provider,
    )
    if (isMinting) {
      if (inputOutputTokenIsEth) {
        return await contract.populateTransaction.issueExactSetFromETH(
          indexToken,
          indexTokenAmount,
          componentQuotes,
          issuanceModule.address,
          issuanceModule.isDebtIssuance,
          { value: inputOutputTokenAmount },
        )
      } else {
        return await contract.populateTransaction.issueExactSetFromToken(
          indexToken,
          inputOutputToken,
          indexTokenAmount,
          inputOutputTokenAmount, // _maxAmountInputToken
          componentQuotes,
          issuanceModule.address,
          issuanceModule.isDebtIssuance,
        )
      }
    } else {
      if (inputOutputTokenIsEth) {
        return await contract.populateTransaction.redeemExactSetForETH(
          indexToken,
          indexTokenAmount,
          inputOutputTokenAmount, // _minEthReceive
          componentQuotes,
          issuanceModule.address,
          issuanceModule.isDebtIssuance,
        )
      } else {
        return await contract.populateTransaction.redeemExactSetForToken(
          indexToken,
          inputOutputToken,
          indexTokenAmount,
          inputOutputTokenAmount, // _minOutputReceive
          componentQuotes,
          issuanceModule.address,
          issuanceModule.isDebtIssuance,
        )
      }
    }
  }

  private isValidRequest(request: FlashMintZeroExBuildRequest): boolean {
    if (isEmptyString(request.indexToken)) return false
    if (isEmptyString(request.inputOutputToken)) return false
    if (isInvalidAmount(request.indexTokenAmount)) return false
    if (isInvalidAmount(request.inputOutputTokenAmount)) return false
    if (request.componentQuotes.length === 0) return false
    return true
  }
}
