import { ABI, getContract } from 'quote/swap/adapters/static/contracts'
import { encodeFunctionData } from 'viem'

import type { SwapData, SwapDataV5 } from 'utils'
import type { Address, TransactionRequest } from 'viem'
import type { StaticProviderQuoteRequest } from './'

export function buildTransaction(
  request: StaticProviderQuoteRequest,
  swapDataDebtForCollateral: SwapData | SwapDataV5,
  swapDataInputToken: SwapData | SwapDataV5,
  quoteAmount: bigint,
): TransactionRequest {
  const {
    chainId,
    inputAmount,
    outputAmount,
    inputToken,
    isMinting,
    outputToken,
  } = request

  const indexToken = isMinting ? outputToken : inputToken
  const contractAddress = getContract(chainId, indexToken.address as Address)
  const abi = ABI[contractAddress]

  if (isMinting) {
    if (inputToken.symbol === 'ETH') {
      const data = encodeFunctionData({
        abi,
        functionName: 'issueExactSetFromETH',
        args: [
          indexToken.address,
          outputAmount,
          swapDataDebtForCollateral,
          swapDataInputToken,
        ],
      })
      return {
        to: contractAddress,
        data,
        value: quoteAmount,
      }
    } else {
      const data = encodeFunctionData({
        abi,
        functionName: 'issueExactSetFromERC20',
        args: [
          indexToken.address,
          outputAmount,
          inputToken.address,
          quoteAmount,
          swapDataDebtForCollateral,
          swapDataInputToken,
        ],
      })
      return {
        to: contractAddress,
        data,
      }
    }
  } else {
    if (outputToken.symbol === 'ETH') {
      const data = encodeFunctionData({
        abi,
        functionName: 'redeemExactSetForETH',
        args: [
          indexToken.address,
          inputAmount,
          quoteAmount,
          swapDataDebtForCollateral,
          swapDataInputToken,
        ],
      })
      return {
        to: contractAddress,
        data,
      }
    } else {
      const data = encodeFunctionData({
        abi,
        functionName: 'redeemExactSetForERC20',
        args: [
          indexToken.address,
          inputAmount,
          outputToken.address,
          quoteAmount,
          swapDataDebtForCollateral,
          swapDataInputToken,
        ],
      })
      return {
        to: contractAddress,
        data,
      }
    }
  }
}
