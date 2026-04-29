import { ABI, getContract } from 'quote/swap/adapters/static/contracts'
import { encodeFunctionData } from 'viem'

import { buildIssueRedeemParams } from './quote'
import {
  type DexV5ConfigEntry,
  isDexV5Entry,
  type StaticConfigEntry,
} from './swap-data-config'

import type { Address, TransactionRequest } from 'viem'
import type { StaticQuoteRequest } from './'

export function buildTransaction(
  request: StaticQuoteRequest,
  entry: StaticConfigEntry,
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

  if (isDexV5Entry(entry)) {
    return buildDexV5Transaction(
      request,
      entry,
      contractAddress,
      abi,
      quoteAmount,
    )
  }

  const swapDataDebtForCollateral = entry.swapDataDebtForCollateral
  const swapDataInputToken = entry.swapDataInputToken

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
        value: inputAmount,
      }
    }
    const data = encodeFunctionData({
      abi,
      functionName: 'issueExactSetFromERC20',
      args: [
        indexToken.address,
        outputAmount,
        inputToken.address,
        inputAmount,
        swapDataDebtForCollateral,
        swapDataInputToken,
      ],
    })
    return {
      to: contractAddress,
      data,
    }
  }

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
  }
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

function buildDexV5Transaction(
  request: StaticQuoteRequest,
  entry: DexV5ConfigEntry,
  contractAddress: Address,
  abi: unknown,
  quoteAmount: bigint,
): TransactionRequest {
  const {
    inputAmount,
    outputAmount,
    inputToken,
    isMinting,
    outputToken,
  } = request
  const indexToken = isMinting ? outputToken : inputToken
  const indexTokenAmount = isMinting
    ? BigInt(outputAmount.toString())
    : BigInt(inputAmount.toString())
  const issueRedeemParams = buildIssueRedeemParams(
    indexToken.address as Address,
    indexTokenAmount,
    isMinting,
    entry,
  )

  if (isMinting) {
    if (inputToken.symbol === 'ETH') {
      const data = encodeFunctionData({
        abi: abi as any,
        functionName: 'issueExactSetFromETH',
        args: [issueRedeemParams, BigInt(0)],
      })
      return { to: contractAddress, data, value: inputAmount }
    }
    const paymentInfo = {
      token: inputToken.address as Address,
      limitAmt: BigInt(inputAmount.toString()),
      swapDataTokenToWeth: entry.swapDataInputToWeth,
      swapDataWethToToken: entry.swapDataWethToInput,
    }
    const data = encodeFunctionData({
      abi: abi as any,
      functionName: 'issueExactSetFromERC20',
      args: [issueRedeemParams, paymentInfo, BigInt(0)],
    })
    return { to: contractAddress, data }
  }

  if (outputToken.symbol === 'ETH') {
    const data = encodeFunctionData({
      abi: abi as any,
      functionName: 'redeemExactSetForETH',
      args: [issueRedeemParams, quoteAmount],
    })
    return { to: contractAddress, data }
  }
  const paymentInfo = {
    token: outputToken.address as Address,
    limitAmt: quoteAmount,
    swapDataTokenToWeth: entry.swapDataInputToWeth,
    swapDataWethToToken: entry.swapDataWethToInput,
  }
  const data = encodeFunctionData({
    abi: abi as any,
    functionName: 'redeemExactSetForERC20',
    args: [issueRedeemParams, paymentInfo],
  })
  return { to: contractAddress, data }
}

