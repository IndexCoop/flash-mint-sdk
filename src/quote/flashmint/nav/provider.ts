import { BigNumber } from '@ethersproject/bignumber'
import { Address } from 'viem'

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
import { getExpectedReserveRedeemQuantity } from 'utils/custom-oracle-nav-issuance-module'
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const usdc = USDC.address!

    const swapQuoteRequest = {
      chainId,
      inputToken: isMinting ? inputToken.address : usdc,
      outputToken: isMinting ? usdc : outputToken.address,
      inputAmount: inputTokenAmount.toString(),
      // TODO:
      sources: [Exchange.UniV3],
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
      if (!isMinting) {
        const indexToken = isMinting ? outputToken.address : inputToken.address
        // When redeeming we need to swap the reserve asset (USDC) for the user's
        // chosen output token (ex. WETH). So the `inputAmount` determines how
        // much USDC we need to swap into WETH.
        const usdcAmountToSwap = await getExpectedReserveRedeemQuantity(
          indexToken as Address,
          usdc as Address,
          inputTokenAmount.toBigInt()
        )
        swapQuoteRequest.inputAmount = usdcAmountToSwap.toString()
      }
      const res = await this.swapQuoteProvider.getSwapQuote(swapQuoteRequest)
      if (!res || !res?.swapData) return null
      reserveAssetSwapData = {
        ...res.swapData,
        poolIds: [],
      }
    }

    let estimatedOutputAmount: BigNumber = BigNumber.from(0)
    const provider = getRpcProvider(this.rpcUrl)
    const contract = getFlashMintNavContract(provider)
    if (isMinting) {
      estimatedOutputAmount = await contract.callStatic.getIssueAmount(
        outputToken.address,
        inputToken.address,
        inputTokenAmount,
        reserveAssetSwapData
      )
    } else {
      estimatedOutputAmount = await contract.callStatic.getRedeemAmountOut(
        inputToken.address,
        inputTokenAmount,
        outputToken.address,
        reserveAssetSwapData
      )
    }
    const outputTokenAmount = slippageAdjustedTokenAmount(
      estimatedOutputAmount,
      outputToken.decimals,
      slippage,
      // Usually, this function is used to have either input/output amount slippage
      // adjusted but since FlastMintNav only uses an input amount, we always have
      // the output amount as result. So we always want to substract slippage.
      false
    )
    return {
      inputTokenAmount,
      outputTokenAmount,
      reserveAssetSwapData,
    }
  }
}
