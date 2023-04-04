import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'
import { utils } from 'ethers'

import {
  ComponentSwapData,
  getIssuanceComponentSwapData,
  getRedemptionComponentSwapData,
} from '../../utils/componentSwapData'
import { getFlashMintWrappedContract } from '../../utils/contracts'
import { slippageAdjustedTokenAmount } from '../../utils/slippage'
import { ComponentWrapData, getWrapData } from '../../utils/wrapData'
import { QuoteProvider } from '../quoteProvider'
import { QuoteToken } from '../quoteToken'

export interface FlashMintWrappedQuoteRequest {
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: BigNumber
  slippage: number
}

export interface FlashMintWrappedQuote {
  componentSwapData: ComponentSwapData[]
  componentWrapData: ComponentWrapData[]
  indexTokenAmount: BigNumber
  inputOutputTokenAmount: BigNumber
}

export class WrappedQuoteProvider
  implements QuoteProvider<FlashMintWrappedQuoteRequest, FlashMintWrappedQuote>
{
  constructor(private readonly provider: JsonRpcProvider) {}

  async getQuote(
    request: FlashMintWrappedQuoteRequest
  ): Promise<FlashMintWrappedQuote | null> {
    const { provider } = this
    const { inputToken, indexTokenAmount, isMinting, outputToken, slippage } =
      request
    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenSymbol = indexToken.symbol
    const componentSwapData = isMinting
      ? await getIssuanceComponentSwapData(
          indexTokenSymbol,
          indexToken.address,
          inputToken.address,
          indexTokenAmount,
          provider
        )
      : await getRedemptionComponentSwapData(
          indexTokenSymbol,
          indexToken.address,
          outputToken.address,
          indexTokenAmount,
          provider
        )
    const componentWrapData = getWrapData(indexToken.symbol)
    if (componentSwapData.length !== componentSwapData.length) return null
    let estimatedInputOutputAmount: BigNumber = BigNumber.from(0)
    // componentSwapData.forEach((swapData) => {
    //   console.log(swapData.dexData)
    //   const encodedPath = encodePath(
    //     swapData.dexData.path,
    //     swapData.dexData.fees,
    //     false
    //   )
    //   console.log(encodedPath)
    //   console.log(extractPoolFees(encodedPath))
    // })
    if (isMinting) {
      estimatedInputOutputAmount = await getIssueExactSet(
        indexToken.address,
        inputToken.address,
        indexTokenAmount,
        componentSwapData,
        provider
      )
    }

    // Temporarily disabled
    // const contract = getFlashMintWrappedContract(provider)
    // if (isMinting) {
    //   estimatedInputOutputAmount = await contract.callStatic.getIssueExactSet(
    //     indexToken.address,
    //     inputToken.address,
    //     indexTokenAmount,
    //     componentSwapData
    //   )
    // } else {
    //   estimatedInputOutputAmount = await contract.callStatic.getRedeemExactSet(
    //     indexToken.address,
    //     outputToken.address,
    //     indexTokenAmount,
    //     componentSwapData
    //   )
    // }
    const inputOutputTokenAmount = slippageAdjustedTokenAmount(
      estimatedInputOutputAmount,
      isMinting ? inputToken.decimals : outputToken.decimals,
      slippage,
      isMinting
    )
    console.log(estimatedInputOutputAmount.toString(), 'estimate')
    console.log(inputOutputTokenAmount.toString(), 'slippage adjusted')
    const quote: FlashMintWrappedQuote = {
      componentSwapData,
      componentWrapData,
      indexTokenAmount,
      inputOutputTokenAmount,
    }
    return quote
  }
}

// Temporarily calc exact set on client-side.
// Since this is temporary code was left in this file to be quickly removed again
// once obsolete.

async function getIssueExactSet(
  indexToken: string,
  inputToken: string,
  indexTokenAmount: BigNumber,
  componentSwapData: ComponentSwapData[],
  provider: JsonRpcProvider
): Promise<BigNumber> {
  const promises = componentSwapData.map((swapData) => {
    if (inputToken === swapData.underlyingERC20) {
      return Promise.resolve(swapData.buyUnderlyingAmount)
    } else {
      // const { buyUnderlyingAmount, dexData, underlyingERC20 } = swapData
      // const encodedPath = encodePath(dexData.path, dexData.fees, false)
      // return getAmountIn(encodedPath, buyUnderlyingAmount, provider)
      return getAmountIn2(swapData, provider)
    }
  })
  const amounts = await Promise.all(promises)
  return amounts.reduce((sum, current) => sum.add(current), BigNumber.from(0))
}
/**
 * Returns encoded Uniswap path for given data.
 * @param path        Uniswap path as string array
 * @param fees        Fees as number array
 * @param exactInput  Boolean to determine exact input/output
 * @returns encoded path as string
 */
function encodePath(
  path: string[],
  fees: number[],
  exactInput: boolean
): string {
  const FEE_SIZE = 6
  if (path.length !== fees.length + 1) {
    throw new Error('path/fee lengths do not match')
  }
  if (!exactInput) {
    path = path.reverse()
    fees = fees.reverse()
  }
  let encoded = '0x'
  for (let i = 0; i < fees.length; i++) {
    encoded += path[i].slice(2)
    const fee = utils.hexValue(fees[i]).slice(2).toString()
    encoded += fee.padStart(FEE_SIZE, '0')
  }
  encoded += path[path.length - 1].slice(2)
  return encoded
}

const UniV3Quoter = '0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6'
const UniV3QuoterAbi = [
  'function quoteExactOutput(bytes path, uint256 amountOut) external returns (uint256 amountIn)',
  'function quoteExactOutputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountOut, uint160 sqrtPriceLimitX96) external returns (uint256 amountIn)',
]
async function getAmountIn(
  encodedPath: string,
  amountOut: BigNumber,
  provider: JsonRpcProvider
): Promise<BigNumber> {
  // console.log('getAmountIn', amountOut.toString(), encodedPath)
  const contract = new Contract(UniV3Quoter, UniV3QuoterAbi, provider)
  const estimate: BigNumber = await contract.callStatic.quoteExactOutput(
    encodedPath,
    amountOut
  )
  return estimate
}

async function getAmountIn2(
  componentSwapData: ComponentSwapData,
  provider: JsonRpcProvider
): Promise<BigNumber> {
  const { buyUnderlyingAmount, dexData } = componentSwapData
  const { fees, path } = dexData
  const contract = new Contract(UniV3Quoter, UniV3QuoterAbi, provider)
  if (path.length === 2) {
    const estimate: BigNumber =
      await contract.callStatic.quoteExactOutputSingle(
        path[0],
        path[1],
        fees[0],
        buyUnderlyingAmount,
        0
      )
    return estimate
  }
  // First check how much WETH we need to get the amountOut
  const path1 = { ...path.slice(1) }
  // Then check how much of the provided token is needed to swap for WETH
  const path2 = { ...path.slice(0, 2) }
  const estimateWETHAmountIn: BigNumber =
    await contract.callStatic.quoteExactOutputSingle(
      path1[0],
      path1[1],
      fees[1],
      buyUnderlyingAmount,
      0
    )
  const estimateAmountIn: BigNumber =
    await contract.callStatic.quoteExactOutputSingle(
      path2[0],
      path2[1],
      fees[0],
      estimateWETHAmountIn,
      0
    )
  return estimateAmountIn
}
