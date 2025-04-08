import { Contract } from '@ethersproject/contracts'
import { isAddressEqual } from '@indexcoop/tokenlists'

import { Contracts } from 'constants/contracts'
import { WETH } from 'constants/tokens'
import { getSellAmount } from 'quote/flashmint/leveraged-zeroex/utils'
import { getRpcProvider } from 'utils/rpc-provider'

import { BigNumber } from '@ethersproject/bignumber'
import type { SwapQuoteProviderV2 } from 'quote/swap'

export class MorphoQuoteProvider {
  readonly taker = Contracts[1].FlashMintHyEthV3
  readonly weth = WETH.address!
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

    const swapQuotePromise = this.swapQuoteOutputProvider?.getSwapQuote({
      chainId: 1,
      inputToken,
      outputToken: this.weth,
      outputAmount: ethAmount.toString(),
      slippage,
      taker: this.taker,
    })

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
    )

    const [swapQuoteResult, sellAmountResult] = await Promise.allSettled([
      swapQuotePromise,
      sellAmountPromise,
    ])

    if (
      swapQuoteResult &&
      swapQuoteResult.status === 'fulfilled' &&
      swapQuoteResult.value !== null &&
      swapQuoteResult.value !== undefined
    ) {
      return BigInt(swapQuoteResult.value.inputAmount)
    }

    if (sellAmountResult.status === 'fulfilled') {
      return sellAmountResult.value.toBigInt()
    }

    return null
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
