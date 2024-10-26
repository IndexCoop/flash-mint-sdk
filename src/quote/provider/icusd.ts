import { BigNumber } from '@ethersproject/bignumber'

import { TheUSDCYieldIndex } from 'constants/tokens'
import {
  FlashMintNavTransactionBuilder,
  FlashMintWrappedBuildRequest,
  WrappedTransactionBuilder,
} from 'flashmint'
import { createClient } from 'utils/clients'
import { getExpectedReserveRedeemQuantity } from 'utils/custom-oracle-nav-issuance-module'
import { Address, parseAbi } from 'viem'

import { FlashMintNavQuoteProvider } from '../flashmint/nav'
import { WrappedQuoteProvider } from '../flashmint/wrapped'
import { QuoteProvider, QuoteToken } from '../interfaces'
import {
  FlashMintContractType,
  FlashMintQuote,
  FlashMintQuoteRequest,
} from '../provider'
import { SwapQuoteProvider } from '../swap'
import { buildQuoteResponse } from './utils'

export interface IcUsdQuoteRequest extends FlashMintQuoteRequest {
  chainId: number
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: BigNumber
  // FlashMintNav always needs the input amount
  inputTokenAmount: BigNumber
  slippage: number
}

export class IcUsdQuoteRouter
  implements QuoteProvider<IcUsdQuoteRequest, FlashMintQuote>
{
  icUsd = TheUSDCYieldIndex
  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProvider
  ) {}

  async getQuote(request: IcUsdQuoteRequest): Promise<FlashMintQuote | null> {
    if (request.isMinting) {
      return await this.getFlashMintNavQuote(request)
    } else {
      const { chainId, indexTokenAmount, inputTokenAmount } = request
      const usdcInputAmount = await getExpectedReserveRedeemQuantity(
        this.icUsd.address as Address,
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        indexTokenAmount.toBigInt()
      )
      const usdcBalance = await this.getUsdcBalance(chainId)
      console.log(usdcBalance.toString(), 'USDC')
      // 80% of the USDC balance of icUSD
      const threshold = (usdcBalance * 80n) / 100n
      const useFlashMintNav = usdcInputAmount < threshold
      console.log(
        'useFlashMintNav',
        useFlashMintNav,
        inputTokenAmount.toString(),
        '->',
        usdcInputAmount.toString(),
        'usdcInputAmount',
        threshold.toString(),
        'threshold',
        usdcBalance.toString(),
        'icUSD USD balance'
      )
      if (useFlashMintNav) return await this.getFlashMintNavQuote(request)
      return await this.getFlashMintWrappedQuote(request)
    }
  }

  private async getUsdcBalance(chainId: number) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const publicClient = createClient(chainId)!
    const amount: bigint = (await publicClient.readContract({
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      abi: parseAbi([
        'function balanceOf(address account) view returns (uint256)',
      ]),
      functionName: 'balanceOf',
      args: ['0x54EE8A49155F701F0d5Ff088CD36fbBF1a5B9f44'],
    })) as bigint
    return amount
  }

  private async getFlashMintNavQuote(request: IcUsdQuoteRequest) {
    const { chainId, inputToken, isMinting, outputToken } = request
    const flashMintNavQuoteProvider = new FlashMintNavQuoteProvider(
      this.rpcUrl,
      this.swapQuoteProvider
    )
    const fmNavQuote = await flashMintNavQuoteProvider.getQuote({
      ...request,
    })
    if (!fmNavQuote) return null
    const builder = new FlashMintNavTransactionBuilder(this.rpcUrl)
    const txRequest = {
      isMinting,
      inputToken: inputToken.address,
      inputTokenSymbol: inputToken.symbol,
      outputToken: outputToken.address,
      outputTokenSymbol: outputToken.symbol,
      inputTokenAmount: fmNavQuote.inputTokenAmount,
      outputTokenAmount: fmNavQuote.outputTokenAmount,
      reserveAssetSwapData: fmNavQuote.reserveAssetSwapData,
    }
    const tx = await builder.build(txRequest)
    if (!tx) return null
    return buildQuoteResponse(
      request,
      chainId,
      FlashMintContractType.nav,
      isMinting ? fmNavQuote.inputTokenAmount : fmNavQuote.outputTokenAmount,
      tx
    )
  }

  private async getFlashMintWrappedQuote(request: IcUsdQuoteRequest) {
    const { chainId, indexTokenAmount, inputToken, isMinting, outputToken } =
      request
    const indexToken = isMinting ? outputToken : inputToken
    const inputOutputToken = isMinting ? inputToken : outputToken
    const wrappedQuoteProvider = new WrappedQuoteProvider(
      this.rpcUrl,
      this.swapQuoteProvider
    )
    const wrappedQuote = await wrappedQuoteProvider.getQuote({
      ...request,
      chainId,
    })
    if (!wrappedQuote) return null
    const builder = new WrappedTransactionBuilder(this.rpcUrl)
    const txRequest: FlashMintWrappedBuildRequest = {
      isMinting,
      indexToken: indexToken.address,
      indexTokenAmount,
      inputOutputToken: inputOutputToken.address,
      inputOutputTokenSymbol: inputOutputToken.symbol,
      inputOutputTokenAmount: wrappedQuote.inputOutputTokenAmount,
      componentSwapData: wrappedQuote.componentSwapData,
      componentWrapData: wrappedQuote.componentWrapData,
    }
    const tx = await builder.build(txRequest)
    if (!tx) return null
    return buildQuoteResponse(
      request,
      chainId,
      FlashMintContractType.wrapped,
      wrappedQuote.inputOutputTokenAmount,
      tx
    )
  }
}
