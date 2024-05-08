import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'
import { bytesToBigInt, fromHex, Hex } from 'viem'

import { Exchange, getFlashMintLeveragedContractForToken } from 'utils'

import { FlashMintLeveragedExtendedQuoteRequest } from '../provider'

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
const chainId = 42161

export async function getIndexTokenAmount(
  request: FlashMintLeveragedExtendedQuoteRequest,
  provider: JsonRpcProvider
): Promise<BigNumber> {
  const { inputToken, inputTokenAmount, outputToken } = request
  const indexToken = outputToken.address
  const isInputTokenEth = request.inputToken.symbol === 'ETH'
  // TODO: can this be zero?
  const minIndexTokenAmount = BigInt('1000000000000')
  const swapDataDebtToCollateral = {
    path: [
      '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    ],
    fees: [500],
    pool: ADDRESS_ZERO,
    exchange: Exchange.UniV3,
  }
  const priceEstimateInflator = BigInt('900000000000000000')
  const maxDust = BigNumber.from(
    ((inputTokenAmount.toBigInt() * BigInt('10000')) / BigInt('1000000')) // * 0.01%
      .toString()
  )
  const contract = getFlashMintLeveragedContractForToken(
    outputToken.symbol,
    provider,
    chainId
  )
  if (isInputTokenEth) {
    const swapDataInputTokenToCollateral = {
      path: [],
      fees: [],
      pool: ADDRESS_ZERO,
      exchange: Exchange.None,
    }
    const amount: BigNumber = await contract.callStatic.issueSetFromExactETH(
      indexToken,
      minIndexTokenAmount,
      swapDataDebtToCollateral,
      swapDataInputTokenToCollateral,
      priceEstimateInflator,
      maxDust,
      { value: inputTokenAmount }
    )
    console.log('amount:', amount.toString())
    return BigNumber.from(0)
  } else {
    const swapDataInputTokenToCollateral = {
      path: [inputToken.address, '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
      fees: [500],
      pool: ADDRESS_ZERO,
      exchange: Exchange.None,
    }
    const tx = await contract.populateTransaction.issueSetFromExactERC20(
      indexToken,
      minIndexTokenAmount,
      inputToken,
      inputTokenAmount,
      swapDataDebtToCollateral,
      swapDataInputTokenToCollateral,
      [],
      priceEstimateInflator,
      maxDust
    )
    const res = await provider.call(tx)
    const bytes = fromHex(res as Hex, 'bytes')
    console.log('amount:', bytesToBigInt(bytes).toString())
    return BigNumber.from(0)
  }
}
