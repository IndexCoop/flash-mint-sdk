import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { getTokenData, getTokenDataByAddress } from '@indexcoop/tokenlists'
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import { ChainId, Token, TradeType } from '@uniswap/sdk-core'
import { Address, encodePacked } from 'viem'

import { AddressZero, EthAddress } from 'constants/addresses'
import {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'
import { getRpcProvider } from 'utils/rpc-provider'
import { Exchange, isSameAddress } from 'utils'

import { getPath } from './utils/path'
import { getPool } from './utils/pools'

const QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'

function encodePathV3(
  path: string[],
  fees: number[],
  reverseOrder: boolean
): string {
  if (reverseOrder) {
    let encodedPath = encodePacked(
      ['address'],
      [path[path.length - 1] as Address]
    )
    for (let i = 0; i < fees.length; i++) {
      const index = fees.length - i - 1
      encodedPath = encodePacked(
        ['bytes', 'uint24', 'address'],
        [encodedPath as `0x${string}`, fees[index], path[index] as Address]
      )
      console.log(encodedPath, i)
    }
    return encodedPath
  }
  let encodedPath = encodePacked(['address'], [path[0] as Address])
  console.log(encodedPath)
  for (let i = 0; i < fees.length; i++) {
    encodedPath = encodePacked(
      ['bytes', 'uint24', 'address'],
      [encodedPath as `0x${string}`, fees[i], path[i + 1] as Address]
    )
    console.log(encodedPath, i)
  }
  return encodedPath
}

export class UniswapSwapQuoteProvider implements SwapQuoteProvider {
  constructor(readonly rpcUrl: string) {}

  getQuoterContract() {
    const rpcProvider = getRpcProvider(this.rpcUrl)
    return new Contract(QUOTER_CONTRACT_ADDRESS, Quoter.abi, rpcProvider)
  }

  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null> {
    const {
      chainId,
      inputAmount,
      inputToken,
      outputAmount,
      outputToken,
      slippage,
    } = request

    // TODO: if input/output token is ETH, change to WETH
    if (
      isSameAddress(inputToken, EthAddress) ||
      isSameAddress(outputToken, EthAddress)
    ) {
      // FIXME: remove for production, just for runnint tests and catching any of these cases
      throw new Error('Error - using ETH instead of WETH')
    }

    if (!inputAmount && !outputAmount) {
      throw new Error('Error - either input or output amount must be set')
    }

    const weth = getTokenData('WETH', chainId)
    const inputTokenData = getTokenDataByAddress(inputToken, chainId)
    const outputTokenData = getTokenDataByAddress(outputToken, chainId)

    if (!inputTokenData || !outputTokenData || !weth) {
      throw new Error('Error - either input or output token is invalid')
    }

    try {
      const isExactOutput = outputAmount !== undefined
      const path = getPath(inputToken, outputToken)
      // TODO: fees/pools
      const fees = path.length === 3 ? [500, 500] : [500]
      const encodedPath = encodePathV3(path, fees, isExactOutput)
      let quotedAmount: BigNumber = BigNumber.from(0)
      const quoterContract = this.getQuoterContract()
      if (isExactOutput) {
        quotedAmount = await quoterContract.callStatic.quoteExactOutput(
          encodedPath,
          BigNumber.from(outputAmount)
        )
      } else {
        quotedAmount = await quoterContract.callStatic.quoteExactInput(
          encodedPath,
          BigNumber.from(inputAmount)
        )
      }
      return {
        chainId,
        inputToken,
        outputToken,
        inputAmount: (
          inputAmount ??
          quotedAmount ??
          BigNumber.from(0)
        )?.toString(),
        outputAmount: (
          outputAmount ??
          quotedAmount ??
          BigNumber.from(0)
        )?.toString(),
        callData: '0x', // TOOD: result.transactionRequest?.data ?? '0x',
        slippage: slippage ?? 0,
        swapData: {
          exchange: Exchange.UniV3,
          path,
          fees,
          // For UniV3 swap data the contract only needs the path and the fees
          pool: AddressZero,
        },
      }
    } catch (error) {
      console.log('Error getting Uniswap swap quote:')
      console.log(error)
      return null
    }
  }
}
