import { BigNumber } from '@ethersproject/bignumber'

import { AddressZero } from 'constants/addresses'
import { USDC } from 'constants/tokens'
import { SwapQuoteProvider } from 'quote/swap'
import {
  Exchange,
  getFlashMintNavContract,
  isSameAddress,
  slippageAdjustedTokenAmount,
  SwapDataV3,
} from 'utils'
import { getRpcProvider } from 'utils/rpc-provider'

import { QuoteProvider, QuoteToken } from '../../interfaces'

export interface FlashMintNavQuoteRequest {
  chainId: number
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  // In contrast to other quote providers, we always need the input amount (not the index amount)
  inputTokenAmount: BigNumber
  slippage: number
}

export interface FlashMintNavQuoteQuote {
  inputTokenAmount: BigNumber
  outputTokenAmount: BigNumber
  reserveAssetSwapData: SwapDataV3
}

export class FlashMintNavQuoteProvider
  implements QuoteProvider<FlashMintNavQuoteRequest, FlashMintNavQuoteQuote>
{
  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProvider
  ) {}

  async getQuote(
    request: FlashMintNavQuoteRequest
  ): Promise<FlashMintNavQuoteQuote | null> {
    const {
      chainId,
      inputToken,
      inputTokenAmount,
      isMinting,
      outputToken,
      slippage,
    } = request

    const indexToken = isMinting ? outputToken : inputToken
    const usdc = USDC.address!

    const swapQuoteRequest = {
      chainId,
      inputToken: isMinting ? inputToken.address : usdc,
      outputToken: isMinting ? usdc : outputToken.address,
      // TODO:
      inputAmount: inputTokenAmount.toString(),
      // TODO:
      // sources: [Exchange.UniV3],
      slippage,
    }
    console.log(swapQuoteRequest)

    let reserveAssetSwapData: SwapDataV3 = {
      exchange: Exchange.None,
      fees: [],
      path: [],
      poolIds: [],
      pool: AddressZero,
    }
    if (
      !isSameAddress(swapQuoteRequest.inputToken, swapQuoteRequest.outputToken)
    ) {
      const res = await this.swapQuoteProvider.getSwapQuote(swapQuoteRequest)
      console.log(res)
      if (!res?.swapData) return null
      reserveAssetSwapData = {
        ...res.swapData,
        poolIds: [],
      }
    }

    let estimatedInputOutputAmount: BigNumber = BigNumber.from(0)
    const provider = getRpcProvider(this.rpcUrl)
    const contract = getFlashMintNavContract(provider)
    if (isMinting) {
      estimatedInputOutputAmount = await contract.callStatic.getIssueAmount(
        indexToken.address,
        inputToken.address,
        inputTokenAmount,
        reserveAssetSwapData
      )
    } else {
      estimatedInputOutputAmount = await contract.callStatic.getRedeemAmountOut(
        indexToken.address,
        inputTokenAmount,
        outputToken.address,
        reserveAssetSwapData
      )
    }
    const outputTokenAmount = slippageAdjustedTokenAmount(
      estimatedInputOutputAmount,
      isMinting ? outputToken.decimals : inputToken.decimals,
      slippage,
      isMinting
    )
    return {
      inputTokenAmount,
      outputTokenAmount,
      reserveAssetSwapData,
    }
  }
}
