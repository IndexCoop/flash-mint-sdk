import { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { getFlashMintZeroExContractForToken } from '../../utils/contracts'
import { getIssuanceModule } from '../../utils/issuanceModules'
import { TransactionBuilder } from './interface'
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
  implements
    TransactionBuilder<FlashMintZeroExBuildRequest, TransactionRequest>
{
  constructor(private readonly provider: JsonRpcProvider) {}

  async build(
    request: FlashMintZeroExBuildRequest
  ): Promise<TransactionRequest | null> {
    const isValidRequest = this.isValidRequest(request)
    if (!isValidRequest) return null
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
    const network = await this.provider.getNetwork()
    const chainId = network.chainId
    const inputOutputTokenIsEth = inputOutputTokenSymbol === 'ETH'
    const issuanceModule = getIssuanceModule(indexTokenSymbol, chainId)
    const contract = getFlashMintZeroExContractForToken(
      indexTokenSymbol,
      this.provider,
      chainId
    )
    if (isMinting) {
      if (inputOutputTokenIsEth) {
        return await contract.populateTransaction.issueExactSetFromETH(
          indexToken,
          indexTokenAmount,
          componentQuotes,
          issuanceModule.address,
          issuanceModule.isDebtIssuance,
          { value: inputOutputTokenAmount }
        )
      } else {
        return await contract.populateTransaction.issueExactSetFromToken(
          indexToken,
          inputOutputToken,
          indexTokenAmount,
          inputOutputTokenAmount, // _maxAmountInputToken
          componentQuotes,
          issuanceModule.address,
          issuanceModule.isDebtIssuance
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
          issuanceModule.isDebtIssuance
        )
      } else {
        return await contract.populateTransaction.redeemExactSetForToken(
          indexToken,
          inputOutputToken,
          indexTokenAmount,
          inputOutputTokenAmount, // _minOutputReceive
          componentQuotes,
          issuanceModule.address,
          issuanceModule.isDebtIssuance
        )
      }
    }
  }

  private isValidRequest(request: FlashMintZeroExBuildRequest): boolean {
    const {
      componentQuotes,
      indexToken,
      indexTokenAmount,
      inputOutputToken,
      inputOutputTokenAmount,
    } = request
    if (isEmptyString(indexToken)) return false
    if (isEmptyString(inputOutputToken)) return false
    if (isInvalidAmount(indexTokenAmount)) return false
    if (isInvalidAmount(inputOutputTokenAmount)) return false
    if (componentQuotes.length === 0) return false
    return true
  }
}
