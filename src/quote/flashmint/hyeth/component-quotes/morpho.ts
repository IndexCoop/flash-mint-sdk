import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'

import { Contracts } from 'constants/contracts'
import { getSellAmount } from 'quote/flashmint/leveraged-zeroex/utils'
import { getRpcProvider } from 'utils/rpc-provider'

import type { SwapQuoteProviderV2, ZeroExV2SwapQuoteProvider } from 'quote/swap'

export class MorphoQuoteProvider {
  readonly taker = Contracts[1].FlashMintHyEthV3
  readonly weth = getTokenByChainAndSymbol(1, 'WETH').address
  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProviderV2,
    private readonly swapQuoteOutputProvider?: SwapQuoteProviderV2,
  ) {}

  getTokenContract(address: string): Contract {
    const provider = getRpcProvider(this.rpcUrl)
    const abi = [
      'function previewMint(uint256 shares) public view returns (uint256)',
      'function previewRedeem(uint256 shares) public view returns (uint256)',
    ]
    return new Contract(address, abi, provider)
  }

  async getMintQuote(
    component: string,
    position: bigint,
    inputToken: string,
    inputAmount: bigint,
    slippage: number,
  ): Promise<bigint | null> {
    const tokenContract = this.getTokenContract(component)
    const ethAmount: BigNumber = await tokenContract.previewMint(position)

    if (isAddressEqual(inputToken, this.weth)) return ethAmount.toBigInt()

    let swapQuotePromise = null
    if (this.swapQuoteOutputProvider) {
      swapQuotePromise = this.swapQuoteOutputProvider.getSwapQuote({
        chainId: 1,
        inputToken,
        outputToken: this.weth,
        outputAmount: ethAmount.toString(),
        slippage,
        taker: this.taker,
      })
    }

    const targetBuyAmount = ethAmount.mul(1001).div(1000)
    const minBuyAmount = ethAmount
    const maxBuyAmount = ethAmount.mul(1005).div(1000)

    const maxSellAmount = BigNumber.from(inputAmount.toString())

    const sellAmountPromise = getSellAmount(
      1,
      inputToken,
      this.weth,
      targetBuyAmount,
      minBuyAmount,
      maxBuyAmount,
      maxSellAmount,
      this.swapQuoteProvider as ZeroExV2SwapQuoteProvider,
    )

    const swapQuote = await swapQuotePromise
    if (swapQuote?.inputAmount != null) {
      return BigInt(swapQuote.inputAmount)
    }

    const sellAmount = await sellAmountPromise
    if (sellAmount === null) return null
    return sellAmount.toBigInt()
  }

  async getRedeemQuote(
    component: string,
    position: bigint,
    outputToken: string,
    slippage: number,
  ): Promise<bigint | null> {
    const { taker } = this
    const tokenContract = this.getTokenContract(component)
    const ethAmount: BigNumber = await tokenContract.previewRedeem(position)
    if (isAddressEqual(outputToken, this.weth)) return ethAmount.toBigInt()
    const quote = await this.swapQuoteProvider.getSwapQuote({
      chainId: 1,
      inputToken: this.weth,
      outputToken,
      inputAmount: ethAmount.toString(),
      slippage,
      taker,
    })
    if (!quote) return null
    return BigInt(quote.outputAmount)
  }
}
